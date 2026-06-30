from app.utils.ollama_client import query_ollama

async def generate_polished_bullet(rough_bullet: str, context: str = "") -> str:
    """
    Polishes a rough experience bullet point using Ollama.
    """
    system_prompt = (
        "You are an expert resume reviewer and copywriter. Polish the candidate's bullet point.\n"
        "Output ONLY the single polished bullet point, starting with a strong action verb. No quotes, no intro, no comments."
    )
    
    prompt = (
        f"Rough Bullet Point: '{rough_bullet}'\n"
        f"Role Context: '{context}'\n\n"
        "Instructions:\n"
        "- Rewrite the bullet point to start with a strong action verb (e.g., Developed, Engineered, Spearheaded, Optimized).\n"
        "- Elevate the vocabulary to be professional and impact-oriented.\n"
        "- Quantify metrics or highlight technology frameworks where appropriate.\n"
        "Generate the polished bullet point now:"
    )
    
    response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
    return response.strip('"').strip("'").strip().lstrip('- ').lstrip('* ')
