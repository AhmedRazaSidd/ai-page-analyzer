# ⚡ AI Page Assistant

<div align="center">

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest_V3-Chrome_Extension-orange.svg)
![React](https://img.shields.io/badge/React_19-TypeScript-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06b6d4.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.13+-009688.svg)
![Groq](https://img.shields.io/badge/Inference-Groq_LPU-f55036.svg)
![Neon PostgreSQL](https://img.shields.io/badge/Cloud_Database-Neon_PostgreSQL-00e599.svg)

**A high-performance Chrome Extension (Manifest V3) that provides instant, streaming AI analysis, summarization, translation, and interactive Q&A for any active webpage.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [Extension Installation](#-chrome-extension-setup) • [Tech Stack](#-tech-stack)

</div>

---

## 🌟 Key Features

* **⚡ Ultra-Fast Groq Inference**: Powered by Groq's Language Processing Units (LPU) and Qwen/Llama models, delivering token generation at blistering speeds with Server-Sent Events (SSE) streaming.
* **📌 Chrome Side Panel Integration**: Uses the modern Chrome `sidePanel` API to stay persistent alongside your browsing window instead of closing when clicking outside.
* **🎯 Selective Text Highlighting**: Select any text on a webpage to focus the AI's answer strictly on that excerpt, or analyze the full webpage context on demand.
* **📝 Rich Markdown & Code Depiction**: Renders structured markdown, lists, tables, and highlighted syntax code blocks with 1-click **Copy to Clipboard** (with visual feedback).
* **⏹️ Granular Stream Control**: Includes a live **Stop Generation** button to halt AI output mid-stream whenever you have what you need.
* **🌐 10-Language One-Click Translation**: Instant quick action with a language picker (Spanish, Urdu, Hindi, Arabic, French, German, Chinese, Japanese, Portuguese, Russian).
* **💬 Persistent Chat History**: Stores sessions and conversations in PostgreSQL with conversation renaming, deletion, and quick switching via a slide-out sidebar.
* **🛡️ Privacy & Security First**: Operates purely on-demand (no background DOM scraping), uses anonymous cookie sessions, and includes a full Chrome Web Store compliant Privacy Policy.
* **⌨️ Global Keyboard Shortcut**: Toggle the assistant from anywhere with `Ctrl + Shift + Y` (`Cmd + Shift + Y` on macOS).

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    subgraph Browser["Target Web Page (Active Tab)"]
        DOM[Webpage DOM / User Selection]
    end

    subgraph Client["Chrome Extension Side Panel (React 19)"]
        Scraper[Content Scraper\nchrome.scripting]
        Store[Zustand Store\nState & SSE Reader]
        UI[Side Panel UI\nTailwind CSS v4]
    end

    subgraph Server["Backend API (FastAPI)"]
        Router[FastAPI Routes\n/assistant/chat/stream]
        Auth[Anonymous Auth & Session Dep]
        GroqService[Groq SDK Service\nLPU Inference Engine]
        DB[(Neon PostgreSQL\nCloud Serverless DB)]
    end

    DOM -->|Extract Clean Text| Scraper
    Scraper -->|PageContext| Store
    Store --> UI
    Store -->|POST /chat/stream + Context| Router
    Router --> Auth
    Router --> GroqService
    GroqService -->|SSE Token Stream| Store
    Router -->|Persist History| DB
```

---

## 💻 Tech Stack

### Frontend (Extension)
* **Framework**: React 19 (Hooks, Strict Mode, TypeScript)
* **Build Tool**: Vite 8 with relative asset bundling (`base: "./"`)
* **Styling**: Tailwind CSS v4 (Modern CSS variables engine)
* **State Management**: Zustand
* **Extension Platform**: Chrome Extension Manifest V3 (`sidePanel`, `storage`, `tabs`, `scripting`)
* **Icons & Components**: Lucide React, React Markdown

### Backend (API & Inference)
* **Framework**: FastAPI (Asynchronous Python 3.13+)
* **Package Management**: `uv` (Fastest Python package installer and resolver)
* **Inference Engine**: Groq SDK (`qwen/qwen3.8-27b` / LPU hardware)
* **Streaming Protocol**: Server-Sent Events (SSE) with `text/event-stream`
* **Cloud Database**: Neon Serverless PostgreSQL with auto-scaling & SSL
* **ORM & Migrations**: SQLAlchemy 2.0 with `psycopg` (v3) driver, Alembic migrations, connection pooling (`pool_recycle=300`, `pool_pre_ping=True`)
* **Security & Auth**: `bcrypt` password hashing, `pyjwt`, cookie-based sessions, regex-scoped CORS

---

## 📁 Project Structure

```
ai-page-assistant/
├── .agent/                    # Multi-agent architecture rules and guidelines
│   ├── AGENTS.md              # Global multi-agent operating rules
│   ├── ARCHITECTURE.md        # Hierarchy, contracts, and flow diagrams
│   ├── agents/                # Planning, Frontend, Backend, QA agent roles
│   └── rules/                 # Coding guidelines for client & server
├── client/                    # Chrome Extension Frontend
│   ├── public/
│   │   ├── manifest.json      # Extension Manifest V3 configuration
│   │   ├── background.js      # Service worker for Chrome Side Panel
│   │   ├── privacy-policy.html# Production Privacy Policy
│   │   └── icon-*.png         # 16px, 48px, 128px extension icons
│   ├── src/
│   │   ├── components/        # ChatMessage, QuickActions, Header, Sidebar, etc.
│   │   ├── lib/               # Axios client, DOM scraper (page-content.ts)
│   │   ├── store/             # Zustand assistantStore
│   │   ├── types/             # Strict TypeScript definitions
│   │   └── App.tsx            # Main Side Panel container
│   └── vite.config.js         # Extension bundle config
├── server/                    # FastAPI Backend
│   ├── app/
│   │   ├── core/              # Config, environment variables, Groq settings
│   │   ├── db/                # SQLAlchemy models & database connection
│   │   ├── dependencies/      # Auth & session dependencies
│   │   ├── routes/            # /assistant chat, streaming, sessions
│   │   ├── schemas/           # Pydantic request/response validation
│   │   └── services/          # Groq streaming service wrapper
│   ├── alembic/               # Database migrations
│   └── pyproject.toml         # Python dependencies managed via uv
├── ai-page-assistant-extension.zip # Production-ready extension bundle
└── README.md                  # This file
```

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js** v20+ and `npm`
* **Python** 3.13+ with **`uv`** installed (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh`)
* **Neon PostgreSQL Database** (Free cloud database at [neon.tech](https://neon.tech/)) or a local PostgreSQL instance
* **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com/))

---

### 2. Backend Setup

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` or create a `.env` file in `server/.env`:
   ```env
   # Neon PostgreSQL Connection (both postgresql:// and postgresql+psycopg:// supported)
   DATABASE_URL="postgresql://username:password@ep-your-project-id-pooler.region.aws.neon.tech/neondb?sslmode=require"

   # Groq AI Inference
   GROQ_API_KEY="gsk_your_groq_api_key_here"
   GROQ_MODEL="qwen/qwen3.8-27b"
   GROQ_MAX_TOKENS=800

   # Auth Secret
   JWT_SECRET="your-custom-secret-key"
   ```
   > **Note**: The backend dynamically normalizes the URL to `postgresql+psycopg://` for SQLAlchemy 2.0 and enforces `sslmode=require` for Neon automatically.

3. **Install Dependencies & Run Migrations**:
   ```bash
   uv sync
   uv run alembic upgrade head
   ```

4. **Start the FastAPI Server**:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   * The API will be live at `http://localhost:8000`
   * Interactive documentation available at `http://localhost:8000/docs`

---

### 3. Frontend Setup

1. **Navigate to the client directory**:
   ```bash
   cd client
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Extension**:
   ```bash
   npm run build
   ```
   * Built extension files will be placed inside `client/dist/`.

---

## 🧩 Chrome Extension Setup

To test the extension locally in Google Chrome:

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the directory:
   ```text
   F:\projects\ai-page-assistant\client\dist
   ```
5. Click the **puzzle icon** in your Chrome toolbar, pin **AI Page Assistant**, and click it on any webpage!
6. The assistant will open in the persistent **Chrome Side Panel**.

---

## 🏪 Chrome Web Store Deployment

The project is pre-packaged for Web Store distribution:
* **Manifest V3 Validated**: Strict declarative permissions (`storage`, `tabs`, `activeTab`, `scripting`, `sidePanel`).
* **Icons Included**: `icon-16.png`, `icon-48.png`, `icon-128.png`.
* **Privacy Policy**: Ready at `client/public/privacy-policy.html`.
* **Exported Archive**: Run the archive command or use the pre-built `ai-page-assistant-extension.zip` located in the root directory.

To rebuild the archive at any time:
```powershell
cd client
npm run build
Compress-Archive -Path dist/* -DestinationPath ../ai-page-assistant-extension.zip -Force
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl + Shift + Y` (Windows/Linux) | Toggle the AI Page Assistant Side Panel |
| `Cmd + Shift + Y` (macOS) | Toggle the AI Page Assistant Side Panel |
| `Enter` | Send message to AI |
| `Shift + Enter` | Insert newline in chat input |

---

## 📄 License

This project is licensed under the **MIT License**.
