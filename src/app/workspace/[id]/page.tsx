"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type StoredElement = { id: string; type: string } & Record<string, unknown>;

// Excalidraw is browser-only
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <LoadingCanvas /> },
);

function LoadingCanvas() {
  return (
    <div className="flex h-full items-center justify-center text-gray-400">
      Loading canvas…
    </div>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [initialElements, setInitialElements] = useState<
    StoredElement[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/checkpoint/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Checkpoint not found");
        return r.json() as Promise<{ elements: StoredElement[] }>;
      })
      .then((data) => {
        setInitialElements(data.elements ?? []);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  const handleChange = useCallback(
    (elements: readonly StoredElement[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaved(false);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/checkpoint/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ elements }),
        }).then(() => setSaved(true));
      }, 2000);
    },
    [id],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ← Back to Chat
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111", flex: 1 }}>
          Workspace
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>
          {saved ? "Saved" : "Editing…"}
        </span>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        {loading && <LoadingCanvas />}
        {error && (
          <div className="flex h-full items-center justify-center text-red-500">
            {error}
          </div>
        )}
        {!loading && !error && initialElements !== null && (
          <Excalidraw
            initialData={{ elements: initialElements, scrollToContent: true }}
            onChange={handleChange}
            theme="light"
          />
        )}
      </div>
    </div>
  );
}
