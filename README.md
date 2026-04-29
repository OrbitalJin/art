### Art

Art is a desktop productivity application (v0.2.2) that unifies LLM-powered chat, journaling, and task management in one interface. Built with Tauri + React + TypeScript, it features:

- Chat: Multi-session LLM conversations with research and tutor modes
- Journal: Rich text entries with custom mentions, image support, and auto-save
- Tasks: Bento-style task board with drag-and-drop, due dates, and project categorization

Intuitive navigation through command palette, theme customization, text utilities, and keyboard shortcuts.

## Features

### Chat & Session Management

- [x] Multi-session support with a dedicated sidebar
- [x] Lazy loading for sessions
- [x] Rename sessions
- [x] Persistence for chat data
- [x] Implement export/import for sessions
- [x] Store API key in storage (instead of `.env`)
- [x] Pinnable Sessions (supports multiple pins)
- [x] Collapsible Sessions Tab
- [x] Scroll down button
- [x] Fix chat responsiveness
- [x] Expandable Prompt Box (up to 75% screen size)
- [x] Add wrap lines button
- [x] Fix markdown rendering
- [x] Toast notifications
- [x] Handle `aborted` messages and other errors
- [x] Breakdown chat into message list & layout
- [x] Dedicated `use-chat` context and `Rename Chat` context
- [x] Cancel requests with AbortController
- [x] Give system prompt more context
- [x] Re/generate chat title
- [x] Fix session switching edge cases (e.g., deleting all sessions)
- [x] Fix deleting `activeId` issue
- [x] Add `traits` to customize the traits of the models.
- [x] "fork" session
- [x] Create note from session
- [x] Add modes (chat, research, tutor)
- [x] add "archived" state.
- [x] Search grounding
- [ ] Pdf support

### Productivity & Tools

- [x] Attach context to chat from other apps
- [x] Text Utilities (summarizer, reworder, translator, etc.)
- [x] Markdown diary editor
- [x] To Do's (Categorized: Personal, School, Work, etc.) (board)
- [ ] Pomodoro Timer
- [ ] Food tracking calories etc?
- [ ] Screenshot Paste (Single & Multiple, then Save as PNG)
- [ ] Sticker Overlay (PNG on window)
- [ ] Sticky Notes

### Customization & Aesthetics

- [x] Theme Colors
- [x] Command palette based navigation
- [ ] Cute Icons (Hearts, Bunnies, Ribbons)

### Journal

- [x] Improve ui/toolbar/title bar
- [x] Persistence
- [x] Auto-save
- [x] Custom mentions (people, places, things, categories, etc.)
- [x] Image support
- [x] Sidebar with categories & @ filter
- [x] Proper context menu
- [x] Resizable images
- [x] Tauri link opener support for links
- [x] Fix char count updating on switching
- [x] Jump to tag on click on entry list
- [x] Lower opacity of sidebar toggle
- [x] Trade (import/export)
- [x] Pin notes
- [x] Add "as context" feature
- [x] take contextual notes into account in context window calculation
- [x] LLM features
- [x] store and get as markdown to optmize token use when as ref
- [x] disable grammar check in inline and code blocks
- [x] toggle between editing and reading
- [x] copy content
- [x] add padding at the bottom of the editor
- [x] auto scroll to bottom in sessions
- [x] floating toggle/edit button
- [x] Add typograpy plugin
- [x] Headings menu instert
- [ ] Battle test LLM features & simplify dialog logic
- [ ] Popout (seperate feature, board)

### Tasks

- [x] Due dates visualization
- [x] fix scrolling
- [x] Bento box look
- [x] Edit task, move task to project
- [x] Editable project
- [x] Merge task dialogs
- [x] Merge project dialogs

### User Experience

- [x] Persist toolbar states in setting.
- [x] Confirmation dialogs for destructive actions
- [x] Default to current project id when creating a task
- [x] text size picker
- [x] Delete due date button dissapears when date is set
- [x] Rename generate title to regenerate title
- [x] Renamable inbox
- [x] Formatting for new lines
- [x] Customizable radius
- [x] Generate title for session from first message
- [x] Added more settings to chat section
- [x] "Undo" message
- [x] Generate title after llm reponse
- [ ] Custom task order
- [ ] Change logs
- [ ] id based /chat and /notes for specific redirection
- [ ] Tauri hotswap + minisign for remote updates
- [ ] "Super Prompt" a floating prompt you can ask global things to about the app and use agentic features to interact with the app
