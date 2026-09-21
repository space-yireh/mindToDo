import { createTask, deleteTask, listTasks, patchTaskList } from "./googleTasksApi";
import { dateToRfc3339, tasksToMindMap } from "./mindmapConvert";
import type { MindMap } from "./types";

export async function importMindMap(
  accessToken: string,
  taskListId: string,
  taskListTitle: string,
): Promise<MindMap> {
  const remoteTasks = await listTasks(accessToken, taskListId);
  return tasksToMindMap(taskListId, taskListTitle, remoteTasks);
}

export async function exportMindMap(
  accessToken: string,
  mindMap: MindMap,
  originalTitle: string,
): Promise<void> {
  const existing = await listTasks(accessToken, mindMap.taskListId);
  for (const task of existing) {
    await deleteTask(accessToken, mindMap.taskListId, task.id);
  }

  let previousDepth1Id: string | undefined;
  for (const node of mindMap.nodes) {
    const created = await createTask(accessToken, mindMap.taskListId, {
      title: node.title,
      notes: node.notes,
      due: dateToRfc3339(node.due),
      status: node.status,
      previous: previousDepth1Id,
    });
    previousDepth1Id = created.id;

    let previousLeafId: string | undefined;
    for (const leaf of node.children) {
      const createdLeaf = await createTask(accessToken, mindMap.taskListId, {
        title: leaf.title,
        notes: leaf.notes,
        due: dateToRfc3339(leaf.due),
        status: leaf.status,
        parent: created.id,
        previous: previousLeafId,
      });
      previousLeafId = createdLeaf.id;
    }
  }

  if (mindMap.title !== originalTitle) {
    await patchTaskList(accessToken, mindMap.taskListId, mindMap.title);
  }
}
