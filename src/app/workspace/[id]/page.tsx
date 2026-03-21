"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

// Excalidraw is browser-only
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <LoadingCanvas /> },
);

// Only runs convertToExcalidrawElements when elements still have label shorthand
// (not yet converted). Saved checkpoints are already fully converted by the
// server, so running this again shifts text positions -- avoid it for those
async function prepareElements(
  normalized: any[],
): Promise<ExcalidrawElement[]> {
  const hasLabels = normalized.some((el: any) => el.label != null);
  if (!hasLabels) return normalized as ExcalidrawElement[];

  const { convertToExcalidrawElements, FONT_FAMILY } =
    await import("@excalidraw/excalidraw");
  const excalifont = (FONT_FAMILY as any).Excalifont ?? 1;
  const fontName = excalifont > 3 ? "Excalifont" : "Virgil";
  await Promise.race([
    document.fonts.load(`16px "${fontName}"`),
    new Promise<void>((r) => setTimeout(r, 3000)),
  ]);
  const withFonts = normalized.map((el: any) =>
    el.label
      ? {
          ...el,
          label: {
            textAlign: "center",
            verticalAlign: "middle",
            fontFamily: excalifont,
            ...el.label,
          },
        }
      : el.type === "text"
        ? { ...el, fontFamily: el.fontFamily ?? excalifont }
        : el,
  );
  return convertToExcalidrawElements(withFonts as any, {
    regenerateIds: false,
  }) as ExcalidrawElement[];
}

function LoadingCanvas() {
  return (
    <div className="flex h-full items-center justify-center gap-3 text-gray-400">
      <svg
        className="animate-spin"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
      </svg>
      <span className="text-sm">Loading diagram…</span>
    </div>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [initialElements, setInitialElements] = useState<
    ExcalidrawElement[] | null
  >(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const rawNormalizedRef = useRef<any[] | null>(null);
  const suppressOnChangeRef = useRef(false);
  const savedVersionSumRef = useRef(0);
  const currentElementsRef = useRef<readonly ExcalidrawElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "unsaved",
  );
  const [title, setTitle] = useState<string>("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/checkpoint/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          // Workspace was deleted — recreate it with the same ID so links still work
          await fetch(`/api/checkpoint/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: [], title: "Untitled" }),
          });
          return { elements: [], title: "Untitled" } as {
            elements: ExcalidrawElement[];
            title?: string;
          };
        }
        if (!r.ok) throw new Error("Failed to load workspace");
        return r.json() as Promise<{
          elements: ExcalidrawElement[];
          title?: string;
          redirectTo?: string;
        }>;
      })
      .then(async (data) => {
        if (data.redirectTo) {
          router.replace(`/workspace/${data.redirectTo}`);
          return;
        }
        const raw: ExcalidrawElement[] = data.elements ?? [];
        const normalized = raw
          .filter((el) => el != null && el.id && el.type)
          .map((el) => ({
            ...el,
            boundElements: el.boundElements ?? [],
            groupIds: (el as any).groupIds ?? [],
          }));
        rawNormalizedRef.current = normalized;
        const converted = await prepareElements(normalized);
        savedVersionSumRef.current = converted.reduce(
          (s, el: any) => s + (el.version ?? 0),
          0,
        );
        setInitialElements(converted);
        const t = data.title ?? "";
        setTitle(t);
        if (normalized.length === 0 && (!t || t === "Untitled")) {
          setEditingTitle(true);
          setTitleDraft("");
        }
        setSaveStatus("saved");
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  // Post-mount: re-convert with fully-loaded fonts then scroll to fit.
  // Excalidraw registers Excalifont/Virgil programmatically after mount so
  // measureText inside convertToExcalidrawElements produces correct widths here.
  // suppressOnChangeRef blocks handleChange for 1500ms so the updateScene call
  // doesn't flip the indicator to "unsaved".
  useEffect(() => {
    if (!excalidrawAPI || !rawNormalizedRef.current) return;
    const normalized = rawNormalizedRef.current;
    prepareElements(normalized).then((converted) => {
      suppressOnChangeRef.current = true;
      excalidrawAPI.updateScene({ elements: converted });
      excalidrawAPI.scrollToContent(converted, {
        fitToContent: true,
        animate: false,
      });
      setTimeout(() => {
        suppressOnChangeRef.current = false;
        const els = excalidrawAPI.getSceneElements();
        savedVersionSumRef.current = els.reduce(
          (s: number, el: any) => s + (el.version ?? 0),
          0,
        );
        setSaveStatus("saved");
      }, 1500);
    });
  }, [excalidrawAPI]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  function saveTitle(value: string) {
    const trimmed = value.trim();
    setTitle(trimmed);
    setEditingTitle(false);
    fetch(`/api/checkpoint/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    }).catch(() => {});
  }

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (suppressOnChangeRef.current) return;
      currentElementsRef.current = elements;
      const versionSum = elements.reduce(
        (s, el: any) => s + (el.version ?? 0),
        0,
      );
      if (versionSum === savedVersionSumRef.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("unsaved");
      saveTimer.current = setTimeout(() => {
        const els = currentElementsRef.current;
        const sum = els.reduce((s, el: any) => s + (el.version ?? 0), 0);
        setSaveStatus("saving");
        fetch(`/api/checkpoint/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ elements: els }),
        }).then(() => {
          savedVersionSumRef.current = sum;
          setSaveStatus("saved");
        });
      }, 5000);
    },
    [id],
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0 z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M7.5 1.5L3 6l4.5 4.5" />
          </svg>
          Chat
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#6965DB"
            className="shrink-0"
          >
            <path d="M23.9428 19.8058a.1962.1962 0 0 0-.1679-.0337c-1.26-1.8552-2.8727-3.6104-4.4186-5.3152l-.2521-.284c-.0016-.0732-.0667-.1207-.1342-.1504-.0284-.0277-.0562-.0558-.0843-.0837-.0505-.1005-.1685-.1673-.2858-.1005-.4706.2347-.9068.5855-1.3274.9195-.5536.4345-1.1085.8695-1.6296 1.354a5.0577 5.0577 0 0 0-.5879.6185c-.0842.1168-.0168.2172.0843.2672-.3701.3677-.7402.736-1.109 1.1198a.1896.1896 0 0 0-.0506.1342c0 .05.0337.1.0668.1168l.6559.5012v.0169c.9237.9194 2.5538 2.1729 4.2844 3.5268.2515.201.5205.4014.7727.6017.1173.1342.2346.2847.3357.4182.0506.0662.1685.0837.2353.0331.0337.0337.0843.0668.118.1005a.2395.2395 0 0 0 .1004.0337.1534.1534 0 0 0 .1348-.0668.2371.2371 0 0 0 .0331-.1004c.0175 0 .0169.0168.0337.0168a.1915.1915 0 0 0 .1348-.0505l3.058-3.3265c.1198-.1159.0135-.2668-.0005-.2672zm-7.6277-.1336-1.5459-1.1704-.151-.0998c-.0337-.0169-.0674-.0506-.1011-.0668l-.1174-.1005c.6597-.659 1.3297-1.3074 1.9996-1.9557-.4874.4844-1.4622 1.9057-1.2606 2.3733.0023 0 .0186.0419.0674.0842.3704.311.7398.6232 1.109.9357zm4.0997 3.1261-1.277-.97a26.9056 26.9056 0 0 0-1.5795-1.5044c.689.5181 1.2769.9694 1.3611 1.053.6722.585.6379.485 1.0922.8696l.5542.4008c-.0735.103-.151.1477-.151.151zm.3357.2503-.0337-.0168c.0506-.0331.1011-.0668.1517-.1168zM.5885 3.4751c.0331.2172.0843.4344.1174.6354.2015 1.103.4031 2.1061.7726 2.8583l.1516.568c.0506.2173.1342.485.2185.5519.8568.7521 2.1674 1.8714 3.5785 2.9419a.1775.1775 0 0 0 .2185 0s0 .0162.0168.0162a.1528.1528 0 0 0 .118.0506.1912.1912 0 0 0 .1341-.0506c1.798-1.9887 3.1418-3.6267 4.0997-4.9974.0674-.0668.0843-.1673.0843-.251.0668-.0668.1173-.1504.1847-.2004.0668-.0668.0668-.184 0-.2346l-.0168-.0163c0-.033-.0169-.0836-.0506-.1005-.42-.4007-.722-.6848-1.0416-.9856A93.5546 93.5546 0 0 1 6.822 1.9876c-.0169-.0169-.0337-.0337-.0674-.0337-.3358-.1168-1.0248-.2341-1.8817-.3845C3.596 1.3527 1.865 1.0519.3027.583c0 0-.1011 0-.118.0169L.1348.6505C.0498.7139.0222.7058 0 .7167.017.8172.017.884.0506 1.0013c0 .0331.0673.3009.0673.334zm7.1909 4.7802-.0337.0337a.0362.0362 0 0 1 .0337-.0337zM6.553 2.238c.101.1005.5211.5019.6216.5855-.4369-.201-1.5284-.7022-2.0333-.8695.5043.1005 1.1933.201 1.4117.284ZM.7901 1.4027c.2521.4344.4537 1.9388.6553 3.4095-.118-.4682-.2016-.9357-.3027-1.3708C.9917 2.673.84 1.9876.6385 1.3858c.1232 0 .1516.0212.1516.0169zm-.2858-.3683c0-.0162 0-.033-.0169-.033.0843 0 .1342.0168.2016.0499.0006.0057-.1448-.0169-.1847-.0169zM23.6738.8172c.0169-.0662-.3358-.367-.2184-.3845.2527-.0163.2527-.4008 0-.4008-.3358.0169-.6884.0999-1.008.1504-.5878.1168-1.1926.2341-1.781.3671-1.327.2846-2.6375.5855-3.9481.937-.4032.1167-.857.2003-1.2432.4007-.1348.0668-.118.2004-.0506.284-.0337.0169-.0505.0169-.0842.0337-.1174.0169-.2185.0337-.3358.05-.1011.0168-.1516.1004-.1348.201 0 .0162.0169.0499.0169.0661-.7059.9363-1.4954 1.9226-2.3523 2.9757-.84.9694-1.7306 1.9893-2.6212 3.0424-2.8396 3.3096-6.0487 7.0705-9.5936 10.38a.1613.1613 0 0 0 0 .2341c.0169.0163.0337.0331.0506.0331-.0506.0506-.1011.0843-.1517.1336-.0337.0337-.0505.0668-.0505.1005a.364.364 0 0 0-.0668.0837c-.0674.0667-.0674.1835.0169.234.0667.0662.1847.0662.2346-.0168.0175-.0169.0175-.0337.0337-.0337a.2648.2648 0 0 1 .3701 0c.2016.2178.4032.435.588.6186l-.4201-.3508c-.0674-.0668-.1847-.05-.2347.0168-.068.0662-.0511.1835.0163.234l4.4691 3.7273c.0337.0337.0674.0337.118.0337.0505 0 .0842-.0169.1173-.0506l.101-.0999c.017.0163.05.0163.0669.0163.0505 0 .0842-.0163.118-.05 6.0486-6.0505 10.9216-10.6141 16.4997-14.6927.05-.0331.0668-.1.0668-.1505.0674 0 .118-.05.151-.1167 1.0254-3.1255 1.227-5.9007 1.2938-7.2709 0-.0579.0169-.0371.0169-.0668.0168-.0337.0168-.0505.0168-.0505a.9784.9784 0 0 0-.0668-.6186zm-10.82 4.9144c.2684-.3008.5374-.6186.8064-.9026-1.7306 2.2734-4.6033 5.7665-8.67 9.9288C7.7626 11.699 10.5517 8.54 12.854 5.7316ZM5.1414 23.4662c-.0162-.0168-.0162-.0168 0-.0168zm2.5033-2.156c.1348-.1505.2695-.284.4206-.4345 0 0 0 .0163.0168.0163-.2236.1978-.4334.4182-.4374.4182zm.6896-.6686c.0994-.0993.14-.1724.2852-.3177.9917-1.0193 2.0164-2.0393 3.058-3.0755l.0169-.0168c.2521-.2004.5542-.4177.8232-.6186a228.0627 228.0627 0 0 0-4.1833 4.0286zm6.5187-16.732c-.5543.719-1.1759 1.6716-1.697 2.4238-1.6463 2.3733-6.9393 8.1735-7.0566 8.274A1189.6473 1189.6473 0 0 1 1.26 19.204l-.1005.1005c-.0843-.1005-.0843-.251.0168-.3346 7.476-7.0037 12.0132-12.837 13.845-15.3944-.0506.1167-.0843.2166-.1685.334zm2.9064 3.4269c-.6716-.3851-.9905-.9869-.8064-1.5712l.0506-.201a.7753.7753 0 0 1 .0842-.1666c.1848-.301.4538-.5518.7564-.7023.0163 0 .0331 0 .05-.0168-.0169-.0337-.0169-.0837-.0169-.1336.0169-.1005.0843-.1673.2016-.1673.2016 0 .8238.1841 1.059.3845.0669.05.1343.1168.2017.1836.0842.1004.2184.2677.2852.4013.0337.0169.0674.1841.118.2678.0336.1336.0667.284.0505.4176-.0169.0169 0 .1167-.0169.1167a1.6055 1.6055 0 0 1-.2184.6186c-.0307.0307.0064.0119-.0505.0668-.0843.1342-.2016.251-.319.3346-.3869.2672-.8238.3508-1.2606.234-.1105-.0473-.1672-.0667-.1685-.0667zm4.3692 1.4039c0 .0168-.0168.0499 0 .0667-.0337 0-.0505.0169-.0842.0337-1.3274.9689-2.6212 1.9888-3.915 3.0256 1.109-.9868 2.218-1.9894 3.3776-2.9756.3358-.3009.5711-.6854.6379-1.1199l.1685-1.003v-.0332c.0842-.201.4032-.1173.3526.1-.0042-.0012-.1731.795-.5374 1.9057z" />
          </svg>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => saveTitle(titleDraft)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle(titleDraft);
                if (e.key === "Escape") {
                  setEditingTitle(false);
                  setTitleDraft(title);
                }
              }}
              placeholder="Name this workspace…"
              className="text-base font-semibold text-gray-800 bg-white border border-[#6965db]/40 rounded px-2 py-0.5 outline-none focus:border-[#6965db] min-w-0 w-48"
            />
          ) : (
            <button
              onClick={() => {
                setTitleDraft(title);
                setEditingTitle(true);
              }}
              className="flex items-center gap-1.5 group cursor-pointer min-w-0"
              title="Click to rename"
            >
              <span className="text-base font-semibold text-gray-800 truncate">
                {title || "Workspace"}
              </span>
              <svg
                className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <span className="text-[11px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded truncate hidden sm:block shrink-0">
            {id}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              saveStatus === "saved"
                ? "text-emerald-500"
                : saveStatus === "saving"
                  ? "text-blue-400"
                  : "text-gray-400"
            }`}
          >
            {saveStatus === "saved" && (
              <>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 5l2.5 2.5L8 2.5" />
                </svg>
                Saved
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <svg
                  className="animate-spin"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Unsaved
              </>
            )}
          </span>
          <div className="w-px h-4 bg-gray-200" />
          <Link
            href={`/?checkpoint=${id}`}
            className="flex items-center gap-1.5 text-sm text-[#6965db] hover:text-[#5b57d1] transition-colors px-2.5 py-1.5 rounded-md hover:bg-[#6965db]/5 border border-transparent hover:border-[#6965db]/20 cursor-pointer"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Edit with AI
          </Link>
          <div className="w-px h-4 bg-gray-200" />
          <Link
            href="/workspaces"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Workspaces
          </Link>
        </div>
      </header>
      <div className="flex-1 relative min-h-0">
        {loading && <LoadingCanvas />}
        {error && (
          <div className="flex h-full items-center justify-center gap-2 text-red-500 text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="7" />
              <path d="M8 5v4M8 11v.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}
        {!loading && !error && initialElements !== null && (
          <Excalidraw
            initialData={{
              elements: initialElements,
              scrollToContent: initialElements.length > 0,
            }}
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            onChange={handleChange}
            theme="light"
          />
        )}
      </div>
    </div>
  );
}
