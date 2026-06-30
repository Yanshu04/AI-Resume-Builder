from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any
from app.utils.db import get_db
from app.models.resume import Resume, ResumeUpdate, ResumeOrderPatch

router = APIRouter(prefix="/resume", tags=["Resume Editor Management"])

@router.get("/active")
async def get_active_resume(
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the active resume. Auto-creates a default one if none exists.
    """
    result = await db.execute(select(Resume))
    resume = result.scalars().first()

    if not resume:
        # Create a default baseline resume
        default_json = {
            "personal_info": {
                "name": "Alex Candidate",
                "email": "candidate@email.com",
                "phone": "555-0199",
                "location": "City, State",
                "linkedin": "linkedin.com/in/candidate",
                "github": "github.com/candidate"
            },
            "summary": "Results-driven Software Engineer with experience developing scalable web services.",
            "experience": [
                {
                    "id": "exp_1",
                    "company": "Tech Solutions Inc.",
                    "position": "Software Engineer",
                    "period": "2022 - Present",
                    "bullets": [
                        "Architected microservices using FastAPI and Docker.",
                        "Optimized database queries, speeding up load times by 30%."
                    ]
                },
                {
                    "id": "exp_2",
                    "company": "Web Systems Ltd.",
                    "position": "Junior Developer",
                    "period": "2020 - 2022",
                    "bullets": [
                        "Assisted in coding frontend modules using React.",
                        "Collaborated with QA teams to write unit tests."
                    ]
                }
            ],
            "projects": [
                {
                    "id": "proj_1",
                    "name": "Chatbot Platform",
                    "description": "An interactive conversational app.",
                    "tech_stack": ["FastAPI", "React", "Ollama"],
                    "bullets": [
                        "Built real-time messaging pipelines using websockets.",
                        "Deployed local LLMs inside Docker containers."
                    ]
                }
            ],
            "skills": {
                "languages": ["Python", "TypeScript", "SQL"],
                "frameworks": ["FastAPI", "React", "Next.js"],
                "tools": ["Docker", "Git", "PostgreSQL"]
              },
            "education": [
                {
                    "id": "edu_1",
                    "institution": "State University",
                    "degree": "B.S. in Computer Science",
                    "year": "2020"
                }
            ],
            "achievements": [
                "Dean's list graduate.",
                "Won local developer hackathon."
            ],
            "section_order": ["summary", "skills", "experience", "projects", "education", "achievements"]
        }
        
        resume = Resume(resume_json=default_json)
        db.add(resume)
        await db.commit()
        await db.refresh(resume)

    return {
        "id": resume.id,
        "resume_json": resume.resume_json
    }

@router.put("/active")
async def update_active_resume(
    payload: ResumeUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Saves the entire updated resume JSON.
    """
    result = await db.execute(select(Resume))
    resume = result.scalars().first()

    if not resume:
        resume = Resume(resume_json=payload.resume_json)
        db.add(resume)
    else:
        resume.resume_json = payload.resume_json

    await db.commit()
    await db.refresh(resume)

    return {
        "id": resume.id,
        "resume_json": resume.resume_json
    }

@router.patch("/{id}/order")
async def patch_resume_order(
    id: int,
    payload: ResumeOrderPatch,
    db: AsyncSession = Depends(get_db)
):
    """
    Persists section/item sorting updates for the resume.
    """
    result = await db.execute(select(Resume).where(Resume.id == id))
    resume = result.scalars().first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    resume.resume_json = payload.resume_json
    await db.commit()

    return {
        "id": resume.id,
        "resume_json": resume.resume_json
    }
