"use client";

import type { LeafNode, Selection } from "@/lib/types";

interface PropertiesPanelProps {
  selection: Selection;
  rootTitle: string;
  onRootTitleChange: (title: string) => void;
  selectedNode: LeafNode | null;
  onTitleChange: (title: string) => void;
  onNotesChange: (notes: string) => void;
  onDueChange: (due: string | null) => void;
  onStatusChange: (completed: boolean) => void;
  open: boolean;
  onClose: () => void;
}

function panelClassName(open: boolean): string {
  return [
    "border-l border-slate-200 bg-white transition-all duration-200 ease-in-out",
    "fixed inset-y-0 right-0 z-40 overflow-hidden md:static md:inset-auto",
    open
      ? "w-80 translate-x-0"
      : "w-80 translate-x-full md:w-0 md:translate-x-0 md:border-l-0",
  ].join(" ");
}

// fixed-width inner wrapper: the outer <aside> collapses to 0 and clips via
// overflow-hidden, but padding lives here so it never keeps the outer box
// from truly reaching 0 width (padding on the outer box can't shrink below
// itself even at width:0)
const PANEL_INNER = "w-80 p-4";

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
      aria-label="속성 패널 닫기"
    >
      ✕
    </button>
  );
}

export function PropertiesPanel({
  selection,
  rootTitle,
  onRootTitleChange,
  selectedNode,
  onTitleChange,
  onNotesChange,
  onDueChange,
  onStatusChange,
  open,
  onClose,
}: PropertiesPanelProps) {
  if (!selection) {
    return (
      <aside className={panelClassName(open)}>
        <div className={PANEL_INNER}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">노드를 선택하세요.</span>
            <CloseButton onClose={onClose} />
          </div>
        </div>
      </aside>
    );
  }

  if (selection.depth === 0) {
    return (
      <aside className={panelClassName(open)}>
        <div className={PANEL_INNER}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">목록 (depth 0)</h2>
            <CloseButton onClose={onClose} />
          </div>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            제목
            <input
              type="text"
              value={rootTitle}
              onChange={(e) => onRootTitleChange(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
        </div>
      </aside>
    );
  }

  if (!selectedNode) return null;

  return (
    <aside className={panelClassName(open)}>
      <div className={PANEL_INNER}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">
            {selection.depth === 1 ? "할일 (depth 1)" : "세부 할일 (depth 2)"}
          </h2>
          <CloseButton onClose={onClose} />
        </div>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            제목
            <input
              type="text"
              value={selectedNode.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            설명
            <textarea
              value={selectedNode.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            마감일
            <input
              type="date"
              value={selectedNode.due ?? ""}
              onChange={(e) => onDueChange(e.target.value || null)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={selectedNode.status === "completed"}
              onChange={(e) => onStatusChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
            />
            완료됨
          </label>
        </div>
      </div>
    </aside>
  );
}
