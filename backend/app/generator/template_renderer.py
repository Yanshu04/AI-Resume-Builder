from jinja2 import Template
from app.templates import TEMPLATES

def render_preview(template_id: str, resume_json: dict, config: dict = None) -> str:
    """
    Renders the structured resume JSON into the selected layout template using Jinja2.
    Returns the compiled HTML string.
    """
    if not config:
        config = {}
        
    template_str = TEMPLATES.get(template_id, TEMPLATES["modern"])
    t = Template(template_str)
    return t.render(resume=resume_json, config=config)
