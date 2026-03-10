# chat-to-ui

> MY collection of PROJECTS RELATED TO  **Generative UI** implementations — where AI tool calls renders ui insted of  plain text.

---

## What is Generative UI?

Traditional chatbots return text. Generative UI connects AI tool results directly to React components:

```
User message
  → LLM decides to call a tool
    → Tool executes and returns structured data
      → Data is passed to a React component
        → UI renders dynamically
```

Instead of the AI saying *"The weather in Kathmandu is 19°C, partly cloudy"*, it renders a live weather card. Instead of listing products as text, it renders interactive product cards with Add to Cart buttons.

---

## Implementations in this repo

| Folder | Stack | Status |
|--------|-------|--------|
| `backend/` + `frontend/` | LangGraph + LangChain + Next.js (SSE) | ✅ Done |
| `copilot-ui/` | CopilotKit + LangChain | 🔜 Coming |
| `tool_ui_chatbot/` | LangChain + custom tool UI | 🔜 Coming |

Each implementation explores a different approach to the same problem: **how do you turn tool call results into UI?**

---

## Implementation 1 — LangGraph + Next.js (SSE)

The first and core implementation. Uses Server-Sent Events to stream tool results from a FastAPI backend to a Next.js frontend, where each tool maps to a React component.

### How it works

```
FastAPI /chat/stream (SSE)
  │
  ├── on_chat_model_stream  →  {"type": "text", "content": "..."}
  │                                 ↓
  │                            Appended to chat bubble
  │
  └── on_tool_end           →  {"type": "tool_result", "component": "ProductList", "data": [...]}
                                      ↓
                               React renders <ProductList /> with real data
```

### Tool → Component map

| Tool | Component | Trigger |
|------|-----------|---------|
| `get_weather` | `<WeatherCard />` | *"Weather in London"* |
| `search_products` | `<ProductList />` | *"Show me hiking boots"* |
| `add_to_cart` | `<CartConfirmation />` | Click Add to Cart |

### Project structure

```
chat-to-ui/
├── backend/
│   ├── schemas.py        # Pydantic models for all tool inputs/outputs
│   ├── agent.py          # LangGraph ReAct agent + 3 tools
│   ├── main.py           # FastAPI SSE streaming endpoint
│   └── __init__.py
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx       # Chat UI + SSE stream reader
        │   └── layout.tsx
        └── components/
            ├── WeatherCard.tsx       # Rendered by get_weather
            ├── ProductList.tsx       # Rendered by search_products
            ├── ProductCard.tsx       # Individual product card
            └── CartConfirmation.tsx  # Rendered by add_to_cart
```

### Installation

#### Prerequisites

- Python 3.11+
- Node.js 18+
- An OpenAI API key

#### 1. Clone the repo

```bash
git clone https://github.com/your-username/chat-to-ui.git
cd chat-to-ui
```

#### 2. Set up Python environment

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

# Install dependencies
pip install fastapi uvicorn sse-starlette langchain langchain-openai langgraph pydantic python-dotenv
```

#### 3. Add your OpenAI API key

```bash
echo "OPENAI_API_KEY=sk-your-key-here" > backend/.env
```

#### 4. Run the backend

```bash
# Run from the root folder (not inside backend/)
uvicorn backend.main:app --reload --port 8000
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

#### 5. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
Local: http://localhost:3000
```

#### 6. Open the app

Go to **http://localhost:3000** and try:

```
Weather in Kathmandu
Show me hiking boots
Best backpacks for travel
```

Click **Add to Cart** on any product to trigger the `CartConfirmation` component.

---

## Key concept — `response_format="content_and_artifact"`

The critical LangChain detail that makes Generative UI work cleanly.

By default, LangChain tool results are serialized to a string inside a `ToolMessage`. This makes it impossible to pass structured data to React components.

Using `response_format="content_and_artifact"` keeps the structured data intact:

```python
# Without it — data becomes a string, useless for UI
@tool
async def search_products(query: str) -> List[ProductData]:
    ...
    # ToolMessage.content = "[ProductData(name='Merrell...')]"  ← string!

# With it — structured data lives in .artifact
@tool(response_format="content_and_artifact")
async def search_products(query: str) -> Tuple[str, list]:
    ...
    return "Found 3 products", [p.model_dump() for p in products]
    # ToolMessage.content   = "Found 3 products"       ← human readable
    # ToolMessage.artifact  = [{name: "Merrell", ...}] ← clean dict for React
```

Then in the SSE stream:
```python
elif kind == "on_tool_end":
    data = event["data"]["output"].artifact  # clean structured data
    payload = {"type": "tool_result", "component": "ProductList", "data": data}
```

---

## Coming next

**Implementation 2 — CopilotKit**
CopilotKit provides a higher-level abstraction where you declare `useCopilotAction()` hooks in React and the tool-to-component wiring happens automatically — no manual SSE streaming required.

**Implementation 3 — Custom Tool UI**
A lighter approach using LangChain's tool calling with a custom UI schema to declaratively define which component each tool renders.

---

## License

MIT