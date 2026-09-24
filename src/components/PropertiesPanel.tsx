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

/**
 * Desktop  : right-side panel (static, collapsible to w-0)
 * Mobile   : bottom sheet (fixed, slides up from bottom, ~55% height)
 */
function panelClassName(open: boolean): string {
  return [
    "bg-white transition-all duration-300 ease-in-out dark:bg-slate-900",
    // ---- desktop ----
    "md:static md:inset-auto md:border-l md:border-slate-200 md:dark:border-slate-800",
    open ? "md:w-80" : "md:w-0 md:overflow-hidden md:border-l-0",
    // ---- mobile: bottom sheet ----
    "fixed bottom-0 left-0 right-0 z-40 md:relative",
    "rounded-t-2xl border-t border-slate-200 dark:border-slate-700 shadow-2xl",
    open ? "translate-y-0" : "translate-y-full md:translate-y-0",
    // max height on mobile so it never covers entire screen
    "max-h-[60vh] md:max-h-none overflow-y-auto",
  ].join(" ");
}

// Fixed inner width only on desktop
const PANEL_INNER = "md:w-80 p-4";

function DragHandle() {
  return (
    <div className="flex justify-center pt-2 pb-1 md:hidden">
      <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
    </div>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
        aria-label="속성 패널 닫기"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

const inputClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 w-full";

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
        <DragHandle />
        <div className={PANEL_INNER}>
          <PanelHeader title="속성" onClose={onClose} />
          <p className="text-sm text-slate-400 dark:text-slate-500">노드를 선택하세요.</p>
        </div>
      </aside>
    );
  }

  if (selection.depth === 0) {
    return (
      <aside className={panelClassName(open)}>
        <DragHandle />
        <div className={PANEL_INNER}>
          <PanelHeader title="목록" onClose={onClose} />
          <label className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            제목
            <input
              type="text"
              value={rootTitle}
              onChange={(e) => onRootTitleChange(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </aside>
    );
  }

  if (!selectedNode) return null;

  return (
    <aside className={panelClassName(open)}>
      <DragHandle />
      <div className={PANEL_INNER}>
        <PanelHeader
          title={selection.depth === 1 ? "할일" : "세부 할일"}
          onClose={onClose}
        />
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            제목
            <input
              type="text"
              value={selectedNode.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            설명
            <textarea
              value={selectedNode.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            마감일
            <input
              type="date"
              value={selectedNode.due ?? ""}
              onChange={(e) => onDueChange(e.target.value || null)}
              className={inputClass}
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedNode.status === "completed"}
              onChange={(e) => onStatusChange(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 dark:border-slate-700 dark:bg-slate-950 accent-indigo-600"
            />
            완료됨
          </label>
        </div>
      </div>
    </aside>
  );
}
