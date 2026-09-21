export type TaskStatus = "needsAction" | "completed";

export interface TaskList {
  id: string;
  title: string;
}

/** depth 2 node — a subtask, leaf only, no children allowed */
export interface LeafNode {
  id: string;
  title: string;
  notes: string;
  due: string | null; // yyyy-mm-dd
  status: TaskStatus;
}

/** depth 1 node — a task, may hold depth-2 children */
export interface TaskNode extends LeafNode {
  children: LeafNode[];
}

/** the whole mind map for one TaskList (depth 0 root + depth 1/2 nodes) */
export interface MindMap {
  taskListId: string;
  title: string; // depth 0 title, mirrors the TaskList's title
  nodes: TaskNode[]; // depth 1 nodes in order
}

export type Selection =
  | { depth: 0 }
  | { depth: 1; nodeId: string }
  | { depth: 2; nodeId: string; parentId: string }
  | null;
