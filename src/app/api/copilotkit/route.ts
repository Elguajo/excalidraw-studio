import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";

const agent = new BuiltInAgent({
  model: "openai/gpt-5.2",
  prompt: `You are an AI diagramming assistant powered by Excalidraw.

When a user asks for ANY diagram, chart, flowchart, architecture, sequence diagram, mind map, graph, visual explanation, or sketch — ALWAYS draw it using the tools:
1. Call read_me first (only once per conversation) to learn the element format
2. Call create_view to render the diagram

NEVER respond with a text description, markdown, SVG code, or image when a diagram was requested. Always use create_view.

If the user asks a general question (not about diagrams), answer normally. But if there's any ambiguity — lean toward drawing.`,
}).use(
  new MCPAppsMiddleware({
    mcpServers: [
      {
        type: "http",
        url: process.env.MCP_SERVER_URL ?? "http://localhost:3001/mcp",
        serverId: "my-server", // stable identifier
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
