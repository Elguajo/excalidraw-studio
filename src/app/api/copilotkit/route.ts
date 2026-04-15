import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";
import { excalidrawSkill } from "@/skills/excalidraw-diagram";
import { createOpenAI } from "@ai-sdk/openai";

// ---------------------------------------------------------------------------
// Model resolution
//
// Priority order (first match wins):
//   1. OLLAMA_MODEL  →  local Ollama via OpenAI-compatible API
//   2. AI_MODEL      →  any built-in string ("openai:gpt-4o", "anthropic:claude-sonnet-4-6", etc.)
//   3. default       →  "openai/gpt-4o"
// ---------------------------------------------------------------------------

function resolveModel() {
  // --- Ollama (local) ---
  const ollamaModel = process.env.OLLAMA_MODEL;
  if (ollamaModel) {
    const ollamaBaseURL =
      process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
    const ollama = createOpenAI({
      baseURL: ollamaBaseURL,
      // Ollama does not require a real API key, but the SDK requires a non-empty string
      apiKey: "ollama",
    });
    return ollama(ollamaModel);
  }

  // --- Generic built-in string (openai / anthropic / google / etc.) ---
  const aiModel = process.env.AI_MODEL;
  if (aiModel) {
    return aiModel;
  }

  // --- Default ---
  return "openai/gpt-4o";
}

const agent = new BuiltInAgent({
  model: resolveModel(),
  prompt: excalidrawSkill,
}).use(
  new MCPAppsMiddleware({
    mcpServers: [
      {
        type: "http",
        url: process.env.MCP_SERVER_URL ?? "http://localhost:3001/mcp",
        serverId: "my-server",
      },
    ],
  }),
);

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    default: agent,
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
