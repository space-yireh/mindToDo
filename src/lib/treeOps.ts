import { makeLeafNode, makeTaskNode } from "./mindmapConvert";
import type { LeafNode, MindMap, Selection } from "./types";

export function addTaskNode(mindMap: MindMap): MindMap {
  return { ...mindMap, nodes: [...mindMap.nodes, makeTaskNode()] };
}

export function addLeafNode(mindMap: MindMap, parentId: string): MindMap {
  return {
    ...mindMap,
    nodes: mindMap.nodes.map((node) =>
      node.id === parentId ? { ...node, children: [...node.children, makeLeafNode()] } : node,
    ),
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

export function findSelectedNode(mindMap: MindMap, selection: Selection): LeafNode | null {
  if (!selection || selection.depth === 0) return null;
  if (selection.depth === 1) {
    return mindMap.nodes.find((node) => node.id === selection.nodeId) ?? null;
  }
  const parent = mindMap.nodes.find((node) => node.id === selection.parentId);
  return parent?.children.find((leaf) => leaf.id === selection.nodeId) ?? null;
}
