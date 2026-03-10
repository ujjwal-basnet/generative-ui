# chat-to-ui

> A collection of projects exploring **Generative UI** — where AI tool calls render interactive UI instead of plain text.

---


https://github.com/user-attachments/assets/206e08fc-729a-457f-9b5d-a4b14beac537


## What is Generative UI?

Traditional chatbots return text. Generative UI connects AI tool results directly to UI components:

```
User message
  → LLM decides to call a tool
    → Tool executes and returns structured data
      → Data renders as an interactive UI component
```

Instead of the AI saying *"The weather in Kathmandu is 19°C"*, it renders a live weather card.
Instead of listing products as text, it renders interactive product cards with Add to Cart buttons.

---

## Implementations

| Folder | Stack | Status |
|--------|-------|--------|
| `backend/` + `frontend/` | LangGraph + LangChain + Next.js (SSE) | ✅ Done |
| `tool_ui_chatbot/` | LangChain + Gemini + FastAPI | 🔜 working |
| `copilot-ui/` | CopilotKit + LangChain | 🔜 working |

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+ (for the Next.js frontend)
- `uv` — [install here](https://docs.astral.sh/uv/getting-started/installation/)
- A Google Gemini API key or OpenAI API key depending on the implementation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/chat-to-ui.git
cd chat-to-ui
```

### 2. Install Python dependencies

```bash
uv sync
```

> `uv` reads `pyproject.toml`, creates the virtual environment, and installs everything automatically.

### 3. Add your API key

export OPENAI_API_KEY='your-api-key-here'


### 4. Run the backend

```bash
# Using uv (no manual activation needed)
uv run uvicorn backend.main:app --reload --port 8000

# Or activate the venv first
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

### 5. Run the frontend (Next.js only)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Coming Next

**CopilotKit** — Higher-level abstraction where `useCopilotAction()` hooks in React handle tool-to-component wiring automatically, no manual SSE streaming needed.

---

## License

MIT
