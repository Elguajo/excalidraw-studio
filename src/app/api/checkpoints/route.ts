import { NextRequest } from "next/server";

const MCP_BASE =
  process.env.MCP_SERVER_URL?.replace("/mcp", "") ?? "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${MCP_BASE}/checkpoints`);
  if (!res.ok) return Response.json([], { status: 200 });
  const data = await res.json();
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${MCP_BASE}/checkpoint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return Response.json(await res.json());
}
