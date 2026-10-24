# AI Resume Builder

> **Build interview-ready resumes through conversation — fully offline, zero subscriptions, no data ever leaves your machine.**

An end-to-end AI-powered resume builder that replaces the blank-page struggle with a guided chat interface, smart content generators, a drag-and-drop editor, ATS keyword matching, version history, and one-click multi-format exports.

---

## Screenshots

| Chat Interview | AI Power Tools | Project Generator |
|---|---|---|
| ![Chat Interview](linkedin_screenshots/01_Chat_Interview_Dialogue_Arc.png) | ![AI Power Tools](linkedin_screenshots/02_AI_Power_Tools_Summary_Writer.png) | ![Project Generator](linkedin_screenshots/03_Project_Arc_Generator.png) |

| Drag & Drop Editor | Visual Templates | JD Match Audit |
|---|---|---|
| ![Editor](linkedin_screenshots/04_Manuscript_Drag_and_Drop_Editor.png) | ![Templates](linkedin_screenshots/05_Visual_Layouts_Templates.png) | ![JD Optimizer](linkedin_screenshots/06_Job_Description_Match_Audit.png) |

| Multi-Source Importer | Version History | Export |
|---|---|---|
| ![Importer](linkedin_screenshots/07_Multi_Source_Profile_Importer.png) | ![Versions](linkedin_screenshots/08_Version_History_Volumes.png) | ![Export](linkedin_screenshots/09_Publish_and_Multi_Format_Export.png) |

---

## Features

### 🤖 Chat Interview (Conversational Builder)
Start from zero — the AI interviews you like a career coach. It asks targeted questions about your experience, projects, and skills, then structures your answers into resume-ready content automatically.

### ✍️ AI Power Tools
One-click generators for every resume section:
- **Summary Writer** — craft a tailored professional summary
- **Bullet Point Rewriter** — turn rough notes into strong, action-verb-led bullets
- **Skills Extractor** — pull relevant skills from your own text
- **Cover Letter Generator** — generate a role-specific cover letter in seconds

### 🔧 Project Arc Generator
Describe a project in plain English. The AI expands it into a structured entry with tech stack, impact metrics, and context — ready to drop straight into your resume.

### 📝 Drag & Drop Editor
A section-by-section manuscript editor with:
- Drag-and-drop reordering of sections and bullets
- Inline editing for every field
- Live preview that updates in real time

### 🎨 Visual Templates
Nine professionally designed resume layouts. Switch templates instantly — your data travels with you. No reformatting required.

### 🎯 JD Match Audit (ATS Optimizer)
Paste any job description. The optimizer scores your resume against it, highlights missing ATS keywords, and suggests targeted rewrites to improve your match rate before you apply.

### 📥 Multi-Source Importer
Import your existing resume from:
- **PDF** — parsed via PyMuPDF
- **DOCX** — parsed via python-docx
- **LinkedIn** — paste your profile text
- **Plain text** — freeform paste

### 📚 Version History
Every save is a version. Revert, compare, or branch off any previous state. Never lose work.

### 📤 Multi-Format Export
Export your resume in three formats from a single click:
- **PDF** — pixel-perfect layout via ReportLab
- **DOCX** — editable Word document via python-docx
- **JSON** — structured data for programmatic use

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling (Cyan Surge theme) |
| React DnD | Drag-and-drop section reordering |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Async REST API |
| SQLAlchemy 2 (async) | ORM with async session support |
| PostgreSQL | Primary database (Docker) |
| SQLite + aiosqlite | Automatic fallback for local dev |
| python-docx | DOCX import & export |
| PyMuPDF | PDF parsing |
| ReportLab | PDF generation |
| Jinja2 | Resume HTML templates |
| python-jose + passlib | JWT auth & password hashing |

### AI / LLM
| Technology | Purpose |
|---|---|
| Ollama | Local LLM runtime (runs fully offline) |
| `qwen2.5:1.5b` | Default model — fast, runs on CPU |

---

## Architecture

```
ai-resume-builder/
├── backend/
│   ├── app/
│   │   ├── ai/          # Ollama client & prompt engineering
│   │   ├── api/         # FastAPI routers (chat, generators, optimizer, export…)
│   │   ├── exporter/    # PDF & DOCX export logic
│   │   ├── generator/   # AI content generation helpers
│   │   ├── models/      # SQLAlchemy ORM models
│   │   ├── parser/      # PDF/DOCX/LinkedIn import parsers
│   │   ├── templates/   # Jinja2 resume HTML templates
│   │   └── utils/       # Config, DB session, helpers
│   ├── main.py          # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # App pages (Editor, Templates, Chat…)
│   │   └── index.css    # Global styles & Cyan Surge theme tokens
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── docker/              # Dockerfiles for backend & frontend
├── docker-compose.yml   # Full-stack orchestration
└── .env.example         # Environment variable reference
```

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose **— for the easiest setup**
- Node.js v20+ and Python 3.11+ **— for local development without Docker**
- [Ollama](https://ollama.com/) installed locally (if running without Docker)

---

### Option 1 — Docker Compose (Recommended)

The fastest way to run the full stack including PostgreSQL, Ollama, backend, and frontend.

```bash
# 1. Clone the repo
git clone https://github.com/Yanshu04/AI-Resume-Builder.git
cd AI-Resume-Builder

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# 3. Start all services
docker compose up --build -d

# 4. Pull the LLM model into the Ollama container
docker exec -it resume_ollama ollama pull qwen2.5:1.5b
```

Once up:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **Swagger Docs** → http://localhost:8000/docs

---

### Option 2 — Local Development (No Docker)

#### Step 1 — Start Ollama & pull the model
```bash
# Install Ollama from https://ollama.com then run:
ollama pull qwen2.5:1.5b
ollama serve
```

#### Step 2 — Backend setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

> The backend automatically falls back to **SQLite** (`resume.db`) if PostgreSQL is not available — no extra config needed for local dev.

#### Step 3 — Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**, backend at **http://localhost:8000**.

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
# Database (leave blank to use SQLite fallback locally)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/resume_builder

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:1.5b

# Auth
SECRET_KEY=your-secret-key-here
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat` | Chat-based resume builder |
| `POST` | `/api/generators/summary` | Generate professional summary |
| `POST` | `/api/generators/bullets` | Rewrite bullet points |
| `POST` | `/api/optimizer/analyze` | JD keyword match & score |
| `POST` | `/api/imports` | Import PDF / DOCX / text |
| `GET` | `/api/resumes` | List saved resumes |
| `POST` | `/api/export/pdf` | Export resume as PDF |
| `POST` | `/api/export/docx` | Export resume as DOCX |
| `GET` | `/api/versions/{resume_id}` | List version history |

Full interactive docs available at `/docs` (Swagger UI) when the backend is running.

---

## Why Offline AI?

Most resume builders either charge a subscription for AI features or send your career data to third-party servers. This project runs **Ollama locally** — meaning the LLM runs entirely on your machine. Your resume content, job descriptions, and personal details never leave your computer.

The default model (`qwen2.5:1.5b`) is small enough to run comfortably on CPU-only hardware while still producing quality resume content. You can swap it for any Ollama-compatible model by updating `OLLAMA_MODEL` in your `.env`.

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

MIT License — free to use, modify, and distribute.

---

*Built with FastAPI · React · Ollama · ReportLab · PyMuPDF · python-docx*
