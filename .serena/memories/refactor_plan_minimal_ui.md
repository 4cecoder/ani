Refactor plan for minimal OS-like UI:
- Remove all Discord-like elements (sidebars, channels, friends, posts, voice chat, notifications) from app/page.tsx.
- Retain only the top bar and background.
- Add a single floating, draggable chat window using Window component, centered on screen.
- Use ChatMessage for rendering messages inside the window.
- If Window is not draggable, add drag logic.
- The rest of the screen should be open and minimal, ready for future features.