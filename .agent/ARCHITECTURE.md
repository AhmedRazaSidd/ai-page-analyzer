# AI Page Assistant - Multi-Agent Architecture

This document describes the multi-agent architecture governing the development, maintenance, and expansion of the **AI Page Assistant** system.

---

## 1. Multi-Agent Hierarchy & Workflow

```mermaid
flowchart TD
    User([User Request / Task]) --> Planner[Planning Agent\nArchitect & Orchestrator]
    
    Planner -->|Task Specs & API Contracts| Frontend[Frontend Agent\nReact 19 & Extension]
    Planner -->|Data Schema & Endpoints| Backend[Backend Agent\nFastAPI & PostgreSQL]
    
    Backend -->|API Implementation & SSE| Integration((Contract Sync))
    Frontend -->|UI & Store Integration| Integration
    
    Integration --> QA[QA & Testing Agent\nVerification & Audit]
    QA -->|Pass: Build & Tests OK| Done([Completed & Deployed to dist])
    QA -->|Fail: Defect Report| Planner
```

---

## 2. Agent Roles and Boundaries

| Agent | Scope & Ownership | Primary Tools & Tech | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Planning Agent** | Architecture, task breakdown, API schemas, dependency sequencing | Markdown, System Design, Contract Drafting | Action plans, OpenAPI/SSE schemas, Task tickets |
| **Frontend Agent** | Chrome Extension UI, components, state, Chrome APIs | React 19, TypeScript, Tailwind v4, Zustand, Vite | Extension views, store, page scraper, CSS |
| **Backend Agent** | API endpoints, DB models, migrations, streaming, AI integration | FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, SSE | Endpoints, models, migrations, LLM streaming |
| **QA & Testing Agent** | Type safety, build verification, extension packaging, CORS | `tsc`, Vite Build, Pytest, Lint, Chrome inspect | Audit reports, test validations, build checks |

---

## 3. Communication Protocol Between Agents

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Plan as Planning Agent
    participant Back as Backend Agent
    participant Front as Frontend Agent
    participant QA as QA Agent

    User->>Plan: User feature request (e.g. "Add Page Highlighting Q&A")
    Plan->>Plan: Create Spec (Breakdown, Schema, API contract)
    Plan->>Back: Hand off Backend task (Route, Model, Migration)
    Back->>Back: Implement route & run Alembic migration
    Back->>Plan: Backend ready with API contract confirmation
    Plan->>Front: Hand off Frontend task with backend endpoint spec
    Front->>Front: Implement UI component, update Zustand store & Chrome API
    Front->>QA: Request verification
    QA->>QA: Run TypeScript check (`npx tsc --noEmit`)
    QA->>QA: Run Vite extension build (`npm run build`)
    QA->>QA: Verify CORS and Chrome API guards
    QA-->>User: Verified and ready for extension reload!
```

---

## 4. System Data Flow (Runtime Architecture)

```mermaid
flowchart LR
    subgraph Browser["Target Web Page (Active Tab)"]
        DOM[Webpage DOM]
    end

    subgraph Extension["Chrome Extension Popup (Client)"]
        Scraper[page-content.ts\nchrome.scripting]
        Store[assistantStore.ts\nZustand]
        UI[React 19 UI\nTailwind v4 Theme]
    end

    subgraph Server["FastAPI Backend (Server)"]
        Router[routes/assistant.py\nroutes/session.py]
        SSE[SSE Stream Generator\nmeta / status / delta / done]
        DB[(PostgreSQL\nConversations & Messages)]
    end

    DOM -->|Extracted Text & Meta| Scraper
    Scraper -->|PageContent| Store
    Store --> UI
    Store -->|POST /assistant/chat/stream with context| Router
    Router --> DB
    Router -->|Text/Event-Stream| SSE
    SSE -->|Tokens & Status Events| Store
```

---

## 5. Decision Rules
* **Frontend cannot invent unannounced API endpoints**: Must refer to backend routes registered in `server/app/main.py`.
* **Backend cannot alter SSE event structure** (`meta`, `status`, `delta`, `done`, `error`) without approval from the Planning Agent.
* **QA Agent has veto power**: If `npm run build` or `npx tsc` fails, the task cannot be marked done until fixed.
