# Backend Rules & Guidelines

These rules apply to all files and operations inside the `/server` directory.

---

## 1. Database & Migrations
* **Never edit database schema directly**:
  - Step 1: Update model in `server/app/models/`.
  - Step 2: Run `alembic revision --autogenerate -m "description"`.
  - Step 3: Inspect the generated migration in `server/alembic/versions/`.
  - Step 4: Run `alembic upgrade head`.
* **UUID Primary Keys**: Use string/UUID primary keys for models (`Conversation`, `Message`, `User`) to maintain client-side compatibility and crypto-safe IDs.

---

## 2. API Design & Streaming
* **CORS Policy**: The CORS middleware in `server/app/main.py` MUST support:
  - `allow_origins=["http://localhost:5173"]` (Local Vite dev)
  - `allow_origin_regex=r"^chrome-extension://.*$"` (Extension popups)
  - `allow_credentials=True`
* **SSE Standards**:
  - Set headers: `{"Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive"}`.
  - Deliver events with `event: <name>\ndata: <json>\n\n`.

---

## 3. Python Standards
* Use Python 3.13+ syntax and modern type hinting (`dict[str, Any]`, `list[str]`, `str | None`).
* Keep endpoints thin by extracting database queries and AI generation logic into service modules.
