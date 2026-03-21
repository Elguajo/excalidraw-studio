import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";
import { excalidrawSkill } from "@/skills/excalidraw-diagram";

const agent = new BuiltInAgent({
  model: "openai/gpt-5.2",
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
