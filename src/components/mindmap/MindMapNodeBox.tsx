"use client";

import { useEffect, useRef } from "react";
import { Handle, type NodeProps } from "@xyflow/react";
import { useLanguage } from "@/components/LanguageProvider";
import type { MindMapNode, MindMapNodeKind } from "@/lib/mindmapLayout";
import { NODE_SIZE } from "@/lib/mindmapLayout";

const KIND_STYLES: Record<MindMapNodeKind, string> = {
  root: "bg-indigo-600 text-white text-base font-semibold border-indigo-600 shadow-indigo-200 dark:shadow-none",
  task: "bg-white text-slate-700 text-sm font-medium border-slate-200 shadow-slate-200/60 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:shadow-none",
  leaf: "bg-slate-50 text-slate-500 text-xs border-slate-200 !shadow-none dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60",
};

const SELECTED_RING = "ring-2 ring-offset-2 ring-offset-slate-50 ring-amber-400 dark:ring-offset-slate-900";

function NodeBoxBase({ id, data, selected }: NodeProps<MindMapNode>) {
  const { t } = useLanguage();
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
    const raf = requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      if (editingSeed) {
        el.value = editingSeed;
        el.setSelectionRange(el.value.length, el.value.length);
      } else {
        el.select();
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [editing, editingSeed]);

  useEffect(() => {
    if (selected && !editing) {
      buttonRef.current?.focus();
    }
  }, [selected, editing]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
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
      {kind !== "root" && <Handle type="target" position={targetPosition} className="!bg-slate-300 dark:!bg-slate-600" />}
      {kind !== "leaf" && <Handle type="source" position={sourcePosition} className="!bg-slate-300 dark:!bg-slate-600" />}

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
          <span className={isCompleted ? "line-through" : ""}>{title || t.untitled}</span>
        </button>
      )}

      {(showAddButton || showDeleteButton) && (
        <div
          className={[
            "absolute flex gap-1.5 transition-opacity",
            // hover reveals them for mouse users; `selected` reveals them
            // unconditionally so touch users (no :hover) can still reach
            // add/delete after tapping a node — this was the actual reason
            // "add node" silently did nothing on mobile
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            direction === "LR" ? "-top-3.5 right-1" : "-right-3.5 top-1",
          ].join(" ")}
        >
          {showAddButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.();
              }}
              aria-label={t.addChildNodeAria}
              title={t.addChildNodeAria}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow hover:bg-emerald-400 active:bg-emerald-600"
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
              aria-label={t.deleteNodeAria}
              title={t.deleteNodeAria}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow hover:bg-red-400 active:bg-red-600"
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
