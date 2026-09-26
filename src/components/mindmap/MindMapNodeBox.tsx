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

function NotesIcon() {
  return (
    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.8}>
      <rect x="4" y="3" width="12" height="14" rx="1.5" />
      <path strokeLinecap="round" d="M7 7.5h6M7 10.5h6M7 13.5h3.5" />
    </svg>
  );
}

const SELECTED_RING = "ring-2 ring-offset-2 ring-offset-slate-50 ring-amber-400 dark:ring-offset-slate-900";
// subtle outline on every eligible drop target as soon as a leaf drag
// starts (so users can see where they *can* drop before hovering there),
// upgraded to a stronger ring on whichever one is actually under the pointer
const DROP_TARGET_RING = "ring-2 ring-offset-2 ring-offset-slate-50 ring-emerald-300/60 dark:ring-offset-slate-900";
const DROP_TARGET_HOVER_RING =
  "ring-2 ring-offset-2 ring-offset-slate-50 ring-emerald-500 dark:ring-offset-slate-900";

function NodeBoxBase({ id, data, selected }: NodeProps<MindMapNode>) {
  const { t } = useLanguage();
  const {
    kind,
    title,
    status,
    notesPreview,
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
    draggable,
    isDragging,
    isDropTarget,
    isDropHighlighted,
    onDragStart,
    onDragOverNode,
    onDragLeaveNode,
    onDropNode,
    onDragEndNode,
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
            // text-base (16px) overrides the smaller inherited KIND_STYLES
            // size while editing — task/leaf boxes render at 14px/12px,
            // both under the 16px iOS/Android auto-zoom-on-focus threshold
            className="w-full bg-transparent text-center text-base outline-none"
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
          draggable={draggable}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.effectAllowed = "move";
            onDragStart?.();
          }}
          onDragOver={
            isDropTarget
              ? (e) => {
                  // dragover must be prevented for the browser to treat this
                  // element as a valid drop target at all
                  e.preventDefault();
                  e.stopPropagation();
                  onDragOverNode?.();
                }
              : undefined
          }
          onDragLeave={isDropTarget ? () => onDragLeaveNode?.() : undefined}
          onDrop={
            isDropTarget
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDropNode?.();
                }
              : undefined
          }
          onDragEnd={draggable ? () => onDragEndNode?.() : undefined}
          className={[
            "flex h-full w-full items-center justify-center rounded-xl border px-3 text-center leading-snug shadow-md transition",
            KIND_STYLES[kind],
            selected ? SELECTED_RING : "",
            isDropTarget ? (isDropHighlighted ? DROP_TARGET_HOVER_RING : DROP_TARGET_RING) : "",
            isCompleted ? "opacity-50" : "",
            isDragging ? "opacity-40" : "",
            // React Flow's own pan gesture starts on mousedown anywhere in
            // the pane, including inside node content — competing with the
            // browser's native drag-and-drop gesture recognition on this
            // same element and winning, so a real mouse drag panned the
            // canvas instead of picking up the leaf. `nopan` (React Flow's
            // own escape hatch for exactly this) tells its pan handler to
            // ignore mousedown events starting here, leaving native drag
            // initiation uncontested. Only matters for draggable (leaf)
            // nodes; harmless either way since it doesn't affect clicks.
            draggable ? "nopan" : "",
          ].join(" ")}
        >
          <span className={isCompleted ? "line-through" : ""}>{title || t.untitled}</span>
        </button>
      )}

      {(showAddButton || showDeleteButton) && (
        <div
          className={[
            // hidden on mobile — PropertiesPanel's own mobile-only
            // add/delete buttons are the intended touch path (see its
            // PanelActions comment); once a node is centered into the
            // visible strip above the bottom sheet, these floating
            // buttons would otherwise show up redundantly alongside
            // the sheet's own buttons for the same actions
            "absolute hidden gap-1.5 transition-opacity md:flex",
            // hover reveals them for mouse users; `selected` reveals them
            // unconditionally too (kept for keyboard/focus-only selection
            // on desktop, where there's no hover yet)
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

      {notesPreview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          title={notesPreview}
          aria-label={t.hasNotesAria}
          className={[
            "absolute flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white shadow hover:bg-slate-500 dark:bg-slate-500 dark:hover:bg-slate-400",
            direction === "LR" ? "-bottom-1.5 left-1" : "-left-1.5 bottom-1",
          ].join(" ")}
        >
          <NotesIcon />
        </button>
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
