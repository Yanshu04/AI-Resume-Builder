from app.utils.ollama_client import query_ollama

async def generate_rewritten_experience(rough_text: str) -> str:
    """
    Rewrites a paragraph or rough block of experience details into professional resume bullet points.
    """
    system_prompt = (
        "You are an expert resume writer. Rewrite the provided rough job description into a clean list of professional bullet points.\n"
        "Output ONLY the bullet points, each on a new line starting with a bullet character (e.g. '-' or '*'). No other text."
    )
    
    prompt = (
        f"Rough Experience Draft:\n\"{rough_text}\"\n\n"
        "Instructions:\n"
        "- Rewrite and structure the text into 2 to 3 high-impact, professional resume bullet points.\n"
        "- Start each bullet point with a strong action verb (e.g., Architected, Executed, Formulated).\n"
        "- Highlight results, business impact, and technical stacks where appropriate.\n"
        "Generate the bullet points now:"
    )
    
    response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
    return response.strip()
