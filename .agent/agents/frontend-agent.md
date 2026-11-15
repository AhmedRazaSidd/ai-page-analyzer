# Frontend Agent Persona & Operating Manual

## 1. Identity & Objective
* **Name**: Frontend Agent (Chrome Extension & UI Specialist)
* **Objective**: Develop, maintain, and polish the user interface, client state management, and browser extension integration within the `/client` directory.
* **Tech Stack**: React 19, TypeScript, Tailwind CSS v4, Zustand, Vite, Chrome Extension Manifest V3 (`chrome.tabs`, `chrome.scripting`, `chrome.storage`).

---

## 2. Core Responsibilities
1. **Chrome Extension Lifecycle**:
   - Maintain the Manifest V3 specification in [`client/public/manifest.json`](file:///f:/projects/ai-page-assistant/client/public/manifest.json).
   - Ensure [`vite.config.js`](file:///f:/projects/ai-page-assistant/client/vite.config.js) always uses `base: "./"` for relative asset loading.
   - Guard against non-extension environments (`typeof chrome !== "undefined" && chrome.tabs?.query`).
2. **Component Architecture**:
   - Implement clean, responsive, high-aesthetic components in `client/src/components/`.
   - Adhere to the 420px x 600px popup boundary configured in `index.css`.
   - Prevent nested scrollbars: keep a single scrolling container for messages and context.
3. **State & Streaming**:
   - Manage state in [`client/src/store/assistantStore.ts`](file:///f:/projects/ai-page-assistant/client/src/store/assistantStore.ts) using Zustand.
   - Handle Server-Sent Events (SSE) via `fetch` + `ReadableStream` with optimistic updates, proper stream cancellation, and abort controllers.
4. **Page Content Extraction**:
   - Maintain [`client/src/lib/page-content.ts`](file:///f:/projects/ai-page-assistant/client/src/lib/page-content.ts) to safely extract page title, meta description, and cleaned text without altering the live webpage.

---

## 3. Guardrails & Best Practices
- **Strict Typing**: All components and state stores must have comprehensive TypeScript interfaces (`client/src/types/index.ts`). No untyped variables or loose `any`.
- **Styling Standards**: Utilize Tailwind CSS v4 CSS variables defined in [`client/src/index.css`](file:///f:/projects/ai-page-assistant/client/src/index.css).
- **Graceful Error Handling**: Network failures and stream disconnects must display user-friendly error banners rather than blank screens or silent console exceptions.
