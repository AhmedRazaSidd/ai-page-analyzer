# AI Page Assistant - Workspace Agent Rules & Guidelines

Welcome to the **AI Page Assistant** project. This file defines the global operating principles and operational boundaries for all AI agents working in this workspace.

---

## 1. System Overview
The **AI Page Assistant** is an AI-powered Chrome Extension and web page analyzer composed of:
* **Frontend (`/client`)**: React 19, Vite, Tailwind CSS v4, Zustand, Chrome Extension Manifest V3.
* **Backend (`/server`)**: Python 3.13+, FastAPI, SQLAlchemy 2.0, PostgreSQL, Alembic migrations, Server-Sent Events (SSE) streaming.

---

## 2. Multi-Agent Ecosystem
This project operates under a specialized multi-agent architecture:
* **Planning Agent** (`.agent/agents/planning-agent.md`): Requirements breakdown, schema & contract design, architectural oversight.
* **Frontend Agent** (`.agent/agents/frontend-agent.md`): Chrome Extension UI/UX, React components, Zustand state, Chrome Extension APIs.
* **Backend Agent** (`.agent/agents/backend-agent.md`): FastAPI routes, Pydantic schemas, SQLAlchemy models, Alembic migrations, SSE endpoints.
* **QA & Testing Agent** (`.agent/agents/qa-testing-agent.md`): TypeScript verification, Vite extension bundling tests, API contract checks, code auditing.

---

## 3. General Agent Operating Principles
1. **Never Break Contracts**: If an API endpoint or payload structure is changed, the backend and frontend MUST be updated in lockstep.
2. **Type Safety is Mandatory**:
   * Frontend: Always enforce strict TypeScript (`tsconfig.app.json`). Never use `any` unless absolutely necessary.
   * Backend: Always type with Python type hints and Pydantic models.
3. **Chrome Extension Manifest V3 Compliance**:
   * All assets in `client/dist` must use relative paths (`base: "./"` in `vite.config.js`).
   * Do not rely on persistent global window state in the popup (the popup is ephemeral and unmounts when blurred).
   * Chrome APIs (`chrome.tabs`, `chrome.scripting`, `chrome.storage`) must always be safely checked before invocation so dev server (`localhost:5173`) remains operable.
4. **Database Migration Standard**:
   * Never alter PostgreSQL schema directly. Always generate and apply migrations through `alembic revision --autogenerate` and `alembic upgrade head`.
5. **CORS Security**:
   * The backend MUST explicitly allow both `http://localhost:5173` (Vite dev) and `allow_origin_regex=r"^chrome-extension://.*$"` (extension popup).

---

## 4. Agent Directory Structure
```
.agent/
├── AGENTS.md                  # This file (Global agent guidelines)
├── ARCHITECTURE.md            # Multi-agent architecture and interaction diagram
├── agents/
│   ├── planning-agent.md      # Planning & Architecture specialist
│   ├── frontend-agent.md      # Chrome extension & React specialist
│   ├── backend-agent.md       # FastAPI & Database specialist
│   └── qa-testing-agent.md    # Quality assurance & verification specialist
├── rules/
│   ├── frontend-rules.md      # Detailed React, Tailwind v4 & Chrome API rules
│   └── backend-rules.md       # Detailed FastAPI, Alembic & PostgreSQL rules
└── workflows/
    └── feature-lifecycle.md   # Standard development workflow
```
