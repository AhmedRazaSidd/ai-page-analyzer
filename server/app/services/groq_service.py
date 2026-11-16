from collections.abc import AsyncGenerator
import logging
from typing import Any

from groq import AsyncGroq, GroqError

from app.core.config import GROQ_API_KEY, GROQ_MAX_TOKENS, GROQ_MODEL
from app.schemas.chat import ChatContext

logger = logging.getLogger(__name__)

SYSTEM_BASE_INSTRUCTIONS = """You are "AI Page Assistant", an intelligent, modern, and highly professional AI browser assistant.
Your mission is to help users comprehend, analyze, summarize, and query the web page they are actively browsing.

Formatting & Style Guidelines:
1. **Visual Appeal & Professional Emojis**: Use relevant, tasteful emojis in markdown headers, key bullet points, and section dividers to make responses engaging, modern, and easy to scan (e.g., 📌, 💡, 🎯, 🔍, ⚡, 📊, 🌐, 📝, ✨, 🚀). Keep it polished and aesthetic—not overdone.
2. **Structured Markdown**: Organize answers with clear markdown headers (`### 📌 ...`), bold highlights, bullet points, and callout blocks when useful.
3. **Factual Grounding**: Base your answers primarily on the provided Webpage Context. If the user asks about something not covered on the page, state clearly that it wasn't found on the active page before offering general knowledge.
4. **Quick Action Formatting**:
   - **"summarize"**:
     ### 📋 Executive Summary
     (2-3 clear, impactful sentences summarizing the main topic)
     
     ### 💡 Key Takeaways
     • 🔹 **Core Point 1**: Explanation
     • 🔹 **Core Point 2**: Explanation
     • 🔹 **Core Point 3**: Explanation
   - **"key-points"**:
     ### 🎯 Core Highlights
     (Organized, concise bullet points using relevant emojis for each theme)
   - **"translate"**:
     ### 🌐 Translated Content
     (High-quality, accurate translation into the requested language, preserving original nuances)
   - **"question"**:
     ### 🔍 Answer
     (Direct, well-structured answer with supporting details and citations from the page context)
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
            max_tokens=GROQ_MAX_TOKENS,
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
            max_tokens=GROQ_MAX_TOKENS,
            stream=False,
        )
        return completion.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Groq Completion Error: {e}")
        return f"Error communicating with Groq: {str(e)}"
    finally:
        await client.close()
