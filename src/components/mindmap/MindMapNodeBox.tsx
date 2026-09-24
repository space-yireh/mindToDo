"use client";

import { useEffect, useRef } from "react";
import { Handle, type NodeProps } from "@xyflow/react";
import type { MindMapNode, MindMapNodeKind } from "@/lib/mindmapLayout";
import { NODE_SIZE } from "@/lib/mindmapLayout";

const KIND_STYLES: Record<MindMapNodeKind, string> = {
  root: "bg-indigo-700 text-white text-base font-semibold border-indigo-400",
  task: "bg-slate-600 text-white text-sm font-medium border-slate-400",
  leaf: "bg-slate-700/60 text-slate-100 text-xs border-slate-500",
};

const SELECTED_RING = "ring-2 ring-offset-2 ring-offset-slate-900 ring-amber-400";

function NodeBoxBase({ id, data, selected }: NodeProps<MindMapNode>) {
  const {
    kind,
    title,
    status,
    direction,
    sourcePosition,
    targetPosition,
    editing,
    editingSeed,
    onSelect,
    onAddChild,
    onDelete,
    onStartEdit,
    onCommitEdit,
    onCancelEdit,
  } = data;
  const size = NODE_SIZE[kind];
  const isCompleted = status === "completed";
  const showAddButton = Boolean(onAddChild) && !editing;
  const showDeleteButton = Boolean(onDelete) && !editing;

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!editing) return;
    resolvedRef.current = false;
    // nodes declare explicit width/height so React Flow skips its
    // ResizeObserver auto-measure pass; without that, this focus call
    // could race the measure-driven reflow and silently fail
    const raf = requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      if (editingSeed) {
        // started by typing directly on a selected node: replace with what
        // was typed instead of the old title, cursor after it
        el.value = editingSeed;
        el.setSelectionRange(el.value.length, el.value.length);
      } else {
        el.select();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [editing, editingSeed]);

  useEffect(() => {
    // Safari/WebKit don't always give a <button> real DOM focus on a plain
    // mouse click, which silently breaks every keyboard shortcut afterwards
    // (they all rely on the focused node's ancestor receiving keydown). Make
    // focus follow "selected" explicitly instead of relying on native click
    // focus, so this stays reliable across browsers and after keyboard nav.
    if (selected && !editing) {
      buttonRef.current?.focus();
    }
  }, [selected, editing]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    // Korean (and other IME) composition: the Enter that finalizes the
    // current syllable arrives as its own keydown with isComposing=true,
    // immediately followed by a second, real Enter keydown. Only the
    // second one should commit — otherwise the first one closes editing
    // and the second leaks through to the canvas as "add sibling".
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      resolvedRef.current = true;
      onCommitEdit(e.currentTarget.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      resolvedRef.current = true;
      onCancelEdit();
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    onCommitEdit(e.currentTarget.value);
  }

  return (
    <div
      style={{ width: size.width, height: size.height }}
      className="group relative flex items-center justify-center"
    >
      {kind !== "root" && <Handle type="target" position={targetPosition} className="!bg-slate-400" />}
      {kind !== "leaf" && <Handle type="source" position={sourcePosition} className="!bg-slate-400" />}

      {editing ? (
        <div
          className={[
            "flex h-full w-full items-center justify-center rounded-xl border px-2 shadow-md",
            KIND_STYLES[kind],
            SELECTED_RING,
          ].join(" ")}
        >
          <input
            ref={inputRef}
            defaultValue={title}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-center outline-none"
          />
        </div>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={onSelect}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
          className={[
            "flex h-full w-full items-center justify-center rounded-xl border px-3 text-center leading-snug shadow-md transition",
            KIND_STYLES[kind],
            selected ? SELECTED_RING : "",
            isCompleted ? "opacity-50" : "",
          ].join(" ")}
        >
          <span className={isCompleted ? "line-through" : ""}>{title || "(제목 없음)"}</span>
        </button>
      )}

      {(showAddButton || showDeleteButton) && (
        <div
          className={[
            "absolute flex gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            direction === "LR" ? "-top-3 right-1" : "-right-3 top-1",
          ].join(" ")}
        >
          {showAddButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.();
              }}
              aria-label="자식 노드 추가"
              title="자식 노드 추가"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow hover:bg-emerald-400"
            >
              +
            </button>
          )}
          {showDeleteButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              aria-label="노드 삭제"
              title="노드 삭제"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow hover:bg-red-400"
            >
              ×
            </button>
          )}
        </div>
      )}
      <span data-node-id={id} className="sr-only">
        {id}
      </span>
    </div>
  );
}

export function RootNode(props: NodeProps<MindMapNode>) {
  return <NodeBoxBase {...props} />;
}

export function TaskNode(props: NodeProps<MindMapNode>) {
  return <NodeBoxBase {...props} />;
}

export function LeafNode(props: NodeProps<MindMapNode>) {
  return <NodeBoxBase {...props} />;
}

export const mindMapNodeTypes = {
  root: RootNode,
  task: TaskNode,
  leaf: LeafNode,
};
