# Excalidraw Studio

An MCP-powered AI diagramming app built with [CopilotKit](https://copilotkit.ai) and modified [Excalidraw MCP server](https://github.com/excalidraw/excalidraw-mcp). Describe anything in chat and get a fully editable Excalidraw diagram back in seconds.

https://github.com/user-attachments/assets/18dd56de-6f14-4a1d-b743-52fccf145bbe

## What It Does

- Diagrams render as actual Excalidraw elements via [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview)
- Every result opens as a full editable local canvas - drag, reshape, annotate freely
- Every diagram auto-saves to disk - no database needed, Redis supported for Vercel if you wish to deploy
- Workspaces page to browse, rename, and delete all your saved diagrams
- One click to push any diagram live to Excalidraw straight from chat

## Quick Start

```bash
# install dependencies
npm install
cd server && npm install && npm run build && cd ..

# run
npm run dev                    # → http://localhost:3000
cd server && npm run serve     # → http://localhost:3001
```

Create `.env.local` in the root and add your [OpenAI API key](https://platform.openai.com/settings/organization/api-keys).

```
OPENAI_API_KEY=sk-proj-...
```

## Switching Models

If you want to use a different LLM, pass the model string to `BuiltInAgent` in `src/app/api/copilotkit/route.ts`. Everything else stays the same.

```typescript
// Anthropic
const builtInAgent = new BuiltInAgent({ model: "anthropic:claude-sonnet-4-6" });

// Google
const builtInAgent = new BuiltInAgent({ model: "google:gemini-2.5-flash" });
```

Add the matching API key to `.env.local` and you are done (for instance `ANTHROPIC_API_KEY=sk-ant-`). For Azure OpenAI, AWS Bedrock, Ollama and other providers, see the [model selection docs](https://docs.copilotkit.ai/integrations/built-in-agent/model-selection).

## How It Works

```
├── src/
│   └── app/
│       ├── page.tsx              ← chat UI and welcome screen
│       ├── workspace/[id]/       ← full Excalidraw editor
│       ├── workspaces/           ← saved diagrams list
│       ├── api/copilotkit/       ← CopilotKit runtime and agent
│       ├── api/checkpoints/      ← list all saved checkpoints
│       └── api/checkpoint/[id]/  ← get, update, delete a checkpoint
└── server/
    └── src/
        ├── main.ts               ← HTTP server, REST endpoints
        ├── server.ts             ← MCP tools (read_me, create_view)
        └── checkpoint-store.ts   ← file, memory, and Redis storage
```

The agent calls `create_view` on the MCP server with a JSON array of Excalidraw elements. The server saves them as a checkpoint and returns an iframe URL. CopilotKit renders that iframe in chat via the MCP Apps protocol. The widget turns the elements into an SVG using `exportToSvg` and updates it live with morphdom as new elements arrive.

Each checkpoint is a JSON file on disk (default) or in Redis (Vercel), keyed by an 18-char ID. Opening a diagram in Workspace loads that checkpoint via REST and mounts the full editable Excalidraw canvas. Edits debounce-save back automatically.

## Stack

|                   |                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chat UI           | [CopilotKit v2](https://docs.copilotkit.ai/reference/v2) - [`CopilotChat`](https://docs.copilotkit.ai/reference/v2/components/CopilotChat), [`MCPAppsMiddleware`](https://docs.copilotkit.ai/learn/generative-ui/specs/mcp-apps)                       |
| Agent             | [`BuiltInAgent`](https://docs.copilotkit.ai/integrations/built-in-agent/quickstart) connecting directly to LLM                                                                                                                                         |
| Diagram rendering | [`@excalidraw/excalidraw`](https://www.npmjs.com/package/@excalidraw/excalidraw) - [`exportToSvg`](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export#exporttosvg) + [morphdom](https://github.com/patrick-steele-idem/morphdom) |
| MCP transport     | [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) Streamable HTTP                                                                                                                                                 |
| Storage           | File system (local) / [Upstash Redis](https://www.npmjs.com/package/@upstash/redis) (Vercel)                                                                                                                                                           |
| Frontend          | Next.js 15, Tailwind CSS 4                                                                                                                                                                                                                             |

## Environment Variables

| Variable            | Default                     |                                |
| ------------------- | --------------------------- | ------------------------------ |
| `OPENAI_API_KEY`    |                             | required                       |
| `MCP_SERVER_URL`    | `http://localhost:3001/mcp` | MCP server endpoint            |
| `KV_REST_API_URL`   |                             | Upstash Redis URL for Vercel   |
| `KV_REST_API_TOKEN` |                             | Upstash Redis token for Vercel |

## Deploying

The Next.js app deploys to Vercel out of the box. The MCP server runs as a separate service on Docker, Railway, or Render. For Vercel deployments, use the included `api/mcp.ts` handler with `createVercelStore()` for Redis-backed persistence.

## License

MIT
