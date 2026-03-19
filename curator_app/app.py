# curator_app/app.py
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from curator_app.llm import run_agent
from curator_app.tools import update_cart_item, get_cart_data

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Curator — Generative UI Demo")

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    session_id = body.get("session_id")
    message = body.get("message")

    if not session_id or not message:
        return JSONResponse({"error": "Missing session_id or message"}, status_code=400)

    result = run_agent(session_id, message)
    return JSONResponse(result)


@app.post("/cart/update")
async def cart_update(request: Request):
    """Direct cart mutation from UI buttons (no LLM roundtrip)."""
    body = await request.json()
    action = body.get("action")
    product_name = body.get("product_name")
    quantity = body.get("quantity", 0)
    session_id = body.get("session_id")

    if not action or not product_name or session_id is None:
        return JSONResponse({"error": "Missing parameters"}, status_code=400)

    updated_cart = update_cart_item(session_id, action, product_name, int(quantity))
    return JSONResponse({"success": True, "cart": updated_cart})


@app.get("/cart/{session_id}")
async def get_cart(session_id: str):
    """Get current cart state for a session."""
    data = get_cart_data(session_id)
    return JSONResponse(data)
