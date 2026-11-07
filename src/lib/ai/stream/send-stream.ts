import { toast } from "sonner";
import { createGateway, smoothStream, streamText } from "ai";
import type {
  ChatAttachment,
  Message,
  MessageStatus,
} from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import type { JournalRef } from "@/lib/journal/ref";
import { format } from "@/lib/ai/prompts/format";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { journalContentStore } from "@/lib/store/journal/content-store";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { sessionDataStore } from "@/lib/store/session/data-store";
import { appendMessage } from "@/lib/store/session/commands";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { modelTypeById } from "@/lib/ai/models";
import { generateSessionTitle } from "@/lib/ai/generate-session-title";
import { resolveAttachmentUrl } from "@/lib/upload/pocketbase";
import { nativeFetch } from "@/lib/native-fetch";
import {
  applyStreamEvent,
  initialAccumulator,
  isTerminal,
  type StreamAccumulator,
} from "@/lib/ai/stream/stream-accumulator";
import { presetFor } from "@/lib/ai/stream/presets";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { usePlanStore } from "@/lib/store/use-plan-store";
import { useStreamStore } from "@/lib/store/use-stream-store";

function attachmentToPart(attachment: ChatAttachment) {
  const url = new URL(resolveAttachmentUrl(attachment.url));
  if (attachment.mimeType.startsWith("image/")) {
    return {
      type: "image" as const,
      image: url,
      mediaType: attachment.mimeType,
    };
  }
  return {
    type: "file" as const,
    data: url,
    mediaType: attachment.mimeType,
    filename: attachment.name,
  };
}

const journalEntries = (refs: JournalRef[], bodies: Map<string, string>) =>
  refs.map((ref) => {
    const page = useJournalIndex.getState().getPage(ref.id);
    return {
      id: ref.id,
      title: page?.title ?? ref.title,
      content: bodies.get(ref.id) ?? "",
    };
  });

/** Read every referenced page's body, keyed by id, for prompt assembly. */
const loadRefBodies = async (
  refs: JournalRef[],
): Promise<Map<string, string>> => {
  const ids = new Set(refs.map((ref) => ref.id));
  const bodies = new Map<string, string>();
  await Promise.all(
    [...ids].map(async (id) => {
      bodies.set(id, await journalContentStore.getState().ensure(id));
    }),
  );
  return bodies;
};

function toSDKMessages(messages: Message[], bodies: Map<string, string>) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const base = messageText(m);
      const text =
        m.role === "user" && m.refs?.length
          ? base + format.journalRefs(journalEntries(m.refs, bodies))
          : base;
      if (m.role === "user" && m.attachments?.length) {
        return {
          role: "user" as const,
          content: [
            { type: "text" as const, text },
            ...m.attachments.map(attachmentToPart),
          ],
        };
      }
      return {
        role: m.role as "user" | "assistant",
        content: text,
      };
    });
}

export async function sendToSession(
  sessionId: string,
  text: string,
  attachments?: ChatAttachment[],
  refs?: JournalRef[],
): Promise<void> {
  const apiKey = useSettingsStore.getState().keys?.gateway;
  if (!apiKey) {
    toast.error("Add a gateway key in Settings to send messages.");
    return;
  }

  const session = useSessionIndex.getState().getMeta(sessionId);
  if (!session) return;

  const { userProfile, agentProfile } = useSettingsStore.getState();
  const profiles = { user: userProfile, agent: agentProfile };

  const messageId = crypto.randomUUID();
  const controller = useStreamStore.getState().begin(sessionId, messageId);
  usePlanStore.getState().clear(sessionId);

  let acc = initialAccumulator;
  let status: MessageStatus = "streaming";
  let stream: ReturnType<typeof streamText> | null = null;

  let frame = 0;
  let pending: StreamAccumulator | null = null;

  const cancelPending = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    pending = null;
  };

  const flush = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (pending) {
      useStreamStore.getState().setSnapshot(sessionId, pending);
      pending = null;
    }
  };

  const schedule = (snapshot: StreamAccumulator) => {
    pending = snapshot;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      flush();
    });
  };

  try {
    await sessionDataStore.getState().ensure(sessionId);
    const history =
      sessionDataStore.getState().cache[sessionId]?.messages ?? [];
    const trailing =
      history.length > 0 && history[history.length - 1].role === "user"
        ? history.slice(0, -1)
        : history;

    const allRefs = [...trailing.flatMap((m) => m.refs ?? []), ...(refs ?? [])];
    const bodies = await loadRefBodies(allRefs);

    const currentText = refs?.length
      ? text + format.journalRefs(journalEntries(refs, bodies))
      : text;

    const currentUserContent = attachments?.length
      ? [
          { type: "text" as const, text: currentText },
          ...attachments.map(attachmentToPart),
        ]
      : currentText;

    stream = streamText({
      model: createGateway({ apiKey, fetch: nativeFetch })(
        modelTypeById(session.modelId),
      ),
      abortSignal: controller.signal,
      messages: [
        ...toSDKMessages(trailing, bodies),
        { role: "user" as const, content: currentUserContent },
      ],
      experimental_transform: smoothStream({
        delayInMs: 5,
        chunking: "word",
      }),
      ...(await presetFor({
        session,
        profiles,
      })),
    });

    for await (const event of stream.fullStream) {
      acc = applyStreamEvent(acc, event);
      if (isTerminal(acc)) {
        status = acc.status;
        break;
      }
      schedule(acc);
    }
    flush();
  } catch (err) {
    cancelPending();
    if (controller.signal.aborted) {
      status = "aborted";
      acc = { ...acc, status: "aborted" };
    } else {
      status = "error";
      acc = { ...acc, status: "error" };
      console.error(err);
    }
  } finally {
    useApprovalStore.getState().clear(sessionId);
    useQuestionStore.getState().clear(sessionId);
    usePlanStore.getState().clear(sessionId);

    const stillExists = useSessionIndex.getState().getMeta(sessionId);
    if (stillExists) {
      const label = stillExists.title ? ` in “${stillExists.title}”` : "";
      if (status === "error") toast.error(`Something went wrong${label}`);
      else if (status === "aborted") toast.info(`Stream aborted${label}`);
    }

    let usage: Awaited<ReturnType<typeof streamText>["usage"]> | undefined;
    if (stream && status !== "aborted" && status !== "error") {
      try {
        usage = await stream.usage;
      } catch {
        usage = undefined;
      }
    }

    try {
      await appendMessage(sessionId, {
        id: messageId,
        role: "assistant",
        parts: acc.parts.length
          ? acc.parts
          : [{ type: "text" as const, text: " " }],
        toolCalls: acc.toolCalls.length ? acc.toolCalls : undefined,
        status: status !== "streaming" ? status : "complete",
        modelId: session.modelId,
        tokenUsage: {
          input: usage?.inputTokens ?? 0,
          output: usage?.outputTokens ?? 0,
        },
        createdAt: Date.now(),
      });

      if (status === "streaming") {
        const ss = useSessionIndex.getState().getMeta(sessionId);
        const messages = sessionDataStore.getState().cache[sessionId]?.messages;
        if (ss && !ss.titleGenerated && messages?.length === 2) {
          generateSessionTitle(sessionId);
        }
      }
    } finally {
      // End the stream only after the persisted message (same id) is in the
      // store. Dropping the live entry first would unmount the list item, shrink
      // the content mid-scroll, and let the scroller jump to the bottom.
      useStreamStore.getState().end(sessionId);
    }
  }
}
