import io
import json
from typing import Dict, Any
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def export_json(resume_json: Dict[str, Any]) -> bytes:
    """
    Exports the resume JSON as formatted raw bytes.
    """
    return json.dumps(resume_json, indent=2).encode('utf-8')

def export_markdown(resume_json: Dict[str, Any]) -> bytes:
    """
    Compiles the resume JSON into clean Markdown formatting.
    """
    info = resume_json.get("personal_info", {})
    md = []
    
    # Header
    md.append(f"# {info.get('name', 'Candidate')}")
    contact = []
    if info.get("email"): contact.append(info["email"])
    if info.get("phone"): contact.append(info["phone"])
    if info.get("location"): contact.append(info["location"])
    if info.get("linkedin"): contact.append(f"[LinkedIn]({info['linkedin']})")
    if info.get("github"): contact.append(f"[GitHub]({info['github']})")
    md.append(" | ".join(contact))
    md.append("\n---\n")

    # Summary
    if resume_json.get("summary"):
        md.append("## Professional Summary")
        md.append(resume_json["summary"])
        md.append("")

    # Experience
    if resume_json.get("experience"):
        md.append("## Experience")
        for exp in resume_json["experience"]:
            md.append(f"### {exp.get('position')} - {exp.get('company')}")
            md.append(f"*{exp.get('period')}*")
            for bullet in exp.get("bullets", []):
                md.append(f"- {bullet}")
            md.append("")

    # Projects
    if resume_json.get("projects"):
        md.append("## Technical Projects")
        for proj in resume_json["projects"]:
            stack = ", ".join(proj.get("tech_stack", []))
            md.append(f"### {proj.get('name')} | *{stack}*")
            md.append(f"*{proj.get('description')}*")
            for bullet in proj.get("bullets", []):
                md.append(f"- {bullet}")
            md.append("")

    # Skills
    skills = resume_json.get("skills", {})
    if skills:
        md.append("## Skills")
        if skills.get("languages"):
            md.append(f"- **Languages:** {', '.join(skills['languages'])}")
        if skills.get("frameworks"):
            md.append(f"- **Frameworks:** {', '.join(skills['frameworks'])}")
        if skills.get("tools"):
            md.append(f"- **Tools & Platforms:** {', '.join(skills['tools'])}")
        md.append("")

    # Education
    if resume_json.get("education"):
        md.append("## Education")
        for edu in resume_json["education"]:
            md.append(f"**{edu.get('institution')}** - {edu.get('degree')} ({edu.get('year')})")
        md.append("")

    # Achievements
    if resume_json.get("achievements"):
        md.append("## Achievements")
        for ach in resume_json["achievements"]:
            md.append(f"- {ach}")
        md.append("")

    return "\n".join(md).encode('utf-8')

def export_docx(resume_json: Dict[str, Any]) -> bytes:
    """
    Generates a professionally structured DOCX file using python-docx.
    """
    doc = Document()
    
    # Configure 1-inch default page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.85)
        section.bottom_margin = Inches(0.85)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    info = resume_json.get("personal_info", {})
    
    # Header Name
    p_name = doc.add_paragraph()
    p_name.paragraph_format.space_after = Pt(2)
    p_name.paragraph_format.keep_with_next = True
    run_name = p_name.add_run(info.get("name", "Candidate Name"))
    run_name.font.name = "Arial"
    run_name.font.size = Pt(20)
    run_name.font.bold = True
    
    # Header Contact Details
    p_contact = doc.add_paragraph()
    p_contact.paragraph_format.space_after = Pt(12)
    contact_list = []
    if info.get("email"): contact_list.append(info["email"])
    if info.get("phone"): contact_list.append(info["phone"])
    if info.get("location"): contact_list.append(info["location"])
    if info.get("linkedin"): contact_list.append(info["linkedin"])
    if info.get("github"): contact_list.append(info["github"])
    run_contact = p_contact.add_run(" | ".join(contact_list))
    run_contact.font.name = "Arial"
    run_contact.font.size = Pt(9.5)
    run_contact.font.color.rgb = RGBColor(80, 80, 80)

    def add_section_heading(text: str):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text.upper())
        run.font.name = "Arial"
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 120, 212) # Standard Blue heading Accent

    # Summary Section
    if resume_json.get("summary"):
        add_section_heading("Professional Summary")
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(resume_json["summary"])
        run.font.name = "Arial"
        run.font.size = Pt(10)

    # Experience Section
    if resume_json.get("experience"):
        add_section_heading("Experience")
        for exp in resume_json["experience"]:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            
            run_role = p.add_run(f"{exp.get('position')} - ")
            run_role.font.bold = True
            run_role.font.size = Pt(10.5)
            
            run_comp = p.add_run(exp.get("company"))
            run_comp.font.bold = True
            run_comp.font.italic = True
            run_comp.font.size = Pt(10.5)
            
            # Period right aligned/space run
            p.add_run(f"\t\t{exp.get('period')}")
            
            for bullet in exp.get("bullets", []):
                p_bullet = doc.add_paragraph(style='List Bullet')
                p_bullet.paragraph_format.space_after = Pt(2.5)
                run_b = p_bullet.add_run(bullet)
                run_b.font.name = "Arial"
                run_b.font.size = Pt(9.5)

    # Projects Section
    if resume_json.get("projects"):
        add_section_heading("Technical Projects")
        for proj in resume_json["projects"]:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            
            run_title = p.add_run(proj.get("name"))
            run_title.font.bold = True
            run_title.font.size = Pt(10.5)
            
            stack = ", ".join(proj.get("tech_stack", []))
            run_stack = p.add_run(f" ({stack})")
            run_stack.font.italic = True
            run_stack.font.size = Pt(9.5)
            run_stack.font.color.rgb = RGBColor(100, 100, 100)
            
            for bullet in proj.get("bullets", []):
                p_bullet = doc.add_paragraph(style='List Bullet')
                p_bullet.paragraph_format.space_after = Pt(2.5)
                run_b = p_bullet.add_run(bullet)
                run_b.font.name = "Arial"
                run_b.font.size = Pt(9.5)

    # Skills Section
    skills = resume_json.get("skills", {})
    if skills:
        add_section_heading("Technical Skills")
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        
        runs_list = []
        if skills.get("languages"):
            runs_list.append(f"Languages: {', '.join(skills['languages'])}")
        if skills.get("frameworks"):
            runs_list.append(f"Frameworks: {', '.join(skills['frameworks'])}")
        if skills.get("tools"):
            runs_list.append(f"Tools & Infrastructure: {', '.join(skills['tools'])}")
            
        run = p.add_run("\n".join(runs_list))
        run.font.name = "Arial"
        run.font.size = Pt(9.5)

    # Education Section
    if resume_json.get("education"):
        add_section_heading("Education")
        for edu in resume_json["education"]:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(3)
            run_edu = p.add_run(f"{edu.get('institution')} - {edu.get('degree')}")
            run_edu.font.bold = True
            run_edu.font.size = Pt(10)
            p.add_run(f"\t\t{edu.get('year')}")

    # Achievements Section
    if resume_json.get("achievements"):
        add_section_heading("Achievements")
        for ach in resume_json["achievements"]:
            p_ach = doc.add_paragraph(style='List Bullet')
            p_ach.paragraph_format.space_after = Pt(3)
            run_ach = p_ach.add_run(ach)
            run_ach.font.name = "Arial"
            run_ach.font.size = Pt(9.5)

    out = io.BytesIO()
    doc.save(out)
    return out.getvalue()

def export_pdf(resume_json: Dict[str, Any], config: Dict[str, Any] = None) -> bytes:
    """
    Generates a beautifully typeset PDF file using ReportLab flowables.
    """
    if not config:
        config = {}
        
    accent_hex = config.get("accent_color", "#0078d4")
    accent_color = colors.HexColor(accent_hex)
    text_color = colors.HexColor(config.get("text_color", "#222222"))
    
    # Margin settings
    margin_str = config.get("margin", "20px")
    margin_val = 36 # Default 0.5 inch
    if "10" in margin_str: margin_val = 20
    elif "30" in margin_str: margin_val = 50
    elif "40" in margin_str: margin_val = 65

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=margin_val,
        leftMargin=margin_val,
        topMargin=margin_val,
        bottomMargin=margin_val
    )

    styles = getSampleStyleSheet()
    
    # Setup custom Paragraph styles to prevent collisions
    style_name = ParagraphStyle(
        name='NameStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#111111"),
        spaceAfter=4
    )
    
    style_contact = ParagraphStyle(
        name='ContactStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#555555"),
        spaceAfter=12
    )
    
    style_section_title = ParagraphStyle(
        name='SectionTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=accent_color,
        spaceBefore=10,
        spaceAfter=4,
        textTransform='uppercase'
    )
    
    style_body = ParagraphStyle(
        name='BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_color,
        spaceAfter=4
    )
    
    style_item_title = ParagraphStyle(
        name='ItemTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#111111")
    )
    
    style_bullet = ParagraphStyle(
        name='BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=text_color,
        leftIndent=14,
        firstLineIndent=-10,
        spaceBefore=1,
        spaceAfter=2
    )

    story = []
    
    # Header Name
    info = resume_json.get("personal_info", {})
    story.append(Paragraph(info.get("name", "Candidate Name"), style_name))
    
    # Contact Row
    contacts = []
    if info.get("email"): contacts.append(info["email"])
    if info.get("phone"): contacts.append(info["phone"])
    if info.get("location"): contacts.append(info["location"])
    if info.get("linkedin"): contacts.append(info["linkedin"])
    if info.get("github"): contacts.append(info["github"])
    story.append(Paragraph(" | ".join(contacts), style_contact))

    def add_section_header(title: str):
        story.append(Spacer(1, 4))
        # Draw section text
        story.append(Paragraph(title, style_section_title))
        # Draw horizontal border rule using a thin table
        line_table = Table([[""]], colWidths=[doc.width], rowHeights=[1])
        line_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), accent_color),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(line_table)
        story.append(Spacer(1, 4))

    # Summary
    if resume_json.get("summary"):
        add_section_header("Summary")
        story.append(Paragraph(resume_json["summary"], style_body))

    # Experience
    if resume_json.get("experience"):
        add_section_header("Experience")
        for exp in resume_json["experience"]:
            header_text = f"<b>{exp.get('position')}</b> - {exp.get('company')} &nbsp;&nbsp;|&nbsp;&nbsp; <i>{exp.get('period')}</i>"
            story.append(Paragraph(header_text, style_item_title))
            for bullet in exp.get("bullets", []):
                story.append(Paragraph(f"&bull; {bullet}", style_bullet))
            story.append(Spacer(1, 4))

    # Projects
    if resume_json.get("projects"):
        add_section_header("Projects")
        for proj in resume_json["projects"]:
            stack = ", ".join(proj.get("tech_stack", []))
            header_text = f"<b>{proj.get('name')}</b> &nbsp;&nbsp;({stack})"
            story.append(Paragraph(header_text, style_item_title))
            story.append(Paragraph(f"<i>{proj.get('description')}</i>", style_body))
            for bullet in proj.get("bullets", []):
                story.append(Paragraph(f"&bull; {bullet}", style_bullet))
            story.append(Spacer(1, 4))

    # Skills
    skills = resume_json.get("skills", {})
    if skills:
        add_section_header("Skills")
        skills_text = []
        if skills.get("languages"):
            skills_text.append(f"<b>Languages:</b> {', '.join(skills['languages'])}")
        if skills.get("frameworks"):
            skills_text.append(f"<b>Frameworks:</b> {', '.join(skills['frameworks'])}")
        if skills.get("tools"):
            skills_text.append(f"<b>Tools / Systems:</b> {', '.join(skills['tools'])}")
        
        story.append(Paragraph("<br/>".join(skills_text), style_body))

    # Education
    if resume_json.get("education"):
        add_section_header("Education")
        for edu in resume_json["education"]:
            edu_text = f"<b>{edu.get('institution')}</b> - {edu.get('degree')} ({edu.get('year')})"
            story.append(Paragraph(edu_text, style_body))

    # Achievements
    if resume_json.get("achievements"):
        add_section_header("Achievements")
        for ach in resume_json["achievements"]:
            story.append(Paragraph(f"&bull; {ach}", style_bullet))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
