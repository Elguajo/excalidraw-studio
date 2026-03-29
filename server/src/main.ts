/**
 * Entry point for running the MCP server.
 * Run with: npx @mcp-demos/excalidraw-server
 * Or: node dist/index.js [--stdio]
 */

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import type { Request, Response } from "express";
import {
  FileCheckpointStore,
  type CheckpointStore,
} from "./checkpoint-store.js";
import { createServer } from "./server.js";

/**
 * Starts an MCP server with Streamable HTTP transport in stateless mode.
 *
 * @param createServer - Factory function that creates a new McpServer instance per request.
 */
export async function startStreamableHTTPServer(
  createServer: () => McpServer,
  store: CheckpointStore,
): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);

  const app = createMcpExpressApp({ host: "0.0.0.0" });
  app.use(cors());
  app.use(express.json());

  // REST endpoints so the workspace page can read/write checkpoints
  app.post("/checkpoint", async (req: Request, res: Response) => {
    try {
      const id = crypto.randomUUID().replace(/-/g, "").slice(0, 18);
      await store.save(id, {
        elements: [],
        title: req.body?.title ?? "Untitled",
        _mtime: Date.now(),
      });
      res.json({ id });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  app.get("/checkpoints", async (_req: Request, res: Response) => {
    try {
      const list = await store.list();
      // Exclude soft-deleted checkpoints and draw_element session keys (draw-*)
      const visible = await Promise.all(
        list
          .filter((item) => !item.id.startsWith("draw-"))
          .map(async (item) => {
            const data = await store.load(item.id);
            return data?.deleted || data?.redirectTo ? null : item;
          }),
      );
      res.json(visible.filter(Boolean));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get("/checkpoint/:id", async (req: Request, res: Response) => {
    try {
      const data = await store.load(String(req.params.id));
      if (!data) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      // Auto-restore soft-deleted checkpoints when accessed directly
      if (data.deleted) {
        await store.save(String(req.params.id), { ...data, deleted: false });
      }
      res.json(data);
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  app.put("/checkpoint/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      // Merge with existing to preserve title when workspace saves elements only.
      // Always refresh _mtime so title-only PATCHes don't affect the diagram timestamp.
      const existing = await store.load(id);
      const merged = existing
        ? { ...existing, ...req.body, _mtime: Date.now() }
        : { ...req.body, _mtime: Date.now() };
      await store.save(id, merged);
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  app.patch("/checkpoint/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const existing = await store.load(id);
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      await store.save(id, {
        ...existing,
        title: req.body.title ?? existing.title,
      });
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  app.delete("/checkpoint/:id", async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      if (req.query.hard === "true") {
        // Hard delete - used for temp checkpoints created during session replace
        await store.delete(id);
        res.json({ ok: true });
        return;
      }
      const existing = await store.load(id);
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      // Soft delete — keeps elements so direct links still work
      await store.save(id, { ...existing, deleted: true });
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: String(e) });
    }
  });

  app.all("/mcp", async (req: Request, res: Response) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  const httpServer = app.listen(port, (err) => {
    if (err) {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
    console.log(`MCP server listening on http://localhost:${port}/mcp`);
  });

  const shutdown = () => {
    console.log("\nShutting down...");
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/**
 * Starts an MCP server with stdio transport.
 *
 * @param createServer - Factory function that creates a new McpServer instance.
 */
export async function startStdioServer(
  createServer: () => McpServer,
): Promise<void> {
  await createServer().connect(new StdioServerTransport());
}

async function main() {
  const store = new FileCheckpointStore();
  const factory = () => createServer(store);
  if (process.argv.includes("--stdio")) {
    await startStdioServer(factory);
  } else {
    await startStreamableHTTPServer(factory, store);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
