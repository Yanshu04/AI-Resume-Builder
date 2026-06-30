# AI Resume Builder

An AI-powered resume builder from scratch. Features conversational chat-based inputs, editor layouts, live template previews, JD optimization, drag-and-drop ordering, imports, versioning, and multi-format exports.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Axios, Lucide React, React-DND
- **Backend**: FastAPI, SQLAlchemy (async pg), python-docx, ReportLab, PyMuPDF, Jinja2, JWT Auth
- **AI Inference**: Offline Ollama (`qwen2.5:1.5b`)

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js v20+ & Python 3.11+ (if running locally without Docker)

### Running via Docker Compose
1. Start the Docker containers:
   ```bash
   docker compose up --build -d
   ```
2. Pull the offline LLM model inside Ollama:
   ```bash
   docker exec -it resume_ollama ollama pull qwen2.5:1.5b
   ```
3. Access:
   - Frontend: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`

### Running Locally (Development)

#### 1. Setup Backend
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
