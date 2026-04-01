import { NextRequest, NextResponse } from "next/server";

const MCP_BASE = process.env.MCP_SERVER_URL ?? "http://localhost:3001";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${MCP_BASE}/checkpoint/${id}`);
  if (!res.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(await res.json());
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${MCP_BASE}/checkpoint/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${MCP_BASE}/checkpoint/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hard = req.nextUrl.searchParams.get("hard");
  const url = hard === "true"
    ? `${MCP_BASE}/checkpoint/${id}?hard=true`
    : `${MCP_BASE}/checkpoint/${id}`;
  const res = await fetch(url, { method: "DELETE" });
  return NextResponse.json(await res.json());
}
