# Agent Tools Roadmap

Phased plan for expanding Art's agent with external/local capabilities.
Each phase is independently shippable. Phases 0–4 build on the consent layer;
Phase -1 is independent UI work that can land anytime.

## Phase -1 — Tool Call UX & Agent Autonomy

Three upgrades before any new tools land. -1a/-1b are UI; -1c is loop control.

### -1a. Inline, in-order tool calls

Tool calls currently render inside `ThinkingSection`, above all text
(`assistant.tsx:59`). Order is lost because `Message.content` is a flat string
(`session/types.ts:37`) and `toolCalls` is a separate array.

**Change the message model to ordered parts:**

- `Message.content: string` → `Message.parts: MessagePart[]`, where
  `MessagePart = { type: "text", text } | { type: "tool-call", ...ToolCallBlock }`.
- `stream-accumulator.ts:25` — append text deltas and tool-call events to a
  single ordered `parts` array (interleaved as they arrive), keep `toolCalls`
  as a derived flat view for compatibility.
- `assistant.tsx` / `renderer.tsx` — walk `parts` and render text blocks and
  `ToolCallCard` inline in sequence.
- Migration in `use-session-store.tsx` (bump version): old messages become a
  single text part followed by their tool calls (preserves current appearance).
- `session.ts` (`create_page_from_session`) and `generate-session-title` keep
  working via a `messageText(message)` helper that joins text parts.

### -1b. Prompt activity bar

A compact strip above the prompt input showing live tool activity while
streaming (`prompt.tsx:62`).

- New `src/components/chat/prompt/activity-bar.tsx`.
- Data: `state.snapshot.toolCalls` from `ChatProvider` (already accumulates
  live tool calls, `chat-context.tsx:186-192`).
- Render: one row per tool call — spinning icon + `toolName` while executing,
  check + summary when done; collapse to a single "N tools running…" line when
  more than ~3. Reuse `ToolCallCard` icons/expand behavior in compact mode.
- Hide entirely when the snapshot has no tool calls.

**Files:** `session/types.ts`, `stream-accumulator.ts`, `chat-context.tsx`,
`messages/assistant.tsx`, `messages/renderer.tsx`, `messages/thinking-section.tsx`,
new `messages/parts.tsx` (part renderer), new `prompt/activity-bar.tsx`,
`store/use-session-store.tsx` (migration), `lib/ai/tools/session.ts`.

### -1c. Agent-decided stop condition

Today `stepCountIs(10)` (`presets.ts:18`) is a hard ceiling that can truncate
multi-tool tasks mid-flight. The SDK loop already terminates naturally when the
model replies with text instead of a tool call — so make completion explicit
and agent-driven instead of a fixed count.

**Primary: a `done` tool with no `execute`.** Calling a tool without an
`execute` function terminates the loop, so the agent decides how many steps a
task needs:

```ts
done: tool({
  description:
    "Signal that the task is fully complete. Provide a concise summary of what you did.",
  inputSchema: z.object({ summary: z.string() }),
  // no execute -> the loop stops when this is called
})
```

- `stopWhen: [hasToolCall("done"), stepCountIs(BACKSTOP)]` — agent-driven stop
  first, generous ceiling (e.g. 50) as a runaway backstop.
- System prompt (`prompts/system.ts`): instruct the agent to keep working with
  tools until the task is truly done, then call `done` with a summary; never
  call it prematurely or instead of doing the work.

**Safety net: adaptive `StopCondition`** replacing the blind count:
- **No-progress detector** — stop if the last N steps repeat the same
  tool + input, or produce no new tool results.
- **Token budget** — stop when accumulated `usage` across steps exceeds a
  threshold (per the SDK loop-control docs pattern).
- Keep `isStepCount(BACKSTOP)` as the final backstop.
- Optional: `prepareStep` to inject a "approaching budget, wrap up" nudge one
  step before the backstop instead of a hard cut.

**Streaming/UI handling** (the subtle part):
- A no-`execute` tool emits a `tool-call` but **no `tool-result`**, so
  `ToolCallCard` would spin forever (`tool-call-card.tsx:23`). Special-case
  `done`: render its `summary` as the final assistant text and show the raw
  call as completed, not executing.
- `stream-accumulator.ts` — treat a `done` tool call as terminal for status
  purposes.
- The `done` call slots naturally into the -1a parts model as the terminating
  element; implement -1a first or together.

**Files:** `lib/ai/stream/presets.ts`, new `lib/ai/tools/done.ts`,
`lib/ai/prompts/system.ts`, `stream-accumulator.ts`,
`messages/tool-call-card.tsx`, `messages/assistant.tsx`.

## Phase 0 — Consent infrastructure

Prerequisite for every write/exec tool below. The existing
`ToolApprovalCard` (`tool-approval-card.tsx:28`) is a stub (hardcoded
`console.log`, `isResolving: false`).

**Option A — AI SDK native (`toolApproval`)** — correct and durable:
- Per-tool `toolApproval` map with `'user-approval'` in `presetFor`
  (`presets.ts:11`).
- Handle `tool-approval-request` events in `stream-accumulator.ts`; extend
  `ToolCallBlock` with `approvalId` / `approvalState`.
- On request: persist the intermediate assistant message, render the card, on
  decision append a `tool-approval-response` and re-call `streamText`.
  Requires storing raw SDK response messages for resumption and a system rule
  "do not retry denied tools."

**Option B — Promise gate** — minimal and fast:
- New `use-approval-store`: `requestApproval({ toolCallId, toolName, input }) → Promise<boolean>`.
- Risky `execute` awaits it; the stream simply blocks while pending.
- Wire `ToolApprovalCard` to the store; resolve pending promises on abort.

**Category gating (either option):** extend `SessionCapabilities`
(`session/types.ts:6`), register in `toolsFor` (`tools.ts:19`), add
`CATEGORY_TOOLS` / `CATEGORY_DOLLARS` entries and `CapabilityRow`s in
`capabilities.tsx:21`.

## Phase 1 — Clipboard + Opener

No new dependencies; permissions already granted (`capabilities/default.json:17-31`).

New `src/lib/ai/tools/system.ts` (or split `clipboard.ts` / `opener.ts`):

| Tool | Action | Gating |
| --- | --- | --- |
| `read_clipboard` | read text from clipboard | ambient |
| `read_clipboard_image` | read image → base64 for vision | ambient |
| `write_clipboard` | write text to clipboard | user-approval |
| `open_url` | open URL in default browser | user-approval |
| `open_path` | open file/folder in default app | user-approval |
| `reveal_in_folder` | reveal path in file manager | user-approval |

Uses `@tauri-apps/plugin-clipboard-manager` + `@tauri-apps/plugin-opener`.

## Phase 2 — Local filesystem

Generalizes `knowledge.ts` from one read-only root to multiple connected roots
with read + write.

**Scope decision (fork in the road):** dialog-selected fs scope is runtime-only
and does not persist across restarts. Options:

1. **Static broad scope** in `capabilities/default.json` (e.g. `$HOME/**`) — simplest, broad.
2. **Custom Rust fs commands** (recommended) — controlled, persistable, bypasses
   plugin scope; new `src-tauri/src/fs.rs`.
3. Re-select folder every session — safest, least convenient.

Tools:

| Tool | Action | Gating |
| --- | --- | --- |
| `list_roots` | list connected folders | ambient |
| `list_directory` | list a directory under a root | ambient |
| `read_file` | read a text file | ambient |
| `search_files` | grep-like search across a root | ambient |
| `stat` | file/dir metadata | ambient |
| `write_file` | create/overwrite a file | user-approval |
| `mkdir` | create directory | user-approval |
| `move` / `copy` | relocate/duplicate paths | user-approval |
| `delete` | remove file/dir | user-approval |

Add a "Connected Folders" setting + management UI, reusing the Knowledge Base
connect pattern (`capabilities.tsx:86`).

## Phase 3 — Network, notifications, system info

- **`http.ts`** — generic `http_request(url, method, headers, body)`. Requires
  widening the http allowlist (`default.json:32`, currently exa + gateway only)
  via per-domain or dynamic scope. Unlocks localhost services (Ollama,
  LM Studio) and REST APIs. Approval on non-GET.
- **`notifications.ts`** — add `tauri-plugin-notification` (Cargo + npm +
  capability). `notify(title, body)`; pairs with the focus timer.
- **`sysinfo.ts`** — `tauri-plugin-os` or a `sysinfo`-crate Rust command:
  OS/arch/locale/hostname, disk space, battery.

## Phase 4 — Shell, screenshots, process management

Powerful; all user-approval, allowlisted, and capability-gated.

- **Shell execution** — `tauri-plugin-shell` (or custom Rust
  `std::process::Command`). `run_command(cmd, args, cwd)` with a binary
  allowlist; consider a session-level "trusted commands" toggle.
- **Screenshots** — Rust command (e.g. `screenshots` crate) returning base64,
  fed to vision via `toModelOutput`.
- **Process/app management** — list/launch/kill via Rust or the shell plugin.

## Sequencing

```
Phase -1 (UX + autonomy) ── independent, land anytime (-1a before -1c)
Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4
(consent)  (low-risk)  (files)    (net/os)    (power)
```

Phase -1c applies to `agent` sessions only; `chat` sessions keep a modest cap.
Phase 2's scope decision (static scope vs Rust commands) shapes Phase 4's
implementation, so settle it before starting Phase 2.
