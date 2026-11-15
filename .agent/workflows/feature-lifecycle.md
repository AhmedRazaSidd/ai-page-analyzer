# Multi-Agent Feature Lifecycle Workflow

Use this end-to-end workflow whenever planning, implementing, and verifying a new feature in the project.

---

## Stage 1: Planning & Specification (Planning Agent)
1. **Analyze Requirements**: Detail the user's objective and user stories.
2. **Define Contracts**:
   - Write API route paths, HTTP methods, and Pydantic schemas.
   - Match frontend TypeScript interfaces in `client/src/types/index.ts`.
3. **Draft Execution Plan**: Provide an ordered step-by-step checklist.

---

## Stage 2: Backend Implementation (Backend Agent)
1. **Database Schema**: Add or modify models in `server/app/models/`.
2. **Generate Migration**: Run `alembic revision --autogenerate -m "<name>"` and `alembic upgrade head`.
3. **Route & Logic**: Implement endpoint and service handlers.
4. **Local Verification**: Test endpoint with FastAPI Swagger UI (`http://localhost:8000/docs`).

---

## Stage 3: Frontend Implementation (Frontend Agent)
1. **Types**: Update `client/src/types/index.ts` with any new payload or model types.
2. **Store**: Add necessary actions/state in `client/src/store/assistantStore.ts`.
3. **UI Components**: Build or modify React components in `client/src/components/`.
4. **Browser Integration**: Update `client/src/lib/page-content.ts` or Chrome APIs if tab scraping behavior changes.

---

## Stage 4: Quality Assurance & Build (QA Agent)
1. **Type Check**: Run `cd client; npx tsc -p tsconfig.app.json --noEmit`.
2. **Build Test**: Run `cd client; npm run build`.
3. **Inspect Output**: Ensure `dist/index.html` has relative asset references and `manifest.json` is present.
4. **Deliver to User**: Summarize changes and provide extension reload instructions.
