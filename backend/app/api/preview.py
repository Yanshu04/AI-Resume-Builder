from fastapi import APIRouter, HTTPException, status
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.templates import TEMPLATE_METADATA
from app.generator.template_renderer import render_preview

router = APIRouter(prefix="/templates", tags=["Resume Layout Templates"])

class PreviewRequest(BaseModel):
    template_id: str
    resume_json: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None

@router.get("")
async def api_list_templates():
    """
    Returns available layouts with names, descriptions, and recommended fields.
    """
    return TEMPLATE_METADATA

@router.post("/preview", response_class=HTMLResponse)
async def api_preview_resume(
    payload: PreviewRequest
):
    """
    Compiles candidate data into Jinja2 templates and returns a raw HTML page.
    """
    template_id = payload.template_id.strip()
    resume_json = payload.resume_json
    config = payload.config or {}

    if not template_id or not resume_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both template_id and resume_json are required."
        )

    try:
        html_content = render_preview(
            template_id=template_id, 
            resume_json=resume_json, 
            config=config
        )
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rendering error: {str(e)}"
        )
