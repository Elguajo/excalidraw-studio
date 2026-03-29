"use client";

import { useEffect, useRef } from "react";

/**
 * Observes the DOM for MCP Apps widget containers (rendered by CopilotKit's
 * MCPAppsActivityRenderer) and injects zoom / expand controls around them.
 *
 * Identification heuristic: a <div> with inline style `min-height: 100px`
 * that contains an <iframe> created by the renderer.
 */
export function McpWidgetZoom() {
  const processed = useRef(new WeakSet<Element>());

  useEffect(() => {
    function injectControls(container: HTMLElement) {
      if (processed.current.has(container)) return;
      processed.current.add(container);

      let zoom = 1;
      const iframe = container.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe) return;

      // Wrap iframe in a zoom-clip div
      const clipDiv = document.createElement("div");
      clipDiv.style.overflow = "auto";
      clipDiv.style.position = "relative";
      clipDiv.style.width = "100%";
      clipDiv.style.flex = "1";
      clipDiv.style.background = "#fff";
      iframe.parentNode?.insertBefore(clipDiv, iframe);
      clipDiv.appendChild(iframe);

      const TOOLBAR_H = 40;
      const MAX_H = 900;
      let isFullscreen = false;

      // Resize container + iframe to fit diagram content height
      function sizeWidget(diagramH: number) {
        if (isFullscreen) {
          // In fullscreen: only update iframe height so clipDiv can scroll
          if (iframe) iframe.style.height = `${diagramH}px`;
          return;
        }
        const total = Math.min(diagramH + TOOLBAR_H, MAX_H);
        container.style.height = `${total}px`;
        container.style.minHeight = `${total}px`;
        clipDiv.style.height = `${total - TOOLBAR_H}px`;
        if (iframe) iframe.style.height = `${total - TOOLBAR_H}px`;
      }

      // Initial size: 4:3 default until first render
      const initW = container.offsetWidth || 600;
      let lastDiagramH = Math.round((initW * 3) / 4);
      sizeWidget(lastDiagramH);

      // Update size when widget reports natural dimensions
      const dimHandler = (e: MessageEvent) => {
        if (e.data?.type === "excalidraw-widget-dimensions") {
          lastDiagramH = e.data.height as number;
          sizeWidget(lastDiagramH);
        }
      };
      window.addEventListener("message", dimHandler);

      // Toolbar
      const toolbar = document.createElement("div");
      toolbar.style.cssText =
        "display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:4px 8px;";

      const btnStyle =
        "background:transparent;border:none;cursor:pointer;padding:2px 6px;" +
        "color:#6b7280;font-size:13px;font-family:inherit;border-radius:4px;";

      const zoomOut = document.createElement("button");
      zoomOut.textContent = "−";
      zoomOut.title = "Zoom out";
      zoomOut.style.cssText = btnStyle;

      const zoomLabel = document.createElement("span");
      zoomLabel.textContent = "100%";
      zoomLabel.style.cssText =
        "font-size:12px;color:#6b7280;min-width:36px;text-align:center;";

      const zoomIn = document.createElement("button");
      zoomIn.textContent = "+";
      zoomIn.title = "Zoom in";
      zoomIn.style.cssText = btnStyle;

      const fitBtn = document.createElement("button");
      fitBtn.textContent = "Fit";
      fitBtn.title = "Reset zoom";
      fitBtn.style.cssText = btnStyle + "font-size:11px;";

      const sep = document.createElement("div");
      sep.style.cssText = "width:1px;height:16px;background:#e5e7eb;margin:0 4px;";

      const expandBtn = document.createElement("button");
      expandBtn.textContent = "⤢ Expand";
      expandBtn.style.cssText = btnStyle;

      // Export button
      const sep2 = document.createElement("div");
      sep2.style.cssText = "width:1px;height:16px;background:#e5e7eb;margin:0 4px;";

      const exportBtn = document.createElement("button");
      exportBtn.innerHTML =
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="display:inline-block;vertical-align:middle;margin-right:3px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export';
      exportBtn.title = "Export diagram";
      exportBtn.style.cssText = btnStyle + "font-size:11px;display:flex;align-items:center;";

      // Helper: get SVG string from cross-origin iframe via postMessage
      function getSvgFromWidget(): Promise<string | null> {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            window.removeEventListener("message", handler);
            resolve(null);
          }, 3000);
          const handler = (e: MessageEvent) => {
            if (e.data?.type === "excalidraw-svg-data") {
              clearTimeout(timeout);
              window.removeEventListener("message", handler);
              resolve(e.data.svg as string);
            }
          };
          window.addEventListener("message", handler);
          iframe.contentWindow?.postMessage({ type: "excalidraw-export-request" }, "*");
        });
      }

      // Helper: render SVG to canvas at 2× scale
      function svgToCanvas(svgStr: string, mimeType: string, bg: string | null, cb: (canvas: HTMLCanvasElement) => void) {
        const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = 2;
          canvas.width = img.naturalWidth * scale;
          canvas.height = img.naturalHeight * scale;
          const ctx = canvas.getContext("2d")!;
          ctx.scale(scale, scale);
          if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight); }
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          cb(canvas);
        };
        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;
      }

      function downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }

      // Export modal
      exportBtn.addEventListener("click", async () => {
        const svgStr = await getSvgFromWidget();
        if (!svgStr) return;

        // Build modal
        const overlay = document.createElement("div");
        overlay.style.cssText =
          "position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;";

        const modal = document.createElement("div");
        modal.style.cssText =
          "background:#fff;border-radius:16px;padding:28px;width:90vw;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.2);font-family:inherit;";

        const title = document.createElement("p");
        title.textContent = "Export diagram";
        title.style.cssText = "font-size:15px;font-weight:600;color:#111;margin:0 0 4px;";

        const subtitle = document.createElement("p");
        subtitle.textContent = "Choose a format";
        subtitle.style.cssText = "font-size:12px;color:#9ca3af;margin:0 0 20px;";

        const btnRowStyle =
          "width:100%;display:flex;align-items:center;gap:14px;padding:14px 18px;border:1.5px solid #e5e7eb;" +
          "border-radius:12px;background:#fff;cursor:pointer;font-family:inherit;margin-bottom:10px;text-align:left;box-sizing:border-box;";

        function makeExportRow(icon: string, label: string, desc: string, action: () => void) {
          const row = document.createElement("button");
          row.style.cssText = btnRowStyle;
          row.innerHTML = `
            <span style="font-size:20px;width:32px;text-align:center;">${icon}</span>
            <span>
              <span style="display:block;font-size:13px;font-weight:600;color:#111;">${label}</span>
              <span style="display:block;font-size:11px;color:#9ca3af;margin-top:1px;">${desc}</span>
            </span>`;
          row.addEventListener("mouseenter", () => { row.style.borderColor = "#6965db"; row.style.background = "#6965db08"; });
          row.addEventListener("mouseleave", () => { row.style.borderColor = "#e5e7eb"; row.style.background = "#fff"; });
          row.addEventListener("click", () => { action(); overlay.remove(); });
          return row;
        }

        const copyRow = makeExportRow("📋", "Copy to clipboard", "Copy as PNG — paste anywhere", () => {
          svgToCanvas(svgStr, "image/png", "#ffffff", (canvas) => {
            canvas.toBlob(async (blob) => {
              if (!blob) return;
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            }, "image/png");
          });
        });

        const pngRow = makeExportRow("🖼", "Download PNG", "Best for presentations and sharing", () => {
          svgToCanvas(svgStr, "image/png", "#ffffff", (canvas) => {
            canvas.toBlob((blob) => { if (blob) downloadBlob(blob, "diagram.png"); }, "image/png");
          });
        });

        const jpegRow = makeExportRow("📷", "Download JPEG", "Smaller file size, white background", () => {
          svgToCanvas(svgStr, "image/jpeg", "#ffffff", (canvas) => {
            canvas.toBlob((blob) => { if (blob) downloadBlob(blob, "diagram.jpg"); }, "image/jpeg", 0.92);
          });
        });

        const svgRow = makeExportRow("✏️", "Download SVG", "Vector format, scales to any size", () => {
          const blob = new Blob([svgStr], { type: "image/svg+xml" });
          downloadBlob(blob, "diagram.svg");
        });

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Cancel";
        closeBtn.style.cssText =
          "width:100%;margin-top:4px;padding:8px;border:none;background:transparent;" +
          "color:#9ca3af;font-size:12px;cursor:pointer;font-family:inherit;border-radius:8px;";
        closeBtn.addEventListener("click", () => overlay.remove());

        modal.append(title, subtitle, copyRow, pngRow, jpegRow, svgRow, closeBtn);
        overlay.appendChild(modal);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
      });

      toolbar.append(zoomOut, zoomLabel, zoomIn, fitBtn, sep, expandBtn, sep2, exportBtn);
      container.insertBefore(toolbar, container.firstChild);

      function applyZoom() {
        iframe.style.transform = `scale(${zoom})`;
        iframe.style.transformOrigin = "top left";
        iframe.style.width = `${100 / zoom}%`;
        zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
      }

      zoomOut.addEventListener("click", () => {
        zoom = Math.max(0.25, zoom - 0.25);
        applyZoom();
      });
      zoomIn.addEventListener("click", () => {
        zoom = Math.min(3, zoom + 0.25);
        applyZoom();
      });
      fitBtn.addEventListener("click", () => {
        zoom = 1;
        applyZoom();
      });

      // Fullscreen modal
      let originalContainerCssText = "";
      expandBtn.addEventListener("click", () => {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
          originalContainerCssText = container.style.cssText;
          container.style.cssText =
            "position:fixed;top:10%;left:12.5%;width:75%;height:80%;z-index:9999;" +
            "background:var(--background,#fff);border-radius:16px;" +
            "box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;";
          clipDiv.style.flex = "1";
          clipDiv.style.minHeight = "0"; // required for flex child to scroll
          clipDiv.style.height = "0";    // let flex determine height, not content
          clipDiv.style.overflow = "auto";
          // Restore natural diagram height so clipDiv can scroll when taller than viewport
          sizeWidget(lastDiagramH);
          expandBtn.textContent = "✕ Close";
          const backdrop = document.createElement("div");
          backdrop.id = "mcp-zoom-backdrop";
          backdrop.style.cssText =
            "position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.5);";
          backdrop.addEventListener("click", () => expandBtn.click());
          document.body.appendChild(backdrop);
        } else {
          container.style.cssText = originalContainerCssText;
          clipDiv.style.flex = "";
          clipDiv.style.minHeight = "";
          clipDiv.style.overflow = "auto";
          clipDiv.style.height = container.dataset.originalHeight || "auto";
          expandBtn.textContent = "⤢ Expand";
          document.getElementById("mcp-zoom-backdrop")?.remove();
        }
      });

      // Escape key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isFullscreen) expandBtn.click();
      };
      window.addEventListener("keydown", handleEsc);
    }

    function scanForMcpWidgets() {
      document.querySelectorAll<HTMLElement>("div[style]").forEach((div) => {
        const style = div.style;
        if (
          style.minHeight === "100px" &&
          style.overflow === "hidden" &&
          style.position === "relative" &&
          div.querySelector("iframe") &&
          !processed.current.has(div)
        ) {
          div.dataset.originalHeight = style.height;
          injectControls(div);
        }
      });
    }

    const observer = new MutationObserver(() => scanForMcpWidgets());
    observer.observe(document.body, { childList: true, subtree: true });
    scanForMcpWidgets();

    return () => observer.disconnect();
  }, []);

  return null;
}
