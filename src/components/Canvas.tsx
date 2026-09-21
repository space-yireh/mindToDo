"use client";

import type { LeafNode, MindMap, Selection, TaskNode } from "@/lib/types";

interface CanvasProps {
  mindMap: MindMap;
  selection: Selection;
  showCompleted: boolean;
  onSelectRoot: () => void;
  onSelectTaskNode: (nodeId: string) => void;
  onSelectLeafNode: (nodeId: string, parentId: string) => void;
  onAddTaskNode: () => void;
  onAddLeafNode: (parentId: string) => void;
  onDeleteTaskNode: (nodeId: string) => void;
  onDeleteLeafNode: (parentId: string, nodeId: string) => void;
}

function nodeStyle(isSelected: boolean, isCompleted: boolean): string {
  return [
    "flex-1 truncate rounded-md border px-3 py-1.5 text-left text-sm",
    isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-400",
    isCompleted && !isSelected ? "text-slate-400 line-through" : "",
    isCompleted && isSelected ? "line-through" : "",
  ].join(" ");
}

export function Canvas({
  mindMap,
  selection,
  showCompleted,
  onSelectRoot,
  onSelectTaskNode,
  onSelectLeafNode,
  onAddTaskNode,
  onAddLeafNode,
  onDeleteTaskNode,
  onDeleteLeafNode,
}: CanvasProps) {
  const visibleNodes = mindMap.nodes.filter((n) => showCompleted || n.status !== "completed");

  return (
    <div className="flex-1 overflow-auto p-6">
      <button
        type="button"
        onClick={onSelectRoot}
        className={`rounded-md border px-4 py-2 text-left text-base font-semibold ${
          selection?.depth === 0
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
        }`}
      >
        {mindMap.title || "(제목 없음)"}
      </button>

      <ul className="mt-3 ml-4 flex flex-col gap-2 border-l border-slate-300 pl-4">
        {visibleNodes.map((node) => (
          <TaskNodeItem
            key={node.id}
            node={node}
            selection={selection}
            showCompleted={showCompleted}
            onSelectTaskNode={onSelectTaskNode}
            onSelectLeafNode={onSelectLeafNode}
            onAddLeafNode={onAddLeafNode}
            onDeleteTaskNode={onDeleteTaskNode}
            onDeleteLeafNode={onDeleteLeafNode}
          />
        ))}
        <li>
          <button
            type="button"
            onClick={onAddTaskNode}
            className="rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            + 할일 추가
          </button>
        </li>
      </ul>
    </div>
  );
}

interface TaskNodeItemProps {
  node: TaskNode;
  selection: Selection;
  showCompleted: boolean;
  onSelectTaskNode: (nodeId: string) => void;
  onSelectLeafNode: (nodeId: string, parentId: string) => void;
  onAddLeafNode: (parentId: string) => void;
  onDeleteTaskNode: (nodeId: string) => void;
  onDeleteLeafNode: (parentId: string, nodeId: string) => void;
}

function TaskNodeItem({
  node,
  selection,
  showCompleted,
  onSelectTaskNode,
  onSelectLeafNode,
  onAddLeafNode,
  onDeleteTaskNode,
  onDeleteLeafNode,
}: TaskNodeItemProps) {
  const isSelected = selection?.depth === 1 && selection.nodeId === node.id;
  const isCompleted = node.status === "completed";
  const visibleChildren = node.children.filter((c) => showCompleted || c.status !== "completed");

  return (
    <li>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onSelectTaskNode(node.id)} className={nodeStyle(isSelected, isCompleted)}>
          {node.title || "(제목 없음)"}
        </button>
        <button
          type="button"
          onClick={() => onAddLeafNode(node.id)}
          className="shrink-0 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
          aria-label="세부 할일 추가"
          title="세부 할일 추가"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => onDeleteTaskNode(node.id)}
          className="shrink-0 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="할일 삭제"
          title="할일 삭제"
        >
          ×
        </button>
      </div>

      {visibleChildren.length > 0 && (
        <ul className="mt-2 ml-4 flex flex-col gap-2 border-l border-slate-200 pl-4">
          {visibleChildren.map((leaf) => (
            <LeafNodeItem
              key={leaf.id}
              leaf={leaf}
              parentId={node.id}
              selection={selection}
              onSelectLeafNode={onSelectLeafNode}
              onDeleteLeafNode={onDeleteLeafNode}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface LeafNodeItemProps {
  leaf: LeafNode;
  parentId: string;
  selection: Selection;
  onSelectLeafNode: (nodeId: string, parentId: string) => void;
  onDeleteLeafNode: (parentId: string, nodeId: string) => void;
}

function LeafNodeItem({ leaf, parentId, selection, onSelectLeafNode, onDeleteLeafNode }: LeafNodeItemProps) {
  const isSelected = selection?.depth === 2 && selection.nodeId === leaf.id;
  const isCompleted = leaf.status === "completed";

  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onSelectLeafNode(leaf.id, parentId)}
        className={nodeStyle(isSelected, isCompleted)}
      >
        {leaf.title || "(제목 없음)"}
      </button>
      <button
        type="button"
        onClick={() => onDeleteLeafNode(parentId, leaf.id)}
        className="shrink-0 rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
        aria-label="세부 할일 삭제"
        title="세부 할일 삭제"
      >
        ×
      </button>
    </li>
  );
}
