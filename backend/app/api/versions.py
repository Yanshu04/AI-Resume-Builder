from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.utils.db import get_db
from app.models.resume_version import ResumeVersion, VersionCreate

router = APIRouter(prefix="/resume", tags=["Resume Version Control"])

@router.post("/version")
async def create_resume_version(
    payload: VersionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Saves a snapshot of the active resume JSON as a named version.
    """
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Version name cannot be empty."
        )

    version = ResumeVersion(
        name=name,
        resume_json=payload.resume_json
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)

    return {
        "id": version.id,
        "name": version.name,
        "created_at": version.created_at
    }

@router.get("/versions")
async def list_resume_versions(
    db: AsyncSession = Depends(get_db)
):
    """
    Lists all saved resume versions.
    """
    result = await db.execute(
        select(ResumeVersion)
        .order_by(ResumeVersion.created_at.desc())
    )
    versions = result.scalars().all()
    
    return [
        {
            "id": v.id,
            "name": v.name,
            "created_at": v.created_at
        } for v in versions
    ]

@router.get("/version/{id}")
async def get_resume_version(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the complete resume JSON for a specific version.
    """
    result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.id == id)
    )
    version = result.scalars().first()

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found."
        )

    return {
        "id": version.id,
        "name": version.name,
        "resume_json": version.resume_json,
        "created_at": version.created_at
    }

@router.delete("/version/{id}")
async def delete_resume_version(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes a specific resume version.
    """
    result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.id == id)
    )
    version = result.scalars().first()

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found."
        )

    await db.delete(version)
    await db.commit()

    return {"detail": "Version successfully deleted."}
