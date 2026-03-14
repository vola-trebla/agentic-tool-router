# Agentic Tool Router

An AI agent that receives natural language questions about space, autonomously decides which NASA tools to call, executes them step by step, and returns a synthesized human-friendly answer.

## What It Does

Instead of manually calling APIs, you ask a question:

```
"Is anything dangerous near Earth today?"
```

The agent **thinks**, **acts**, and **observes** in a loop (ReAct pattern):

```
THINK:    "I need to check near-Earth asteroids"
ACT:      calls asteroids tool
OBSERVE:  "16 asteroids found, 2 potentially hazardous"
THINK:    "I should also check solar activity"
ACT:      calls space-weather tool
OBSERVE:  "M2-class solar flare detected"
THINK:    "I have enough data to answer"
ANSWER:   "There's a 375m asteroid passing by safely, plus moderate solar activity."
```

Every step is logged and returned as a **reasoning trace**, so you can see exactly how the agent arrived at its answer.

## Why This Matters

This project demonstrates the difference between:

- **LLM alone** — answers from training data, can hallucinate
- **LLM + tools + real-time data** — answers grounded in live NASA data

Three core capabilities of the agent:

| Capability | Description |
|---|---|
| **Tool Routing** | LLM decides which tools to call based on the question |
| **Data Interpretation** | Translates raw NASA numbers into human-readable explanations |
| **Multi-Tool Synthesis** | Combines data from multiple sources into one coherent answer |

## Tools

| Tool | Source | Description |
|---|---|---|
| 🛰️ ISS Position | Open Notify API | Current location of the International Space Station |
| ☄️ Near-Earth Asteroids | NASA NeoWs API | Asteroids passing close to Earth today |
| 🌌 Photo of the Day | NASA APOD API | Astronomy Picture of the Day |
| ☀️ Space Weather | NASA DONKI API | Solar flares and geomagnetic storms |

## Tech Stack

- **Runtime:** TypeScript, tsx, NodeNext
- **LLM:** Gemini 2.5 Flash (function calling)
- **Server:** Hono
- **Validation:** Zod
- **Architecture:** ReAct agent loop — LLM provider abstracted behind an interface for easy swapping

## Getting Started

```bash
git clone https://github.com/albertalov/agentic-tool-router.git
cd agentic-tool-router
npm install
cp .env.example .env
# Add your API keys to .env
npx tsx src/index.ts
```

## API Keys

| Key | Where to get |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NASA_API_KEY` | [api.nasa.gov](https://api.nasa.gov) — free, takes 1 minute |

## Project Structure

```
src/
├── index.ts          — Hono server, POST /ask endpoint
├── agent.ts          — ReAct loop (think → act → observe → repeat)
├── types.ts          — All interfaces
├── logger.ts         — Step-by-step reasoning trace
└── tools/
    ├── registry.ts   — Tool registry + lookup
    ├── iss.ts        — ISS position
    ├── asteroids.ts  — Near-Earth asteroids
    ├── apod.ts       — NASA photo of the day
    └── space-weather.ts — Solar activity
```

## Example Request

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Give me today'\''s space briefing"}'
```

## License

MIT