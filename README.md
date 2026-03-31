# Excalidraw Studio

Describe anything and watch it draw itself in chat, element by element. Refine it in chat or pop it open as a full Excalidraw canvas - draw more yourself, bring it back, keep going. Powered by [CopilotKit](https://copilotkit.ai) and modified [Excalidraw MCP server](https://github.com/excalidraw/excalidraw-mcp).

https://github.com/user-attachments/assets/18dd56de-6f14-4a1d-b743-52fccf145bbe

## What It Does

- Diagrams draw themselves live in chat via [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) - each element appears one by one
- Every result opens as a local workspace - drag, reshape, connect, and annotate freely
- Every iteration in a chat updates the **same workspace** — start a new chat to start a fresh one
- **Edit with AI** - open any saved workspace, click "Edit with AI" and the diagram loads straight into chat. Describe changes, they sync back to the workspace
- **Blank canvas** - create a blank canvas from the workspaces page, draw yourself, and bring it to chat to edit with AI
- **Skill picker** - 5 diagram modes available: Architecture, Sequence Diagram, Wireframe, Freehand Sketch, Storyboard. Choice persists across sessions
- **Export** - PNG, JPEG, SVG download or copy to clipboard right from the chat toolbar. Zoom and expand diagrams inline without leaving chat
- Every diagram auto-saves to disk, no database needed, Redis supported for Vercel deployments
- Workspaces page to browse, rename, and delete all your saved diagrams

## Quick Start

```bash
# install dependencies
npm install
cd server && npm install && npm run build && cd ..

# run both servers
npm run dev   # starts Next.js (port 3000) and MCP server (port 3001) together
```

Create `.env.local` in the root and add your [OpenAI API key](https://platform.openai.com/settings/organization/api-keys).

```
OPENAI_API_KEY=sk-proj-...
```

## Diagram Styles

Open **Settings** (gear icon, top-right) to switch styles. Your choice is saved across sessions.

| Style | Best for |
|---|---|
| **Architecture** | System design, layers, component relationships |
| **Sequence Diagram** | API flows, call chains, actor interactions |
| **Wireframe** | Lo-fi UI mockups in grayscale |
| **Freehand Sketch** | Quick concept maps, whiteboard-style ideas |
| **Storyboard** | Step-by-step narratives, user flows, comic-strip format |

## Switching Models

Pass any model string to `BuiltInAgent` in `src/app/api/copilotkit/route.ts`.

```typescript
// Anthropic
const agent = new BuiltInAgent({ model: "anthropic:claude-sonnet-4-6" });

// Google
const agent = new BuiltInAgent({ model: "google:gemini-2.5-flash" });
```

Add the matching API key to `.env.local` (e.g. `ANTHROPIC_API_KEY=sk-ant-...`). For Azure OpenAI, AWS Bedrock, Ollama and other providers, see the [model selection docs](https://docs.copilotkit.ai/integrations/built-in-agent/model-selection).

## How It Works

```
├── src/
│   ├── app/
│   │   ├── page.tsx              ← chat UI, skill picker, welcome screen
│   │   ├── workspace/[id]/       ← full Excalidraw editor
│   │   ├── workspaces/           ← saved diagrams list
│   │   ├── api/copilotkit/       ← CopilotKit runtime and agent
│   │   ├── api/checkpoints/      ← list all saved checkpoints
│   │   └── api/checkpoint/[id]/  ← get, update, delete a checkpoint
│   ├── components/
│   │   ├── mcp-widget-zoom.tsx     ← toolbar injection (zoom, expand, export)
│   │   └── inline-agent-status.tsx ← replaces CopilotKit spinner with contextual labels
│   ├── lib/
│   │   └── prepare-elements.ts   ← converts shorthand elements + restores fonts before render
│   └── skills/                   ← system prompts for each diagram style
└── server/
    └── src/
        ├── main.ts               ← HTTP server
        ├── server.ts             ← MCP tools (read_me, create_view)
        ├── mcp-app.tsx           ← widget: SVG rendering, reveal animation
        └── checkpoint-store.ts   ← file, memory, and Redis storage
```

The agent calls `create_view` on the MCP server with a JSON array of Excalidraw elements. The server saves them as a checkpoint and returns an iframe widget. CopilotKit renders that iframe in chat via the MCP Apps protocol. The widget replays the elements one by one, calling `exportToSvg` and diffing the DOM with morphdom for a live drawing effect.

Each checkpoint is a JSON file on disk (default) or in Redis (Vercel), keyed by an 18-char ID. Opening "Edit with AI" from a workspace loads the checkpoint into chat context, auto-renders the current diagram, and syncs any AI edits back to the workspace.

## Stack

| | |
|---|---|
| Chat UI | [CopilotKit v2](https://docs.copilotkit.ai/reference/v2) — `CopilotChat`, `MCPAppsMiddleware` |
| Agent | `BuiltInAgent` connecting directly to LLM |
| Diagram rendering | `@excalidraw/excalidraw` — `exportToSvg` + [morphdom](https://github.com/patrick-steele-idem/morphdom) |
| MCP transport | `@modelcontextprotocol/sdk` Streamable HTTP |
| Storage | File system (local) / [Upstash Redis](https://www.npmjs.com/package/@upstash/redis) (Vercel) |
| Frontend | Next.js 16, Tailwind CSS 4 |

## Environment Variables

| Variable | Default | |
|---|---|---|
| `OPENAI_API_KEY` | | required |
| `MCP_SERVER_URL` | `http://localhost:3001/mcp` | MCP server endpoint |
| `KV_REST_API_URL` | | Upstash Redis URL (Vercel) |
| `KV_REST_API_TOKEN` | | Upstash Redis token (Vercel) |

## Deploying

The Next.js app deploys to Vercel out of the box. The MCP server runs as a separate service on Docker, Railway, or Render. For Vercel deployments, use the included `api/mcp.ts` handler with `createVercelStore()` for Redis-backed persistence.

## License

MIT
