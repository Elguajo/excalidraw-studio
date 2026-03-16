"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface CheckpointEntry {
  id: string;
  mtime: number;
  title?: string;
}

function formatDate(ms: number) {
  const d = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ExcalidrawLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#6965DB">
    <path d="M23.9428 19.8058a.1962.1962 0 0 0-.1679-.0337c-1.26-1.8552-2.8727-3.6104-4.4186-5.3152l-.2521-.284c-.0016-.0732-.0667-.1207-.1342-.1504-.0284-.0277-.0562-.0558-.0843-.0837-.0505-.1005-.1685-.1673-.2858-.1005-.4706.2347-.9068.5855-1.3274.9195-.5536.4345-1.1085.8695-1.6296 1.354a5.0577 5.0577 0 0 0-.5879.6185c-.0842.1168-.0168.2172.0843.2672-.3701.3677-.7402.736-1.109 1.1198a.1896.1896 0 0 0-.0506.1342c0 .05.0337.1.0668.1168l.6559.5012v.0169c.9237.9194 2.5538 2.1729 4.2844 3.5268.2515.201.5205.4014.7727.6017.1173.1342.2346.2847.3357.4182.0506.0662.1685.0837.2353.0331.0337.0337.0843.0668.118.1005a.2395.2395 0 0 0 .1004.0337.1534.1534 0 0 0 .1348-.0668.2371.2371 0 0 0 .0331-.1004c.0175 0 .0169.0168.0337.0168a.1915.1915 0 0 0 .1348-.0505l3.058-3.3265c.1198-.1159.0135-.2668-.0005-.2672zm-7.6277-.1336-1.5459-1.1704-.151-.0998c-.0337-.0169-.0674-.0506-.1011-.0668l-.1174-.1005c.6597-.659 1.3297-1.3074 1.9996-1.9557-.4874.4844-1.4622 1.9057-1.2606 2.3733.0023 0 .0186.0419.0674.0842.3704.311.7398.6232 1.109.9357zm4.0997 3.1261-1.277-.97a26.9056 26.9056 0 0 0-1.5795-1.5044c.689.5181 1.2769.9694 1.3611 1.053.6722.585.6379.485 1.0922.8696l.5542.4008c-.0735.103-.151.1477-.151.151zm.3357.2503-.0337-.0168c.0506-.0331.1011-.0668.1517-.1168zM.5885 3.4751c.0331.2172.0843.4344.1174.6354.2015 1.103.4031 2.1061.7726 2.8583l.1516.568c.0506.2173.1342.485.2185.5519.8568.7521 2.1674 1.8714 3.5785 2.9419a.1775.1775 0 0 0 .2185 0s0 .0162.0168.0162a.1528.1528 0 0 0 .118.0506.1912.1912 0 0 0 .1341-.0506c1.798-1.9887 3.1418-3.6267 4.0997-4.9974.0674-.0668.0843-.1673.0843-.251.0668-.0668.1173-.1504.1847-.2004.0668-.0668.0668-.184 0-.2346l-.0168-.0163c0-.033-.0169-.0836-.0506-.1005-.42-.4007-.722-.6848-1.0416-.9856A93.5546 93.5546 0 0 1 6.822 1.9876c-.0169-.0169-.0337-.0337-.0674-.0337-.3358-.1168-1.0248-.2341-1.8817-.3845C3.596 1.3527 1.865 1.0519.3027.583c0 0-.1011 0-.118.0169L.1348.6505C.0498.7139.0222.7058 0 .7167.017.8172.017.884.0506 1.0013c0 .0331.0673.3009.0673.334zm7.1909 4.7802-.0337.0337a.0362.0362 0 0 1 .0337-.0337zM6.553 2.238c.101.1005.5211.5019.6216.5855-.4369-.201-1.5284-.7022-2.0333-.8695.5043.1005 1.1933.201 1.4117.284ZM.7901 1.4027c.2521.4344.4537 1.9388.6553 3.4095-.118-.4682-.2016-.9357-.3027-1.3708C.9917 2.673.84 1.9876.6385 1.3858c.1232 0 .1516.0212.1516.0169zm-.2858-.3683c0-.0162 0-.033-.0169-.033.0843 0 .1342.0168.2016.0499.0006.0057-.1448-.0169-.1847-.0169zM23.6738.8172c.0169-.0662-.3358-.367-.2184-.3845.2527-.0163.2527-.4008 0-.4008-.3358.0169-.6884.0999-1.008.1504-.5878.1168-1.1926.2341-1.781.3671-1.327.2846-2.6375.5855-3.9481.937-.4032.1167-.857.2003-1.2432.4007-.1348.0668-.118.2004-.0506.284-.0337.0169-.0505.0169-.0842.0337-.1174.0169-.2185.0337-.3358.05-.1011.0168-.1516.1004-.1348.201 0 .0162.0169.0499.0169.0661-.7059.9363-1.4954 1.9226-2.3523 2.9757-.84.9694-1.7306 1.9893-2.6212 3.0424-2.8396 3.3096-6.0487 7.0705-9.5936 10.38a.1613.1613 0 0 0 0 .2341c.0169.0163.0337.0331.0506.0331-.0506.0506-.1011.0843-.1517.1336-.0337.0337-.0505.0668-.0505.1005a.364.364 0 0 0-.0668.0837c-.0674.0667-.0674.1835.0169.234.0667.0662.1847.0662.2346-.0168.0175-.0169.0175-.0337.0337-.0337a.2648.2648 0 0 1 .3701 0c.2016.2178.4032.435.588.6186l-.4201-.3508c-.0674-.0668-.1847-.05-.2347.0168-.068.0662-.0511.1835.0163.234l4.4691 3.7273c.0337.0337.0674.0337.118.0337.0505 0 .0842-.0169.1173-.0506l.101-.0999c.017.0163.05.0163.0669.0163.0505 0 .0842-.0163.118-.05 6.0486-6.0505 10.9216-10.6141 16.4997-14.6927.05-.0331.0668-.1.0668-.1505.0674 0 .118-.05.151-.1167 1.0254-3.1255 1.227-5.9007 1.2938-7.2709 0-.0579.0169-.0371.0169-.0668.0168-.0337.0168-.0505.0168-.0505a.9784.9784 0 0 0-.0668-.6186zm-10.82 4.9144c.2684-.3008.5374-.6186.8064-.9026-1.7306 2.2734-4.6033 5.7665-8.67 9.9288C7.7626 11.699 10.5517 8.54 12.854 5.7316ZM5.1414 23.4662c-.0162-.0168-.0162-.0168 0-.0168zm2.5033-2.156c.1348-.1505.2695-.284.4206-.4345 0 0 0 .0163.0168.0163-.2236.1978-.4334.4182-.4374.4182zm.6896-.6686c.0994-.0993.14-.1724.2852-.3177.9917-1.0193 2.0164-2.0393 3.058-3.0755l.0169-.0168c.2521-.2004.5542-.4177.8232-.6186a228.0627 228.0627 0 0 0-4.1833 4.0286zm6.5187-16.732c-.5543.719-1.1759 1.6716-1.697 2.4238-1.6463 2.3733-6.9393 8.1735-7.0566 8.274A1189.6473 1189.6473 0 0 1 1.26 19.204l-.1005.1005c-.0843-.1005-.0843-.251.0168-.3346 7.476-7.0037 12.0132-12.837 13.845-15.3944-.0506.1167-.0843.2166-.1685.334zm2.9064 3.4269c-.6716-.3851-.9905-.9869-.8064-1.5712l.0506-.201a.7753.7753 0 0 1 .0842-.1666c.1848-.301.4538-.5518.7564-.7023.0163 0 .0331 0 .05-.0168-.0169-.0337-.0169-.0837-.0169-.1336.0169-.1005.0843-.1673.2016-.1673.2016 0 .8238.1841 1.059.3845.0669.05.1343.1168.2017.1836.0842.1004.2184.2677.2852.4013.0337.0169.0674.1841.118.2678.0336.1336.0667.284.0505.4176-.0169.0169 0 .1167-.0169.1167a1.6055 1.6055 0 0 1-.2184.6186c-.0307.0307.0064.0119-.0505.0668-.0843.1342-.2016.251-.319.3346-.3869.2672-.8238.3508-1.2606.234-.1105-.0473-.1672-.0667-.1685-.0667zm4.3692 1.4039c0 .0168-.0168.0499 0 .0667-.0337 0-.0505.0169-.0842.0337-1.3274.9689-2.6212 1.9888-3.915 3.0256 1.109-.9868 2.218-1.9894 3.3776-2.9756.3358-.3009.5711-.6854.6379-1.1199l.1685-1.003v-.0332c.0842-.201.4032-.1173.3526.1-.0042-.0012-.1731.795-.5374 1.9057z" />
  </svg>
);

function TitleCell({
  id,
  initialTitle,
  onSave,
}: {
  id: string;
  initialTitle?: string;
  onSave: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialTitle ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setValue(initialTitle ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function commit() {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed === (initialTitle ?? "")) return;
    onSave(id, trimmed);
    await fetch(`/api/checkpoint/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="text-[15px] font-medium text-gray-800 bg-white border border-[#6965db]/40 rounded px-1 py-0 w-full outline-none focus:border-[#6965db]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="Untitled diagram"
      />
    );
  }

  return (
    <button
      onClick={startEdit}
      title="Click to rename"
      className="flex items-center gap-1 text-left max-w-full cursor-pointer"
    >
      {initialTitle ? (
        <span className="text-[15px] font-medium text-gray-800 truncate">
          {initialTitle}
        </span>
      ) : (
        <span className="text-[15px] text-gray-400 italic">
          Untitled diagram
        </span>
      )}
      <svg
        className="shrink-0 text-gray-400"
        width="13"
        height="13"
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
  );
}

export default function WorkspacesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<CheckpointEntry[] | null>(null);

  useEffect(() => {
    fetch("/api/checkpoints")
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]));
  }, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEntries((prev) => prev?.filter((entry) => entry.id !== id) ?? prev);
    fetch(`/api/checkpoint/${id}`, { method: "DELETE" }).catch(() => {});
  }

  function handleTitleSave(id: string, title: string) {
    setEntries(
      (prev) =>
        prev?.map((entry) =>
          entry.id === id ? { ...entry, title: title || undefined } : entry,
        ) ?? prev,
    );
    // mtime intentionally NOT updated — renaming doesn't change diagram age
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 select-none cursor-pointer"
        >
          <ExcalidrawLogo />
          <span className="font-semibold text-gray-900 text-base tracking-tight">
            Excalidraw <span className="text-gray-400 font-light mx-1">×</span>{" "}
            CopilotKit
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer"
          >
            ← Chat
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-gray-400 font-medium bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-full">
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
          </span>
        </div>
      </nav>
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-gray-900">
            Saved Diagrams
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-xs text-[#6965db] hover:text-[#5b57d1] font-medium transition-colors cursor-pointer"
          >
            + New diagram
          </button>
        </div>
        {entries === null && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
            Loading…
          </div>
        )}
        {entries !== null && entries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <svg
              className="mx-auto mb-3 opacity-40"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6M9 13h4" strokeLinecap="round" />
            </svg>
            <p className="text-sm">No diagrams yet.</p>
            <p className="text-xs mt-1">
              Go to Chat and ask me to draw something.
            </p>
          </div>
        )}
        {entries !== null && entries.length > 0 && (
          <div className="grid gap-2">
            {entries.map(({ id, mtime, title }) => (
              <div
                key={id}
                className="relative flex items-center gap-4 px-5 py-4 rounded-lg border border-gray-100 hover:border-[#6965db]/30 hover:bg-[#6965db]/[0.03] transition-colors"
              >
                <Link
                  href={`/workspace/${id}`}
                  className="absolute inset-0 rounded-lg"
                  aria-label={`Open ${title ?? id}`}
                />
                <div className="relative z-10 w-10 h-10 rounded-md bg-[#6965db]/10 flex items-center justify-center shrink-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6965db"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M8 12l3 3 5-5" />
                  </svg>
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <TitleCell
                    id={id}
                    initialTitle={title}
                    onSave={handleTitleSave}
                  />
                  <p className="text-xs font-mono text-gray-400 truncate mt-0.5">
                    {id}
                  </p>
                </div>
                <div className="relative z-10 flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm text-gray-400">
                    {formatDate(mtime)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(id, e)}
                    title="Delete diagram"
                    className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
