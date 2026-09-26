import type { LeafNode, MindMap, Selection, TaskNode } from "./types";

function leafLine(leaf: LeafNode, indent: string, dueLabel: string): string {
  const checkbox = leaf.status === "completed" ? "[x]" : "[ ]";
  const due = leaf.due ? ` (${dueLabel}: ${leaf.due})` : "";
  let out = `${indent}- ${checkbox} ${leaf.title || "-"}${due}\n`;
  const notes = leaf.notes.trim();
  if (notes) {
    out += notes
      .split("\n")
      .map((line) => `${indent}  > ${line}\n`)
      .join("");
  }
  return out;
}

function taskBlock(task: TaskNode, dueLabel: string): string {
  let out = leafLine(task, "", dueLabel);
  for (const leaf of task.children) {
    out += leafLine(leaf, "  ", dueLabel);
  }
  return out;
}

/**
 * Markdown for Ctrl/Cmd+C on the canvas. Scoped to whatever's selected: a
 * leaf copies just that item, a task copies it plus its subtasks, and no
 * selection (or the root) copies the whole mind map as a GFM task list.
 */
export function mindMapToMarkdown(mindMap: MindMap, selection: Selection, dueLabel: string): string {
  if (selection?.depth === 1) {
    const task = mindMap.nodes.find((n) => n.id === selection.nodeId);
    return task ? taskBlock(task, dueLabel).trimEnd() + "\n" : "";
  }
  if (selection?.depth === 2) {
    const parent = mindMap.nodes.find((n) => n.id === selection.parentId);
    const leaf = parent?.children.find((l) => l.id === selection.nodeId);
    return leaf ? leafLine(leaf, "", dueLabel).trimEnd() + "\n" : "";
  }
  let out = `# ${mindMap.title || "-"}\n\n`;
  for (const task of mindMap.nodes) {
    out += taskBlock(task, dueLabel);
  }
  return out.trimEnd() + "\n";
}
