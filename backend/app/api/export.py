from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.utils.db import get_db
from app.models.resume import Resume
from app.exporter.export_engine import export_json, export_markdown, export_docx, export_pdf

router = APIRouter(prefix="/export", tags=["Resume Export Operations"])

class ExportRequest(BaseModel):
    resume_json: Dict[str, Any]
    format: str  # 'pdf', 'docx', 'markdown', 'json'
    config: Optional[Dict[str, Any]] = None

@router.post("")
async def api_export_resume(
    payload: ExportRequest
):
    """
    Exports candidate resume data to the specified format (PDF, DOCX, Markdown, JSON)
    applying customized style rules.
    """
    fmt = payload.format.lower().strip()
    resume_json = payload.resume_json
    config = payload.config or {}

    if not resume_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume JSON data is required."
        )

    try:
        if fmt == "json":
            file_bytes = export_json(resume_json)
            media_type = "application/json"
            filename = "resume.json"
        elif fmt == "markdown":
            file_bytes = export_markdown(resume_json)
            media_type = "text/markdown"
            filename = "resume.md"
        elif fmt == "docx":
            file_bytes = export_docx(resume_json)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = "resume.docx"
        elif fmt == "pdf":
            file_bytes = export_pdf(resume_json, config)
            media_type = "application/pdf"
            filename = "resume.pdf"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported format '{fmt}'. Use: pdf, docx, markdown, json."
            )

        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )

@router.get("/download")
async def api_download_resume(
    format: str,
    font: Optional[str] = None,
    color: Optional[str] = None,
    margin: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Direct GET download endpoint for client navigation (bypasses iframe blob limitations).
    """
    import time
    fmt = format.lower().strip()
    config = {}
    if font:
        config["font_family"] = font
    if color:
        config["accent_color"] = color
    if margin:
        config["margin"] = margin

    result = await db.execute(select(Resume))
    resume = result.scalars().first()

    if not resume or not resume.resume_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active resume available to export."
        )

    resume_json = resume.resume_json

    try:
        if fmt == "json":
            file_bytes = export_json(resume_json)
            media_type = "application/json"
            filename = f"resume_{int(time.time() * 1000)}.json"
        elif fmt == "markdown":
            file_bytes = export_markdown(resume_json)
            media_type = "text/markdown"
            filename = f"resume_{int(time.time() * 1000)}.md"
        elif fmt == "docx":
            file_bytes = export_docx(resume_json)
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            filename = f"resume_{int(time.time() * 1000)}.docx"
        elif fmt == "pdf":
            file_bytes = export_pdf(resume_json, config)
            media_type = "application/pdf"
            filename = f"resume_{int(time.time() * 1000)}.pdf"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported format '{fmt}'. Use: pdf, docx, markdown, json."
            )

        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )

