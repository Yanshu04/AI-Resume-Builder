import httpx
from fastapi import HTTPException
from typing import Optional
from app.utils.config import settings

async def query_ollama(prompt: str, system_prompt: Optional[str] = None) -> str:
    """
    Sends a query to the Ollama service using the configured model.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "top_p": 0.9,
        }
    }
    if system_prompt:
        payload["system"] = system_prompt

    async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT) as client:
        try:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Ollama service returned error status: {response.status_code}. Response: {response.text}"
                )
            result = response.json()
            return result.get("response", "").strip()
        except httpx.RequestError as e:
            # Fallback to 127.0.0.1 if the default docker hostname 'ollama' fails to resolve
            if "ollama" in settings.OLLAMA_BASE_URL:
                fallback_url = url.replace("ollama", "127.0.0.1")
                try:
                    response = await client.post(fallback_url, json=payload)
                    if response.status_code == 200:
                        result = response.json()
                        return result.get("response", "").strip()
                except Exception:
                    pass
            raise HTTPException(
                status_code=500, 
                detail=f"Ollama connection request failed: {str(e)}. Ensure Ollama is running and has pulled {settings.OLLAMA_MODEL}"
            )
