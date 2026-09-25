import { hierarchy, tree } from "d3-hierarchy";
import type { Edge, Node } from "@xyflow/react";
import { Position } from "@xyflow/react";
import type { MindMap, Selection, TaskStatus } from "./types";

export type LayoutDirection = "LR" | "TB";

export type MindMapNodeKind = "root" | "task" | "leaf";

export interface MindMapNodeData {
  kind: MindMapNodeKind;
  nodeId: string;
  parentId: string | null;
  title: string;
  status: TaskStatus | null;
  direction: LayoutDirection;
  sourcePosition: Position;
  targetPosition: Position;
  editing: boolean;
  editingSeed: string | null;
  onSelect: () => void;
  onAddChild?: () => void;
  onDelete?: () => void;
  onStartEdit: () => void;
  onCommitEdit: (title: string) => void;
  onCancelEdit: () => void;
  /** true only for depth-2 leaves — the only draggable kind (see reparenting) */
  draggable: boolean;
  /** true while this specific leaf is the one currently being dragged */
  isDragging: boolean;
  /** true while a leaf is being dragged and this node is a valid drop target for it */
  isDropTarget: boolean;
  /** true when this node is the drop target currently under the pointer */
  isDropHighlighted: boolean;
  onDragStart?: () => void;
  onDragOverNode?: () => void;
  onDragLeaveNode?: () => void;
  onDropNode?: () => void;
  onDragEndNode?: () => void;
  [key: string]: unknown;
}

export const MINDMAP_ROOT_ID = "__root__";

export type MindMapNode = Node<MindMapNodeData>;

interface HierarchyDatum {
  id: string;
  parentId: string | null;
  kind: MindMapNodeKind;
  title: string;
  status: TaskStatus | null;
  children: HierarchyDatum[];
}

export const NODE_SIZE: Record<MindMapNodeKind, { width: number; height: number }> = {
  root: { width: 220, height: 60 },
  task: { width: 190, height: 46 },
  leaf: { width: 160, height: 38 },
};

const SIBLING_GAP = 24;
const LEVEL_GAP = 90;

function isSelected(selection: Selection, kind: MindMapNodeKind, nodeId: string): boolean {
  if (!selection) return false;
  if (kind === "root") return selection.depth === 0;
  if (kind === "task") return selection.depth === 1 && selection.nodeId === nodeId;
  return selection.depth === 2 && selection.nodeId === nodeId;
}

interface ComputeLayoutOptions {
  mindMap: MindMap;
  selection: Selection;
  showCompleted: boolean;
  direction?: LayoutDirection;
  editingNodeId?: string | null;
  editingSeed?: string | null;
  onSelectRoot: () => void;
  onSelectTaskNode: (nodeId: string) => void;
  onSelectLeafNode: (nodeId: string, parentId: string) => void;
  onAddTaskNode: () => void;
  onAddLeafNode: (parentId: string) => void;
  onDeleteTaskNode: (nodeId: string) => void;
  onDeleteLeafNode: (parentId: string, nodeId: string) => void;
  onStartEdit: (nodeId: string) => void;
  onCommitEdit: (title: string) => void;
  onCancelEdit: () => void;
  /** id of the leaf currently being dragged, if any (drag-and-drop reparenting) */
  draggingLeafId?: string | null;
  /** that leaf's current parent task id — its own task is not a valid drop target */
  draggingLeafParentId?: string | null;
  /** id of the node currently under the pointer during a drag, for highlighting */
  dropTargetId?: string | null;
  onLeafDragStart?: (nodeId: string, parentId: string) => void;
  onNodeDragOver?: (nodeId: string) => void;
  onNodeDragLeave?: () => void;
  onNodeDrop?: (nodeId: string) => void;
  onDragEnd?: () => void;
}

export function computeMindMapLayout(options: ComputeLayoutOptions): {
  nodes: MindMapNode[];
  edges: Edge[];
} {
  const {
    mindMap,
    selection,
    showCompleted,
    direction = "LR",
    editingNodeId = null,
    editingSeed = null,
    onSelectRoot,
    onSelectTaskNode,
    onSelectLeafNode,
    onAddTaskNode,
    onAddLeafNode,
    onDeleteTaskNode,
    onDeleteLeafNode,
    onStartEdit,
    onCommitEdit,
    onCancelEdit,
    draggingLeafId = null,
    draggingLeafParentId = null,
    dropTargetId = null,
    onLeafDragStart,
    onNodeDragOver,
    onNodeDragLeave,
    onNodeDrop,
    onDragEnd,
  } = options;

  const visibleTaskNodes = mindMap.nodes.filter((n) => showCompleted || n.status !== "completed");

  const data: HierarchyDatum = {
    id: MINDMAP_ROOT_ID,
    parentId: null,
    kind: "root",
    title: mindMap.title,
    status: null,
    children: visibleTaskNodes.map((node) => ({
      id: node.id,
      parentId: MINDMAP_ROOT_ID,
      kind: "task",
      title: node.title,
      status: node.status,
      children: node.children
        .filter((leaf) => showCompleted || leaf.status !== "completed")
        .map((leaf) => ({
          id: leaf.id,
          parentId: node.id,
          kind: "leaf" as const,
          title: leaf.title,
          status: leaf.status,
          children: [],
        })),
    })),
  };

  const root = hierarchy(data, (d) => d.children);
  const layout = tree<HierarchyDatum>().nodeSize([
    Math.max(NODE_SIZE.leaf.height, NODE_SIZE.task.height) + SIBLING_GAP,
    Math.max(NODE_SIZE.root.width, NODE_SIZE.task.width, NODE_SIZE.leaf.width) + LEVEL_GAP,
  ]);
  layout(root);

  const sourcePosition = direction === "LR" ? Position.Right : Position.Bottom;
  const targetPosition = direction === "LR" ? Position.Left : Position.Top;

  const nodes: MindMapNode[] = [];
  const edges: Edge[] = [];

  root.each((d) => {
    const kind = d.data.kind;
    const size = NODE_SIZE[kind];
    // d3-hierarchy: x = position along the sibling axis, y = cumulative depth axis
    const along = d.x ?? 0;
    const depthAxis = d.y ?? 0;
    const position =
      direction === "LR"
        ? { x: depthAxis, y: along - size.height / 2 }
        : { x: along - size.width / 2, y: depthAxis };

    let onSelect: () => void;
    let onAddChild: (() => void) | undefined;
    let onDelete: (() => void) | undefined;

    if (kind === "root") {
      onSelect = onSelectRoot;
      onAddChild = onAddTaskNode;
      onDelete = undefined;
    } else if (kind === "task") {
      onSelect = () => onSelectTaskNode(d.data.id);
      onAddChild = () => onAddLeafNode(d.data.id);
      onDelete = () => onDeleteTaskNode(d.data.id);
    } else {
      const parentId = d.data.parentId as string;
      onSelect = () => onSelectLeafNode(d.data.id, parentId);
      onAddChild = undefined;
      onDelete = () => onDeleteLeafNode(parentId, d.data.id);
    }

    // drag-and-drop reparenting: only leaves are draggable, and only
    // root/task nodes are valid drop targets (never a leaf's own current
    // task, and never another leaf — depth is capped at 2)
    const draggable = kind === "leaf";
    const isDropTarget =
      Boolean(draggingLeafId) &&
      (kind === "root" || (kind === "task" && d.data.id !== draggingLeafParentId));

    nodes.push({
      id: d.data.id,
      type: kind,
      position,
      width: size.width,
      height: size.height,
      selected: isSelected(selection, kind, d.data.id),
      draggable: false,
      connectable: false,
      data: {
        kind,
        nodeId: d.data.id,
        parentId: d.data.parentId,
        title: d.data.title,
        status: d.data.status,
        direction,
        sourcePosition,
        targetPosition,
        editing: d.data.id === editingNodeId,
        editingSeed: d.data.id === editingNodeId ? editingSeed : null,
        onSelect,
        onAddChild,
        onDelete,
        onStartEdit: () => onStartEdit(d.data.id),
        onCommitEdit,
        onCancelEdit,
        draggable,
        isDragging: draggable && d.data.id === draggingLeafId,
        isDropTarget,
        isDropHighlighted: isDropTarget && dropTargetId === d.data.id,
        onDragStart: draggable ? () => onLeafDragStart?.(d.data.id, d.data.parentId as string) : undefined,
        onDragOverNode: isDropTarget ? () => onNodeDragOver?.(d.data.id) : undefined,
        onDragLeaveNode: isDropTarget ? () => onNodeDragLeave?.() : undefined,
        onDropNode: isDropTarget ? () => onNodeDrop?.(d.data.id) : undefined,
        onDragEndNode: draggable ? () => onDragEnd?.() : undefined,
      },
    });

    if (d.parent) {
      edges.push({
        id: `${d.parent.data.id}->${d.data.id}`,
        source: d.parent.data.id,
        target: d.data.id,
        type: "default",
        style: { stroke: "var(--edge-stroke, #CBD5E1)", strokeWidth: 1.5 },
      });
    }
  });

  return { nodes, edges };
}

export type NavigationDirection = "left" | "right" | "up" | "down";

/**
 * Fixed left-to-right tree layout, so spatial navigation reduces to:
 * left = parent, right = first child, up/down = neighbor within the
 * same depth "column" (crossing between branches when at the edge of
 * one parent's children, so it follows visual top-to-bottom order).
 */
export function getNavigationTarget(
  mindMap: MindMap,
  selection: Selection,
  direction: NavigationDirection,
  showCompleted: boolean,
): Selection {
  if (!selection) return null;

  const visibleTaskNodes = mindMap.nodes.filter((n) => showCompleted || n.status !== "completed");
  const visibleChildrenOf = (nodeId: string) =>
    (visibleTaskNodes.find((n) => n.id === nodeId)?.children ?? []).filter(
      (leaf) => showCompleted || leaf.status !== "completed",
    );

  if (selection.depth === 0) {
    if (direction === "right" && visibleTaskNodes.length) {
      return { depth: 1, nodeId: visibleTaskNodes[0].id };
    }
    return selection;
  }

  if (selection.depth === 1) {
    const idx = visibleTaskNodes.findIndex((n) => n.id === selection.nodeId);
    if (idx === -1) return selection;

    if (direction === "left") return { depth: 0 };
    if (direction === "right") {
      const children = visibleChildrenOf(selection.nodeId);
      return children.length ? { depth: 2, nodeId: children[0].id, parentId: selection.nodeId } : selection;
    }
    if (direction === "up" && idx > 0) {
      return { depth: 1, nodeId: visibleTaskNodes[idx - 1].id };
    }
    if (direction === "down" && idx < visibleTaskNodes.length - 1) {
      return { depth: 1, nodeId: visibleTaskNodes[idx + 1].id };
    }
    return selection;
  }

  // depth === 2
  const parentIdx = visibleTaskNodes.findIndex((n) => n.id === selection.parentId);
  if (parentIdx === -1) return selection;
  const siblings = visibleChildrenOf(selection.parentId);
  const idx = siblings.findIndex((leaf) => leaf.id === selection.nodeId);
  if (idx === -1) return selection;

  if (direction === "left") return { depth: 1, nodeId: selection.parentId };
  if (direction === "right") return selection;

  if (direction === "up") {
    if (idx > 0) return { depth: 2, nodeId: siblings[idx - 1].id, parentId: selection.parentId };
    for (let i = parentIdx - 1; i >= 0; i--) {
      const pool = visibleChildrenOf(visibleTaskNodes[i].id);
      if (pool.length) {
        return { depth: 2, nodeId: pool[pool.length - 1].id, parentId: visibleTaskNodes[i].id };
      }
    }
    return selection;
  }

  // down
  if (idx < siblings.length - 1) {
    return { depth: 2, nodeId: siblings[idx + 1].id, parentId: selection.parentId };
  }
  for (let i = parentIdx + 1; i < visibleTaskNodes.length; i++) {
    const pool = visibleChildrenOf(visibleTaskNodes[i].id);
    if (pool.length) {
      return { depth: 2, nodeId: pool[0].id, parentId: visibleTaskNodes[i].id };
    }
  }
  return selection;
}

/**
 * Where selection should land after deleting the given node: the
 * previous sibling, or the parent if there is no previous sibling.
 * Call this with the mindMap as it was *before* the deletion.
 */
export function getPostDeleteSelection(mindMap: MindMap, selection: Selection): Selection {
  if (!selection || selection.depth === 0) return selection;

  if (selection.depth === 1) {
    const idx = mindMap.nodes.findIndex((n) => n.id === selection.nodeId);
    if (idx === -1) return null;
    if (idx > 0) return { depth: 1, nodeId: mindMap.nodes[idx - 1].id };
    return { depth: 0 };
  }

  const parent = mindMap.nodes.find((n) => n.id === selection.parentId);
  if (!parent) return null;
  const idx = parent.children.findIndex((leaf) => leaf.id === selection.nodeId);
  if (idx === -1) return null;
  if (idx > 0) return { depth: 2, nodeId: parent.children[idx - 1].id, parentId: parent.id };
  return { depth: 1, nodeId: parent.id };
}
