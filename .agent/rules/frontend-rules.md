# Frontend Rules & Guidelines

These rules apply to all files and operations inside the `/client` directory.

---

## 1. Extension Manifest & Build Rules
* **Relative Base**: `vite.config.js` MUST always include `base: "./"`. Absolute paths (`/assets/...`) break in Chrome Extension popups.
* **Manifest Permissions**: Do not add unnecessary permissions to `manifest.json`. Currently used permissions:
  - `storage`: for local caching of context and preferences.
  - `tabs` & `activeTab`: for querying the currently active tab.
  - `scripting`: for content extraction via `chrome.scripting.executeScript`.
* **Safe API Usage**: Always guard Chrome APIs:
  ```typescript
  if (typeof chrome !== "undefined" && chrome.tabs?.query) { ... }
  ```

---

## 2. React & TypeScript Standards
* **No `any` Types**: Fully type all component props, Zustand state methods, and API responses.
* **Component Styling**:
  - Use Tailwind CSS v4 variables from `index.css` (`var(--background)`, `var(--primary)`, etc.).
  - Follow the popup viewport constraint: `width: 420px; height: 600px`.
* **Scrollbars**:
  - Keep scrolling to a single container element (`flex-1 min-h-0 overflow-y-auto`).
  - Never nest multiple `overflow-y-auto` divs inside the main view to avoid double scrollbars.

---

## 3. Zustand & SSE Streaming
* Use an `AbortController` to cancel stale or in-flight streams when switching conversations or clearing chats.
* Always apply optimistic UI updates for user messages so the UI feels instantaneous.
* Gracefully reset `isLoading` and `streamStatus` in `finally` blocks.
