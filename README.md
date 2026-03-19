# chat-to-ui

> A collection of projects exploring **Generative UI** — where AI tool calls render interactive UI instead of plain text.

---

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
| `curator_app/` | **FastAPI + Vanilla JS (Curator Design System)** | **New** |
| `backend/` + `frontend/` | LangGraph + LangChain + Next.js (SSE) | Done |
| `tool_ui_chatbot/` | LangChain + Gemini + FastAPI | Working |
| `copilot-ui/` | CopilotKit + LangChain | Working |

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

```bash
# Create .env in the repo root (used by all implementations)
echo "OPENROUTER_API_KEY=sk-or-your-key-here" > .env
```

> All implementations use [OpenRouter](https://openrouter.ai/) for LLM access (free models available).

---

## Quick Start: Curator App (Recommended)

The cleanest generative UI demo — FastAPI backend serving a single HTML page with the Curator design system. No React/Node.js needed.

```bash
# From the repo root
uv run uvicorn curator_app.app:app --reload --port 8000
```

Open **http://localhost:8000**

Features:
- Real generative UI — LLM tool calls render interactive product cards and cart widgets
- No page refreshes — all interactions via fetch() and DOM manipulation
- Curator design system — Material Design tokens, Manrope/Inter typography
- Interactive cart — add, remove, update quantities directly in chat

---

## Alternative: LangGraph + Next.js (SSE Streaming)

### Run the backend

```bash
uv run uvicorn backend.main:app --reload --port 8000
```

### Run the frontend

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
