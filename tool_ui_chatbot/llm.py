# tool_ui_chatbot/llm.py
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage

from tools import make_tools, get_cart_data, _carts  # _carts only for count fallback

SYSTEM_PROMPT = """You are ShopBot, a friendly shopping assistant for a clothing store.

You help users add items to their cart and view their cart.

Available products: Classic White Shirt, Navy Blue Polo, Striped Oxford Shirt, Black Slim Jeans, Khaki Chinos, Grey Hoodie, Denim Jacket, White Sneakers.

RULES:
- ALWAYS use the add_to_cart tool to modify the cart. Never fake additions.
- ALWAYS use the view_cart tool when the user wants to see their cart ("show cart", "view cart", "what's in my cart", "cart please", etc.).
- After any tool call, give a friendly natural-language summary.
- Be concise and use emojis occasionally.
- Never invent products or prices."""

_histories = {}


def _build_llm(session_tools):
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.3,
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

    view_cart_called = False
    products_to_show = None  # <-- collect products

    while True:
        response = llm.invoke(history)
        history.append(response)

        if not response.tool_calls:
            break

        for tc in response.tool_calls:
            tool_fn = tool_map[tc["name"]]
            result = tool_fn.invoke(tc["args"])

            if tc["name"] == "view_cart":
                view_cart_called = True
            elif tc["name"] == "list_products":
                products_to_show = result  # <-- store products

            history.append(
                ToolMessage(
                    content=str(result),
                    tool_call_id=tc["id"],
                )
            )

    # Build final response for frontend
    if view_cart_called:
        cart_data = get_cart_data(session_id)
        cart_count = cart_data["count"]
    else:
        temp = get_cart_data(session_id)
        cart_data = None
        cart_count = temp["count"]

    return {
        "text": response.content,
        "cart_data": cart_data,
        "cart_count": cart_count,
        "products": products_to_show,  # <-- frontend will render grid if available
    }