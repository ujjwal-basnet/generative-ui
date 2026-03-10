from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from .agent import agent
from typing import AsyncGenerator
import json

app = FastAPI(title="Generative UI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOOL_COMPONENT_MAP = {
    "get_weather": "WeatherCard",
    "search_products": "ProductList",
    "add_to_cart": "CartConfirmation",
}

async def stream_events(messages) -> AsyncGenerator[str, None]:
    sent_text = False

    async for event in agent.astream_events({"messages": messages}, version="v2"):
        kind = event["event"]

        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"].content
            if chunk:
                sent_text = True
                yield f"data: {json.dumps({'type': 'text', 'content': chunk}, ensure_ascii=False)}\n\n"

        elif kind == "on_chat_model_end" and not sent_text:
            output = event["data"].get("output")
            content = getattr(output, "content", None) if output else None
            if content:
                yield f"data: {json.dumps({'type': 'text', 'content': content}, ensure_ascii=False)}\n\n"
                sent_text = True

        elif kind == "on_tool_end":
            tool_name = event["name"]
            output = event["data"]["output"]
            component = TOOL_COMPONENT_MAP.get(tool_name, "Fallback")

            # With response_format="content_and_artifact", real data is in .artifact
            data = getattr(output, "artifact", None)

            if data is None:
                continue

            if component == "Fallback":
                continue

            payload = {"type": "tool_result", "component": component, "data": data}
            yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


@app.get("/chat/stream")
async def chat_stream(prompt: str):
    messages = [{"role": "user", "content": prompt}]
    return EventSourceResponse(stream_events(messages))


@app.get("/health")
async def health():
    return {"status": "ok"}
