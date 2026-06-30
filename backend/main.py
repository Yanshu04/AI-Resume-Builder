import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import settings
from app.utils.db import engine, Base
from app.api import chat, generators, projects, optimizer, preview, resumes, imports as api_imports, versions, export

app = FastAPI(
    title="AI Resume Builder API",
    description="Backend service for AI-powered resume building, optimization, and exports.",
    version="1.0.0"
)

# Enable CORS for all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lifecycle startup to create database tables
@app.on_event("startup")
async def on_startup():
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    import app.utils.db
    
    try:
        async with engine.begin() as conn:
            # Create all tables defined in models inheriting from Base
            await conn.run_sync(Base.metadata.create_all)
        print("Connected to PostgreSQL successfully.")
    except Exception as e:
        print(f"PostgreSQL connection refused: {e}. Switching to SQLite local file (resume.db).")
        fallback_engine = create_async_engine(
            "sqlite+aiosqlite:///./resume.db",
            echo=False,
            future=True,
        )
        app.utils.db.engine = fallback_engine
        app.utils.db.async_sessionmaker_instance = async_sessionmaker(
            bind=fallback_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        async with fallback_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "llm_model": settings.OLLAMA_MODEL
    }

# Include Routers
app.include_router(chat.router, prefix="/api")
app.include_router(generators.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(optimizer.router, prefix="/api")
app.include_router(preview.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(api_imports.router, prefix="/api")
app.include_router(versions.router, prefix="/api")
app.include_router(export.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
