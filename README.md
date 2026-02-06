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

### Productivity & Tools

- [x] Attach context to chat from other apps
- [x] Text Utilities (summarizer, reworder, translator, etc.)
- [x] Markdown diary editor
- [ ] To Do's (Categorized: Personal, School, Work, etc.) (board)
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
- [ ] Battle test LLM features & simplify dialog logic
- [ ] Popout (seperate feature, board)

### Tasks

- [x] Due dates visualization
- [ ] Edit task, move task to project
- [ ] Editable project
- [ ] Bento box look
- [ ] fix scrolling

### User Experience

- [x] Persist toolbar states in setting.
- [ ] Confirmation dialogs for destructive actions
- [ ] id based /chat and /notes for specific redirection
- [ ] "Super Prompt" a floating prompt you can ask global things to about the app and use agentic features to interact with the app
