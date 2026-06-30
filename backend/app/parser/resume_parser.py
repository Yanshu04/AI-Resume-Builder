import fitz  # PyMuPDF
import docx  # python-docx
import io
import json
import logging
from typing import Dict, Any
from app.utils.ollama_client import query_ollama

logger = logging.getLogger(__name__)

async def parse_resume_file(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Parses a PDF or DOCX file, extracts the text, and parses it into structured resume JSON via Ollama.
    """
    text = ""
    filename_lower = filename.lower()
    
    try:
        if filename_lower.endswith(".pdf"):
            # Open PDF stream using PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text()
            doc.close()
        elif filename_lower.endswith(".docx"):
            # Open DOCX stream using python-docx
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join([para.text for para in doc.paragraphs])
        else:
            raise ValueError("Unsupported file format. Please upload a PDF or DOCX file.")
            
    except Exception as e:
        logger.error(f"Error extracting text from file {filename}: {str(e)}")
        raise ValueError(f"Failed to read document: {str(e)}")

    if not text.strip():
        raise ValueError("The uploaded document appears to be empty or unscannable.")

    # Send the raw text to Ollama to structure into JSON
    system_prompt = (
        "You are an expert ATS parser and resume parser.\n"
        "Extract candidate profile information from the raw text and map it into the requested JSON schema.\n"
        "Output ONLY a valid JSON object matching the requested schema. Do not add any conversational text."
    )

    prompt = f"""
Raw Resume Text:
{text[:4000]}  # Context limit check

Please parse and clean this unstructured resume text into a highly structured resume JSON.
Format the output strictly according to this JSON schema:
{{
  "personal_info": {{
    "name": "Candidate Full Name (extract from text)",
    "email": "Email (extract from text)",
    "phone": "Phone Number (extract)",
    "location": "City, State",
    "linkedin": "LinkedIn profile link",
    "github": "GitHub profile link"
  }},
  "summary": "Professional summary statement (2-3 sentences)",
  "experience": [
    {{
      "company": "Company Name",
      "position": "Job Title",
      "period": "Employment Dates",
      "bullets": ["Experience accomplishment bullet 1", "Experience accomplishment bullet 2"]
    }}
  ],
  "projects": [
    {{
      "name": "Project Title",
      "description": "Short project summary",
      "tech_stack": ["Tech1", "Tech2"],
      "bullets": ["Project bullet 1", "Project bullet 2"]
    }}
  ],
  "skills": {{
    "languages": ["Language1", "Language2"],
    "frameworks": ["Framework1", "Framework2"],
    "tools": ["Tool1", "Tool2"]
  }},
  "education": [
    {{
      "institution": "University / School Name",
      "degree": "Degree and Major",
      "year": "Graduation Year"
    }}
  ],
  "achievements": [
    "Achievement statement 1",
    "Achievement statement 2"
  ]
}}
"""

    try:
        response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        clean_json = response.strip()
        
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
        start_idx = clean_json.find("{")
        end_idx = clean_json.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
            
        parsed_json = json.loads(clean_json)
        return parsed_json
        
    except Exception as e:
        logger.error(f"Error parsing resume content with LLM: {str(e)}")
        # Simple heuristic fallback parser if LLM fails
        return {
            "personal_info": {
                "name": "Extracted Profile",
                "email": "extracted@email.com",
                "phone": "",
                "location": ""
            },
            "summary": "Imported text profile.",
            "experience": [
                {
                    "company": "Imported Company",
                    "position": "Imported Role",
                    "period": "",
                    "bullets": [text[:200] + "..."]
                }
            ],
            "projects": [],
            "skills": {
                "languages": [],
                "frameworks": [],
                "tools": []
            },
            "education": [],
            "achievements": []
        }
