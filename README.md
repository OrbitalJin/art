## Features

### Core Technologies

- [x] **Frontend:** React, Tailwind CSS, Shadcn UI
- [x] **Desktop:** Tauri (including permissions & package management)

### Chat & Session Management

- [x] Multi-session support with a dedicated sidebar
- [x] Lazy loading for sessions
- [x] Rename sessions
- [x] Persistence for chat data
- [x] Implement export/import for sessions
- [x] Store API key in storage (instead of `.env`)
- [x] Pinnable Sessions (supports multiple pins)
- [x] Collapsible Sessions Tab

### User Experience & Interface

- [x] Scroll down button
- [x] Fix chat responsiveness
- [x] Expandable Prompt Box (up to 75% screen size)
- [x] Add wrap lines button
- [x] Fix markdown rendering
- [x] Toast notifications
- [x] Handle `aborted` messages and other errors
- [x] Breakdown chat into message list & layout
- [x] Dedicated `use-chat` context and `Rename Chat` context
- [ ] `ToolKit` menu in chat prompt (rephrase, etc)

### Chat Logic & Control

- [x] Cancel requests with AbortController
- [x] Give system prompt more context
- [x] Re/generate chat title
- [x] Fix session switching edge cases (e.g., deleting all sessions)
- [x] Fix deleting `activeId` issue

## Future Enhancements

### Productivity & Tools

- [ ] Attach context to chat from other apps
- [ ] Text Utilities (summarizer, reworder, translator, etc.)
- [ ] Markdown diary editor
- [ ] To Do's (Categorized: Personal, School, Work, etc.)
- [ ] Pomodoro Timer

### Desktop Interactions

- [ ] Screenshot Paste (Single & Multiple, then Save as PNG)
- [ ] Sticker Overlay (PNG on window)
- [ ] Sticky Notes

### Customization & Aesthetics

- [ ] Theme Colors (Pinkie Pie, MLP themes!)
- [ ] Cute Icons (Hearts, Bunnies, Ribbons)
- [ ] Command palette based navigation

### Diary

- [x] Improve ui/toolbar/title bar
- [x] Persistence
- [x] auto-save
- [ ] fix rename autofocus
- [ ] Image support
- [ ] custom mentions (people, places, things, categories, etc.)
- [ ] sidebar with categories & @ filter
- [ ] ai features
- [ ] popout
