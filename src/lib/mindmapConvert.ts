import type { LeafNode, MindMap, TaskNode, TaskStatus } from "./types";
import type { RemoteTask } from "./googleTasksApi";

export function dateToRfc3339(date: string | null): string | undefined {
  if (!date) return undefined;
  return `${date}T00:00:00.000Z`;
}

export function rfc3339ToDate(due: string | undefined): string | null {
  if (!due) return null;
  return due.slice(0, 10);
}

function newId(): string {
  return crypto.randomUUID();
}

export function emptyMindMap(taskListId: string, title: string): MindMap {
  return { taskListId, title, nodes: [] };
}

export function makeTaskNode(title = "새 할일"): TaskNode {
  return {
    id: newId(),
    title,
    notes: "",
    due: null,
    status: "needsAction",
    children: [],
  };
}

export function makeLeafNode(title = "새 세부 할일"): LeafNode {
  return {
    id: newId(),
    title,
    notes: "",
    due: null,
    status: "needsAction",
  };
}

/** Build a MindMap tree from the flat list of tasks Google returns for a list. */
export function tasksToMindMap(
  taskListId: string,
  taskListTitle: string,
  remoteTasks: RemoteTask[],
): MindMap {
  const sorted = [...remoteTasks].sort((a, b) => a.position.localeCompare(b.position));

  const toLeaf = (t: RemoteTask): LeafNode => ({
    id: newId(),
    title: t.title || "",
    notes: t.notes ?? "",
    due: rfc3339ToDate(t.due),
    status: t.status as TaskStatus,
  });

  const depth1 = sorted.filter((t) => !t.parent);
  const childrenByParent = new Map<string, RemoteTask[]>();
  for (const t of sorted) {
    if (!t.parent) continue;
    const list = childrenByParent.get(t.parent) ?? [];
    list.push(t);
    childrenByParent.set(t.parent, list);
  }

  const nodes: TaskNode[] = depth1.map((t) => ({
    ...toLeaf(t),
    children: (childrenByParent.get(t.id) ?? []).map(toLeaf),
  }));

  return { taskListId, title: taskListTitle, nodes };
}
