"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "excalidraw-workspace" && e.data?.checkpointId) {
        window.open(`/workspace/${e.data.checkpointId}`, "_blank");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <main className="h-screen w-screen flex bg-white justify-center items-center">
      <CopilotChat className="w-1/2 h-full" />
    </main>
  );
}
