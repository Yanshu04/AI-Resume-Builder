from . import modern, professional, minimal, google_style, microsoft_style, harvard, stanford

TEMPLATES = {
    "modern": modern.TEMPLATE,
    "professional": professional.TEMPLATE,
    "minimal": minimal.TEMPLATE,
    "google_style": google_style.TEMPLATE,
    "microsoft_style": microsoft_style.TEMPLATE,
    "harvard": harvard.TEMPLATE,
    "stanford": stanford.TEMPLATE
}

TEMPLATE_METADATA = [
    {"id": "modern", "name": "Modern Sans", "description": "Sleek, left-accented colored sidebar styling.", "recommended_for": "Tech & Startups"},
    {"id": "professional", "name": "Classic Executive", "description": "Traditional centered serif styling.", "recommended_for": "Finance, Consulting & Management"},
    {"id": "minimal", "name": "Ultra Clean Minimalist", "description": "Spacious, lightweight grid-based layout.", "recommended_for": "Design & Creative Fields"},
    {"id": "google_style", "name": "Google Recruiter Choice", "description": "Compact Arial-based single-page formatting.", "recommended_for": "Software Engineering"},
    {"id": "microsoft_style", "name": "Microsoft Standard", "description": "Structured Segoe UI style with clean borders.", "recommended_for": "Enterprise Tech & PMs"},
    {"id": "harvard", "name": "Harvard Crimson Academic", "description": "Georgia-based elegant publication layout.", "recommended_for": "Academia, Law & Medicine"},
    {"id": "stanford", "name": "Stanford Cardinal Red", "description": "Chunky gothic titles with bold red header lines.", "recommended_for": "Hardware & Product Engineers"}
]
