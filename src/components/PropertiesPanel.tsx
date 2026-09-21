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
}: PropertiesPanelProps) {
  if (!selection) {
    return (
      <aside className="w-80 shrink-0 border-l border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-400">노드를 선택하세요.</p>
      </aside>
    );
  }

  if (selection.depth === 0) {
    return (
      <aside className="w-80 shrink-0 border-l border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-500">목록 (depth 0)</h2>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          제목
          <input
            type="text"
            value={rootTitle}
            onChange={(e) => onRootTitleChange(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
      </aside>
    );
  }

  if (!selectedNode) return null;

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 bg-slate-50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-500">
        {selection.depth === 1 ? "할일 (depth 1)" : "세부 할일 (depth 2)"}
      </h2>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          제목
          <input
            type="text"
            value={selectedNode.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          설명
          <textarea
            value={selectedNode.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          마감일
          <input
            type="date"
            value={selectedNode.due ?? ""}
            onChange={(e) => onDueChange(e.target.value || null)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={selectedNode.status === "completed"}
            onChange={(e) => onStatusChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          완료됨
        </label>
      </div>
    </aside>
  );
}
