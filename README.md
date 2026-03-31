# Excalidraw Studio

Describe anything and watch it draw itself in chat, element by element. Refine it in chat or open it as a full Excalidraw canvas — draw more yourself, bring it back, keep iterating. Powered by [CopilotKit](https://copilotkit.ai) and a custom [Excalidraw MCP server](https://github.com/excalidraw/excalidraw-mcp).

https://github.com/user-attachments/assets/4cdf3662-4b02-4df6-9e2c-66518be7ea79

## What It Does

- **Live diagram rendering** : diagrams draw themselves inside chat as the AI responds, element by element.
- **Local Canvas** : every diagram has a "workspace" button. Click it and the canvas opens locally — drag, reshape, annotate, connect freely.
- **Workspaces** : every diagram auto-saves. Browse, rename, and delete all your saved diagrams from the Workspaces page. Each one is a checkpoint you can return to anytime.
- **Blank canvas** : create an empty canvas from Workspaces, draw something yourself, then bring it back to chat to edit with AI.
- **Edit with AI** : open any saved workspace, hit "Edit with AI" and the diagram loads straight into chat context. Describe changes and they sync back to the workspace.
- **Five diagram modes** : Architecture, Sequence Diagram, Wireframe, Freehand Sketch, and Storyboard. Your choice persists across sessions.
- **Export** : download as PNG, JPEG, or SVG, or copy to clipboard directly from the chat toolbar. Zoom and expand inline without leaving chat.
- **No database required** : everything saves to disk by default. Redis is supported for Vercel deployments.

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/c0bbf341-c4a9-44fb-86b3-a1ed5523fcf9" alt="Freehand sketch" width="400" /></td>                               
    <td><img src="https://github.com/user-attachments/assets/edeaeb7a-746e-4aa0-8362-e0cc3b3dce76" alt="Storyboard" width="400" /></td>                                      
    <td><img src="https://github.com/user-attachments/assets/08650072-bcff-42c2-a1a6-83ad803f9456" alt="Architecture diagram" width="400" /></td>  
  </tr>
</table>

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
