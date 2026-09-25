import { makeLeafNode, makeTaskNode } from "./mindmapConvert";
import type { LeafNode, MindMap, Selection, TaskNode } from "./types";

function swap<T>(items: T[], i: number, j: number): T[] {
  const next = [...items];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export function addTaskNode(mindMap: MindMap, title?: string): { mindMap: MindMap; nodeId: string } {
  const node = makeTaskNode(title);
  return { mindMap: { ...mindMap, nodes: [...mindMap.nodes, node] }, nodeId: node.id };
}

export function addLeafNode(
  mindMap: MindMap,
  parentId: string,
  title?: string,
): { mindMap: MindMap; nodeId: string } {
  const leaf = makeLeafNode(title);
  return {
    mindMap: {
      ...mindMap,
      nodes: mindMap.nodes.map((node) =>
        node.id === parentId ? { ...node, children: [...node.children, leaf] } : node,
      ),
    },
    nodeId: leaf.id,
  };
}

export function removeTaskNode(mindMap: MindMap, nodeId: string): MindMap {
  return { ...mindMap, nodes: mindMap.nodes.filter((node) => node.id !== nodeId) };
}

export function removeLeafNode(mindMap: MindMap, parentId: string, nodeId: string): MindMap {
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((node) =>
      node.id === parentId
        ? { ...node, children: node.children.filter((leaf) => leaf.id !== nodeId) }
        : node,
    ),
  };
}

export function updateTaskNode(mindMap: MindMap, nodeId: string, patch: Partial<LeafNode>): MindMap {
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
  };
}

export function updateLeafNode(
  mindMap: MindMap,
  parentId: string,
  nodeId: string,
  patch: Partial<LeafNode>,
): MindMap {
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((node) =>
      node.id === parentId
        ? {
            ...node,
            children: node.children.map((leaf) => (leaf.id === nodeId ? { ...leaf, ...patch } : leaf)),
          }
        : node,
    ),
  };
}

/** Swaps a depth-1 task with its previous/next sibling under the root. No-op at either end. */
export function moveTaskNode(mindMap: MindMap, nodeId: string, direction: "up" | "down"): MindMap {
  const idx = mindMap.nodes.findIndex((node) => node.id === nodeId);
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || target < 0 || target >= mindMap.nodes.length) return mindMap;
  return { ...mindMap, nodes: swap(mindMap.nodes, idx, target) };
}

/** Swaps a depth-2 leaf with its previous/next sibling under the same task. No-op at either end. */
export function moveLeafNode(
  mindMap: MindMap,
  parentId: string,
  nodeId: string,
  direction: "up" | "down",
): MindMap {
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((node) => {
      if (node.id !== parentId) return node;
      const idx = node.children.findIndex((leaf) => leaf.id === nodeId);
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || target < 0 || target >= node.children.length) return node;
      return { ...node, children: swap(node.children, idx, target) };
    }),
  };
}

/**
 * Moves a leaf from its current task to become a child of a different task
 * (drag-and-drop reparenting). No-op if the target is the leaf's current
 * parent, or if the leaf/source task can't be found.
 */
export function reparentLeafToTask(
  mindMap: MindMap,
  leafId: string,
  fromTaskId: string,
  toTaskId: string,
): MindMap {
  if (fromTaskId === toTaskId) return mindMap;
  const fromTask = mindMap.nodes.find((node) => node.id === fromTaskId);
  const leaf = fromTask?.children.find((l) => l.id === leafId);
  if (!leaf) return mindMap;
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((node) => {
      if (node.id === fromTaskId) return { ...node, children: node.children.filter((l) => l.id !== leafId) };
      if (node.id === toTaskId) return { ...node, children: [...node.children, leaf] };
      return node;
    }),
  };
}

/**
 * Promotes a leaf (depth 2) to become a top-level task (depth 1), dropped
 * at the end of the task list. Drag-and-drop equivalent of "move to root".
 */
export function promoteLeafToTask(mindMap: MindMap, leafId: string, fromTaskId: string): MindMap {
  const fromTask = mindMap.nodes.find((node) => node.id === fromTaskId);
  const leaf = fromTask?.children.find((l) => l.id === leafId);
  if (!leaf) return mindMap;
  const promoted: TaskNode = { ...leaf, children: [] };
  return {
    ...mindMap,
    nodes: [
      ...mindMap.nodes.map((node) =>
        node.id === fromTaskId ? { ...node, children: node.children.filter((l) => l.id !== leafId) } : node,
      ),
      promoted,
    ],
  };
}

export function findSelectedNode(mindMap: MindMap, selection: Selection): LeafNode | null {
  if (!selection || selection.depth === 0) return null;
  if (selection.depth === 1) {
    return mindMap.nodes.find((node) => node.id === selection.nodeId) ?? null;
  }
  const parent = mindMap.nodes.find((node) => node.id === selection.parentId);
  return parent?.children.find((leaf) => leaf.id === selection.nodeId) ?? null;
}
