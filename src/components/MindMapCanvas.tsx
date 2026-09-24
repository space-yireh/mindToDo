"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Background,
  BackgroundVariant,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { mindMapNodeTypes } from "@/components/mindmap/MindMapNodeBox";
import {
  MINDMAP_ROOT_ID,
  computeMindMapLayout,
  getNavigationTarget,
  type NavigationDirection,
} from "@/lib/mindmapLayout";
import type { MindMap, Selection } from "@/lib/types";

interface MindMapCanvasProps {
  mindMap: MindMap;
  selection: Selection;
  showCompleted: boolean;
  onSelectRoot: () => void;
  onSelectTaskNode: (nodeId: string) => void;
  onSelectLeafNode: (nodeId: string, parentId: string) => void;
  /** returns the id of the newly created node */
  onAddTaskNode: () => string;
  /** returns the id of the newly created node */
  onAddLeafNode: (parentId: string) => string;
  onDeleteTaskNode: (nodeId: string) => void;
  onDeleteLeafNode: (parentId: string, nodeId: string) => void;
  onRootTitleChange: (title: string) => void;
  onTitleChange: (title: string) => void;
}

const ARROW_DIRECTIONS: Record<string, NavigationDirection> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

// key values that should never fall through to "start typing to edit"
const IGNORED_TYPE_TO_EDIT_KEYS = new Set([
  "Tab",
  "Enter",
  "Delete",
  "Backspace",
  "F2",
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Insert",
  "ContextMenu",
]);

function ZoomControls() {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const percentage = Math.round(zoom * 100);

  return (
    <Panel
      position="bottom-right"
      className="m-3 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm select-none dark:border-slate-800 dark:bg-slate-900/90"
    >
      <button
        type="button"
        onClick={() => zoomOut({ duration: 200 })}
        className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        title="Zoom Out (Ctrl -)"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => zoomTo(1, { duration: 200 })}
        className="h-7 min-w-[48px] px-1.5 text-center text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 rounded transition-colors"
        title="Reset Zoom to 100%"
      >
        {percentage}%
      </button>

      <button
        type="button"
        onClick={() => zoomIn({ duration: 200 })}
        className="flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        title="Zoom In (Ctrl +)"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />

      <button
        type="button"
        onClick={() => fitView({ maxZoom: 1.0, duration: 300 })}
        className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        title="Fit View (Ctrl 0)"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
        Fit
      </button>
    </Panel>
  );
}

const emptySubscribe = () => () => {};
function useIsMobile() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

function MindMapCanvasInner(props: MindMapCanvasProps) {
  const { mindMap, selection, showCompleted } = props;
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingSeed, setEditingSeed] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

  function startEdit(nodeId: string, seed: string | null = null) {
    setEditingSeed(seed);
    setEditingNodeId(nodeId);
  }

  function stopEdit() {
    setEditingNodeId(null);
    setEditingSeed(null);
  }

  function handleAddTaskNode(): string {
    const newId = props.onAddTaskNode();
    startEdit(newId);
    return newId;
  }

  function handleAddLeafNode(parentId: string): string {
    const newId = props.onAddLeafNode(parentId);
    startEdit(newId);
    return newId;
  }

  const { nodes, edges } = useMemo(
    () =>
      computeMindMapLayout({
        mindMap,
        selection,
        showCompleted,
        direction: "LR",
        editingNodeId,
        editingSeed,
        onSelectRoot: props.onSelectRoot,
        onSelectTaskNode: props.onSelectTaskNode,
        onSelectLeafNode: props.onSelectLeafNode,
        onAddTaskNode: handleAddTaskNode,
        onAddLeafNode: handleAddLeafNode,
        onDeleteTaskNode: props.onDeleteTaskNode,
        onDeleteLeafNode: props.onDeleteLeafNode,
        onStartEdit: (nodeId) => startEdit(nodeId),
        onCommitEdit: (title) => {
          if (editingNodeId === MINDMAP_ROOT_ID) {
            props.onRootTitleChange(title);
          } else {
            props.onTitleChange(title);
          }
          stopEdit();
        },
        onCancelEdit: stopEdit,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mindMap, selection, showCompleted, editingNodeId, editingSeed],
  );

  // Smoothly center on selected node when selection changes (desktop only)
  useEffect(() => {
    if (!selection || isMobile) return;
    const targetId = selection.depth === 0 ? MINDMAP_ROOT_ID : selection.nodeId;
    const targetNode = nodes.find((n) => n.id === targetId);
    if (targetNode && targetNode.width && targetNode.height) {
      const centerX = targetNode.position.x + targetNode.width / 2;
      const centerY = targetNode.position.y + targetNode.height / 2;
      setCenter(centerX, centerY, { duration: 300 });
    }
  }, [selection, nodes, setCenter, isMobile]);

  // Re-fit view when showCompleted changes so layout zoom is optimized for current node count
  useEffect(() => {
    const maxZoom = isMobile ? 0.7 : 1.0;
    const timer = setTimeout(() => {
      fitView({ maxZoom, duration: 300 });
    }, 50);
    return () => clearTimeout(timer);
  }, [showCompleted, fitView, isMobile]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Zoom keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        zoomIn({ duration: 200 });
        return;
      }
      if (e.key === "-") {
        e.preventDefault();
        zoomOut({ duration: 200 });
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        fitView({ maxZoom: isMobile ? 0.7 : 1.0, duration: 300 });
        return;
      }
    }

    // while a node is being edited inline, its own input owns the keyboard
    if (editingNodeId || !selection) return;

    switch (e.key) {
      case "Tab": {
        e.preventDefault();
        if (selection.depth === 0) handleAddTaskNode();
        else if (selection.depth === 1) handleAddLeafNode(selection.nodeId);
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (selection.depth === 1) handleAddTaskNode();
        else if (selection.depth === 2) handleAddLeafNode(selection.parentId);
        break;
      }
      case "Delete":
      case "Backspace": {
        e.preventDefault();
        if (selection.depth === 1) props.onDeleteTaskNode(selection.nodeId);
        else if (selection.depth === 2) props.onDeleteLeafNode(selection.parentId, selection.nodeId);
        break;
      }
      case "F2":
      case "Escape": {
        e.preventDefault();
        startEdit(selection.depth === 0 ? MINDMAP_ROOT_ID : selection.nodeId);
        break;
      }
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault();
        const target = getNavigationTarget(mindMap, selection, ARROW_DIRECTIONS[e.key], showCompleted);
        if (!target) break;
        if (target.depth === 0) props.onSelectRoot();
        else if (target.depth === 1) props.onSelectTaskNode(target.nodeId);
        else props.onSelectLeafNode(target.nodeId, target.parentId);
        break;
      }
      default: {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) break;
        if (IGNORED_TYPE_TO_EDIT_KEYS.has(e.key)) break;
        const isPrintable = e.key.length === 1;
        const isComposing = e.nativeEvent.isComposing || e.key === "Process" || e.key === "Unidentified";
        if (!isPrintable && !isComposing) break;
        e.preventDefault();
        const targetId = selection.depth === 0 ? MINDMAP_ROOT_ID : selection.nodeId;
        startEdit(targetId, isPrintable ? e.key : "");
        break;
      }
    }
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 outline-none relative" tabIndex={0} onKeyDown={handleKeyDown}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mindMapNodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        panOnScroll
        minZoom={0.15}
        maxZoom={2.0}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: isMobile ? 0.7 : 1.0, minZoom: 0.15 }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--bg-dots, #CBD5E1)" />
        <ZoomControls />
      </ReactFlow>
    </div>
  );
}

export function MindMapCanvas(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider key={props.mindMap.taskListId}>
      <MindMapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
