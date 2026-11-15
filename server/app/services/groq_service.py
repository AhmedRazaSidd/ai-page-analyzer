from collections.abc import AsyncGenerator
import logging
from typing import Any

from groq import AsyncGroq, GroqError

from app.core.config import GROQ_API_KEY, GROQ_MODEL
from app.schemas.chat import ChatContext

logger = logging.getLogger(__name__)

SYSTEM_BASE_INSTRUCTIONS = """You are "AI Page Assistant", an intelligent, accurate, and concise AI browser assistant.
Your job is to help users comprehend, analyze, summarize, and query the web page they are actively browsing.

Guidelines:
1. Base your answers primarily on the provided Webpage Context.
2. If the user asks a question not covered by the page, you can answer from general knowledge, but briefly mention that it wasn't found on the page.
3. Be clear, concise, well-structured, and use markdown (bullet points, bold highlights) for readability.
4. If a quick action is requested:
   - "summarize": Provide a 2-3 sentence executive summary followed by 3-5 bulleted key takeaways.
   - "key-points": Provide clear, concise bullet points highlighting the most essential points.
   - "translate": Translate the core webpage content accurately into the requested language (default to Spanish if none specified).
   - "question": Directly answer the user's inquiry with factual references from the page.
"""


def build_system_message(
    context: ChatContext | None,
    action: str | None = None,
) -> str:
    parts = [SYSTEM_BASE_INSTRUCTIONS]

    if action:
        parts.append(f"\n[Active Quick Action: {action.upper()}]")

    if context and (context.url or context.title or context.page_content):
        parts.append("\n--- CURRENT WEBPAGE CONTEXT ---")
        if context.title:
            parts.append(f"Page Title: {context.title}")
        if context.url:
            parts.append(f"Page URL: {context.url}")
        if context.description:
            parts.append(f"Meta Description: {context.description}")
        if context.page_content:
            # Safely cap context length to avoid token overflow
            truncated_content = context.page_content[:30000]
            parts.append(f"\nExtracted Content:\n{truncated_content}")
            if len(context.page_content) > 30000:
                parts.append("\n[Content truncated for length]")
        parts.append("--- END OF WEBPAGE CONTEXT ---\n")

    return "\n".join(parts)


def prepare_messages(
    history: list[dict[str, str]],
    current_content: str,
    context: ChatContext | None = None,
    action: str | None = None,
) -> list[dict[str, str]]:
    system_prompt = build_system_message(context, action)
    messages: list[dict[str, str]] = [
        {"role": "system", "content": system_prompt}
    ]

    # Include recent conversation history (last 10 messages for context)
    for msg in history[-10:]:
        role = msg.get("role")
        content = msg.get("content")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Add the current user query
    messages.append({"role": "user", "content": current_content})
    return messages


async def stream_groq_response(
    history: list[dict[str, str]],
    current_content: str,
    context: ChatContext | None = None,
    action: str | None = None,
) -> AsyncGenerator[str, None]:
    """Streams response tokens from Groq API."""
    if not GROQ_API_KEY:
        yield (
            "⚠️ **Groq API Key is not configured.**\n\n"
            "Please add your `GROQ_API_KEY` to the `server/.env` file and restart the server.\n"
            "You can obtain a free API key at [https://console.groq.com/keys](https://console.groq.com/keys)."
        )
        return

    client = AsyncGroq(api_key=GROQ_API_KEY)
    messages = prepare_messages(history, current_content, context, action)

    try:
        completion_stream = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,  # type: ignore
            temperature=0.4,
            max_tokens=2048,
            stream=True,
        )

        async for chunk in completion_stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    except GroqError as e:
        logger.error(f"Groq API Error: {e}")
        yield f"\n\n⚠️ **Groq Error:** {e.message or str(e)}"
    except Exception as e:
        logger.error(f"Unexpected AI Generation Error: {e}")
        yield f"\n\n⚠️ **AI Generation Error:** {str(e)}"
    finally:
        await client.close()


async def get_groq_completion(
    history: list[dict[str, str]],
    current_content: str,
    context: ChatContext | None = None,
    action: str | None = None,
) -> str:
    """Non-streaming completion for standard chat endpoint."""
    if not GROQ_API_KEY:
        return (
            "⚠️ Groq API Key is not configured. Please add `GROQ_API_KEY` in `server/.env`."
        )

    client = AsyncGroq(api_key=GROQ_API_KEY)
    messages = prepare_messages(history, current_content, context, action)

    try:
        completion = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,  # type: ignore
            temperature=0.4,
            max_tokens=2048,
            stream=False,
        )
        return completion.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Groq Completion Error: {e}")
        return f"Error communicating with Groq: {str(e)}"
    finally:
        await client.close()
