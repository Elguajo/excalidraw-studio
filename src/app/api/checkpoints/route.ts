const MCP_BASE =
  process.env.MCP_SERVER_URL?.replace("/mcp", "") ?? "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${MCP_BASE}/checkpoints`);
  if (!res.ok) return Response.json([], { status: 200 });
  const data = await res.json();
  return Response.json(data);
}
