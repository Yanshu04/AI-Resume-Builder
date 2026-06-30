from app.utils.ollama_client import query_ollama

async def generate_quantified_achievement(raw_achievement: str) -> str:
    """
    Polishes a raw achievement description and quantifies it with hypothetical metrics to demonstrate scale.
    """
    system_prompt = (
        "You are an expert resume coach. Polish and quantify the candidate's achievement statement.\n"
        "Output ONLY the single polished sentence, starting with a strong verb. No quotes, no intro, no comments."
    )
    
    prompt = (
        f"Raw Achievement Statement: '{raw_achievement}'\n\n"
        "Instructions:\n"
        "- Polish the statement to make it professional, results-oriented, and quantified.\n"
        "- Introduce realistic, professional metrics or achievements (e.g. 'out of 100+ candidates', 'reducing cost by 15%', 'speeding up load times by 40%') if not present to establish scale.\n"
        "Generate the polished achievement now:"
    )
    
    response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
    return response.strip('"').strip("'").strip().lstrip('- ').lstrip('* ')
