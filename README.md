# Excalidraw Studio

An open-source AI diagramming studio built with [CopilotKit](https://copilotkit.ai) and the [Excalidraw MCP server](https://github.com/excalidraw/excalidraw-mcp). Describe any system, flow, or concept — the agent streams hand-crafted Excalidraw diagrams element by element, live in chat. Every diagram opens into a full workspace to edit freely; refine with AI and it picks up exactly where you left off.

https://github.com/user-attachments/assets/18dd56de-6f14-4a1d-b743-52fccf145bbe

## What It Does

- **AI draws diagrams in chat** - Ask for a microservices architecture, a sequence diagram, a CI/CD pipeline, or anything else. The agent streams Excalidraw elements with smooth draw-on animations and animated camera pans.
- **Live in-chat rendering** - Diagrams render as interactive iframes directly in the chat via CopilotKit's MCP Apps protocol. No separate window needed.
- **Saved workspaces** - Every diagram is auto-saved to disk and listed on the Workspaces page with its title and timestamp — ready to revisit or edit anytime.
- **Workspace editing** - Click "Workspace" on any diagram to open it as a full editable Excalidraw canvas. Edits are saved back automatically. Ask the AI to refine and it picks up from your latest version.
- **Export to excalidraw.com** - One click to upload any diagram to excalidraw.com.

## Quick Start

```bash
# Install Next.js app dependencies
npm install

# Install and build the MCP server
cd server && npm install && npm run build && cd ..

# Set your API key
echo 'OPENAI_API_KEY=your-key-here' > .env.local

# Run locally
npm run dev          # Next.js on http://localhost:3000
cd server && npm run serve   # MCP server on http://localhost:3001
```

Open http://localhost:3000 and start typing a diagram description.

## Architecture

```
src/       Next.js 15 app — chat UI, workspace editor, CopilotKit runtime
server/    Standalone MCP server — drawing tools, SVG widget, checkpoint store
```

### How It Works

The agent uses the Excalidraw MCP server over Streamable HTTP via CopilotKit's `MCPAppsMiddleware`. When asked to draw, it calls `create_view` with a JSON array of Excalidraw elements. The server saves the elements as a checkpoint, and CopilotKit renders the MCP Apps resource as an iframe in chat. The widget streams each element into an SVG using `exportToSvg` + morphdom diffing, so shapes appear one by one with draw-on animations and the camera pans as the diagram grows.

Each checkpoint is a JSON file on disk (local) or in Redis (Vercel), keyed by an 18-char ID. Opening a diagram in Workspace loads that checkpoint via REST and mounts the full editable Excalidraw canvas. Edits are debounce-saved back to the same
checkpoint, so the AI can restore the latest state (including manual edits) when iterating.

### Stack

| Layer             | Tech                                                  |
| ----------------- | ----------------------------------------------------- |
| Chat UI           | CopilotKit v2 (`CopilotChat`, `MCPAppsMiddleware`)    |
| Agent             | `BuiltInAgent` with OpenAI GPT                        |
| Diagram rendering | `@excalidraw/excalidraw` - `exportToSvg` + morphdom   |
| MCP transport     | `@modelcontextprotocol/sdk` Streamable HTTP           |
| Storage           | File system (local) · Memory · Upstash Redis (Vercel) |
| Frontend          | Next.js 15, React, Tailwind CSS 4                     |

## Environment Variables

| Variable            | Default                     | Description                               |
| ------------------- | --------------------------- | ----------------------------------------- |
| `OPENAI_API_KEY`    | —                           | Required. Your OpenAI API key.            |
| `MCP_SERVER_URL`    | `http://localhost:3001/mcp` | URL of the MCP server's `/mcp` endpoint.  |
| `KV_REST_API_URL`   | —                           | Upstash Redis URL (Vercel deployments).   |
| `KV_REST_API_TOKEN` | —                           | Upstash Redis token (Vercel deployments). |

## Deploying

The Next.js app deploys to Vercel out of the box. The MCP server can be deployed as a separate service (Docker, Railway, Render) or as a Vercel serverless function using the included `api/mcp.ts` handler with `createVercelStore()` for Redis-backed persistence.

## License

MIT
