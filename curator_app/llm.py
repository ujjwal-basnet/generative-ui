# curator_app/llm.py
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from repo root
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage

from curator_app.tools import make_tools, get_cart_data, PRODUCTS

SYSTEM_PROMPT = """You are Curator, a refined shopping concierge for a high-end design store called Lumiere Noir.

You help users discover curated products, manage their cart, and provide a premium shopping experience.

Available products: """ + ", ".join(p["name"] for p in PRODUCTS) + """

RULES:
- ALWAYS use search_products when the user asks to see, browse, or search products.
- ALWAYS use add_to_cart to add items. Never fake additions.
- ALWAYS use view_cart when the user wants to see their cart.
- Use get_weather when asked about weather.
- After tool calls, give a brief, elegant summary. Keep it concise and refined.
- Never invent products or prices not in the catalog.
- Speak with understated sophistication. No excessive emojis."""

_histories = {}


def _build_llm(session_tools):
    return ChatOpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        model="google/gemini-2.0-flash-001",
    ).bind_tools(session_tools)


def _get_history(session_id: str):
    if session_id not in _histories:
        _histories[session_id] = [SystemMessage(content=SYSTEM_PROMPT)]
    return _histories[session_id]


def run_agent(session_id: str, user_message: str) -> dict:
    session_tools = make_tools(session_id)
    tool_map = {t.name: t for t in session_tools}
    llm = _build_llm(session_tools)

    history = _get_history(session_id)
    history.append(HumanMessage(content=user_message))

    tools_called = []
    products_found = []
    weather_data = None

    max_iterations = 5
    for _ in range(max_iterations):
        response = llm.invoke(history)
        history.append(response)

        if not response.tool_calls:
            break

        for tc in response.tool_calls:
            tool_fn = tool_map.get(tc["name"])
            if not tool_fn:
                continue
            result = tool_fn.invoke(tc["args"])
            tools_called.append(tc["name"])

            # Parse structured results
            result_str = str(result)
            if result_str.startswith("PRODUCTS_FOUND:"):
                product_names_line = result_str.split("\n")[0].replace("PRODUCTS_FOUND:", "")
                product_names = [n.strip() for n in product_names_line.split("|") if n.strip()]
                products_found = [p for p in PRODUCTS if p["name"] in product_names]
            elif result_str.startswith("WEATHER:"):
                parts = result_str.replace("WEATHER:", "").split("|")
                if len(parts) == 3:
                    weather_data = {
                        "location": parts[0],
                        "temperature": int(parts[1]),
                        "condition": parts[2],
                    }

            history.append(
                ToolMessage(content=result_str, tool_call_id=tc["id"])
            )

    # Build response
    cart_data = None
    if "view_cart" in tools_called or "add_to_cart" in tools_called:
        cart_data = get_cart_data(session_id)

    cart_count = get_cart_data(session_id)["count"]

    return {
        "text": response.content if response.content else "",
        "cart_data": cart_data,
        "cart_count": cart_count,
        "products": [
            {
                "name": p["name"],
                "variant": p.get("variant", ""),
                "price": p["price"],
                "image": p["image"],
            }
            for p in products_found
        ] if products_found else None,
        "weather": weather_data,
        "tools_called": tools_called,
    }
