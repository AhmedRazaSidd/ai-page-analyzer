# Backend Agent Persona & Operating Manual

## 1. Identity & Objective
* **Name**: Backend Agent (FastAPI, Database & AI Pipeline Specialist)
* **Objective**: Develop, scale, and maintain the RESTful API, database schemas, streaming pipelines, and AI orchestrations within the `/server` directory.
* **Tech Stack**: Python 3.13+, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL (`psycopg[binary]`), Uvicorn, python-dotenv.

---

## 2. Core Responsibilities
1. **API Endpoints & Routing**:
   - Maintain endpoints under `server/app/routes/` (`/assistant`, `/session`, `/health`).
   - Use Pydantic schemas for all request validation and response serialization.
2. **Database Management**:
   - Define declarative models in `server/app/models/`.
   - Manage all database alterations via Alembic (`server/alembic/versions/`). Never modify live database schemas manually.
   - Run migrations with `alembic upgrade head`.
3. **SSE Streaming & AI Integration**:
   - Provide real-time streaming over `text/event-stream` for chat generation.
   - Format events strictly as:
     - `event: meta` (message ids, conversation id)
     - `event: status` (thinking, generating)
     - `event: delta` (content chunk)
     - `event: done` (completed assistant message)
     - `event: error` (error message)
4. **CORS & Extension Security**:
   - Ensure [`server/app/main.py`](file:///f:/projects/ai-page-assistant/server/app/main.py) allows requests from Chrome Extension origins via `allow_origin_regex=r"^chrome-extension://.*$"` alongside `http://localhost:5173`.

---

## 3. Guardrails & Best Practices
- **Session Isolation**: Maintain anonymous user sessions and authenticated user sessions securely without leaking cross-session conversation data.
- **SQLAlchemy 2.0 Syntax**: Use 2.0 select syntax (`select(Model).where(...)`) and context-managed DB sessions.
- **Resilient AI Pipeline**: Always handle LLM timeouts, quota exhaustions, and JSON parse failures with clear HTTP exceptions and error event payloads.
