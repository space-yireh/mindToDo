"use client";

import { useMemo, useState } from "react";
import { Background, BackgroundVariant, ReactFlow, ReactFlowProvider } from "@xyflow/react";
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

function MindMapCanvasInner(props: MindMapCanvasProps) {
  const { mindMap, selection, showCompleted } = props;
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingSeed, setEditingSeed] = useState<string | null>(null);

  function startEdit(nodeId: string, seed: string | null = null) {
    setEditingSeed(seed);
    setEditingNodeId(nodeId);
  }

  function stopEdit() {
    setEditingNodeId(null);
    setEditingSeed(null);
  }

  // adding a node always drops straight into editing it (select-all on the
  // default title) so keyboard flow never breaks stride: Tab/Enter/+ all
  // land you ready to type the new node's name immediately
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
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
        // Escape doubles as "enter edit mode" (F2's often-awkward-to-reach
        // alternative). It also sidesteps the IME first-jamo-loss issue
        // with typing directly: Escape isn't a composable character, so
        // the button->input focus handoff never races an IME composition.
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
        // typing directly on a selected node jumps straight into editing it,
        // replacing the old title with what was just typed — mirrors how a
        // plain click + typing works in most mind-map tools. Falls through
        // for IME composition starts too (Korean etc. report a non-empty,
        // non-modifier key here even before the syllable is fully composed).
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
    <div className="flex-1 bg-slate-50 outline-none" tabIndex={0} onKeyDown={handleKeyDown}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={mindMapNodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        deleteKeyCode={null}
        zoomOnDoubleClick={false}
        panOnScroll
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#CBD5E1" />
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
