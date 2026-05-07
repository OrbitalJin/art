# TODO

Detailed feature tracking for Art.

This file tracks shipped work, in-progress items, and planned improvements.

---

## Chat

Multi-session LLM conversations with research and tutor modes. Bring your own API key.

### Shipped

- [x] Multi-session support with a dedicated sidebar
- [x] Lazy loading for sessions
- [x] Rename sessions
- [x] Persistence for chat data
- [x] Export/import for sessions
- [x] Store API key in local storage instead of `.env`
- [x] Pinnable sessions with support for multiple pins
- [x] Collapsible sessions tab
- [x] Scroll-to-bottom button
- [x] Improve chat responsiveness
- [x] Expandable prompt box up to 75% of screen size
- [x] Add wrap lines toggle
- [x] Fix markdown rendering
- [x] Toast notifications
- [x] Handle aborted messages and other errors
- [x] Break down chat into message list and layout
- [x] Dedicated `use-chat` context and rename chat context
- [x] Cancel requests with `AbortController`
- [x] Give system prompt more context
- [x] Generate and regenerate chat title
- [x] Fix session switching edge cases, such as deleting all sessions
- [x] Fix deleting `activeId` issue
- [x] Add traits to customize model behavior
- [x] Fork session
- [x] Create note from session
- [x] Add modes: chat, research, tutor
- [x] Add archived state
- [x] Search grounding

### In progress

- [~] PDF support

---

## Journal

Rich text editor with auto-save, image support, and custom mentions.

### Shipped

- [x] Improve UI, toolbar, and title bar
- [x] Persistence
- [x] Auto-save
- [x] Custom mentions for people, places, things, categories, and more
- [x] Image support
- [x] Sidebar with categories and `@` filter
- [x] Proper context menu
- [x] Resizable images
- [x] Tauri link opener support for links
- [x] Fix character count updating on switching
- [x] Jump to tag when clicked from the entry list
- [x] Lower opacity of sidebar toggle
- [x] Import/export
- [x] Pin notes
- [x] Add "as context" feature
- [x] Take contextual notes into account in context window calculation
- [x] LLM features
- [x] Store and retrieve as Markdown to optimize token use when used as reference
- [x] Disable grammar check in inline and code blocks
- [x] Toggle between editing and reading
- [x] Copy content
- [x] Add padding at the bottom of the editor
- [x] Auto-scroll to bottom in sessions
- [x] Floating toggle/edit button
- [x] Add typography plugin
- [x] Insert headings menu
- [x] Battle-test LLM features and simplify dialog logic
- [x] Popout support

---

## Tasks

Bento-style task board with drag-and-drop organization.

### Shipped

- [x] Due date visualization
- [x] Fix scrolling
- [x] Bento box styling
- [x] Edit task and move task to project
- [x] Editable projects
- [x] Merge task dialogs
- [x] Merge project dialogs
- [x] Task dependencies

---

## Productivity & Tools

### Shipped

- [x] Attach context to chat from other apps
- [x] Text utilities such as summarizer, reworder, and translator
- [x] Markdown diary editor
- [x] Categorized to-do board

### Planned

- [ ] Pomodoro timer
- [ ] Food tracking
- [ ] Screenshot paste support for single and multiple images, then save as PNG
- [ ] Sticker overlay for PNGs on the window

---

## Customization & Aesthetics

### Shipped

- [x] Theme colors
- [x] Command palette-based navigation

---

## User Experience

### Shipped

- [x] Persist toolbar states in settings
- [x] Confirmation dialogs for destructive actions
- [x] Default to current project ID when creating a task
- [x] Text size picker
- [x] Fix delete due date button visibility
- [x] Rename "generate title" to "regenerate title"
- [x] Renamable inbox
- [x] Formatting for new lines
- [x] Customizable radius
- [x] Generate title for session from first message
- [x] Add more settings to chat
- [x] Undo message
- [x] Generate title after LLM response
- [x] Branch out below message
- [x] Solve the no-session state when deleting
- [x] Custom task order
- [x] Persist sidebar list grouping state
- [x] Edit message with prune and resend
- [x] Changelogs
- [x] Tauri hot updates and signing for remote updates
- [x] Customizable user & agent identities

### Planned

- [x] Ignore asset files such as demo screenshots from being packaged
- [ ] Adapt syntax highlighting to current selected theme
- [ ] Super Prompt: a floating prompt for app-wide questions and agentic actions
