import type { MindNode, MindEdge } from '@/types'

// ─── Google Tasks API 타입 ─────────────────────────────────

type TaskList = { id: string; title: string }
type Task = {
  id?: string
  title: string
  notes?: string
  status?: 'needsAction' | 'completed'
  parent?: string
}

const TASKS_API = 'https://tasks.googleapis.com/tasks/v1'

// ─── API 헬퍼 ─────────────────────────────────────────────

async function gFetch<T>(
  path: string,
  accessToken: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${TASKS_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Tasks API 오류 [${res.status}]: ${err}`)
  }
  // DELETE는 body 없이 204 반환
  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}

// ─── Task List 관련 ────────────────────────────────────────

async function listTaskLists(token: string): Promise<TaskList[]> {
  const data = await gFetch<{ items?: TaskList[] }>('/users/@me/lists', token)
  return data.items ?? []
}

async function createTaskList(token: string, title: string): Promise<TaskList> {
  return gFetch<TaskList>('/users/@me/lists', token, {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

async function findOrCreateTaskList(token: string, title: string): Promise<string> {
  const lists = await listTaskLists(token)
  const existing = lists.find((l) => l.title === title)
  if (existing) return existing.id
  const created = await createTaskList(token, title)
  return created.id
}

// ─── Task 관련 ─────────────────────────────────────────────

async function insertTask(
  token: string,
  listId: string,
  task: Task,
  parentId?: string,
): Promise<Task> {
  const url = parentId
    ? `/lists/${listId}/tasks?parent=${parentId}`
    : `/lists/${listId}/tasks`
  return gFetch<Task>(url, token, {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

// ─── 마인드맵 → Google Tasks 변환 ─────────────────────────

/**
 * Level 3 이하 노드를 텍스트 트리로 변환 (PRD 3.3 규칙)
 * 재귀적으로 하위 노드를 인덴트된 텍스트로 표현합니다.
 */
function buildDescriptionText(
  nodeId: string,
  nodes: MindNode[],
  edges: MindEdge[],
  indent = 0,
): string {
  const children = edges
    .filter((e) => e.source === nodeId)
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter(Boolean) as MindNode[]

  return children
    .map((child) => {
      const prefix = '  '.repeat(indent) + '- '
      const sub = buildDescriptionText(child.id, nodes, edges, indent + 1)
      return prefix + child.data.label + (sub ? '\n' + sub : '')
    })
    .join('\n')
}

/**
 * PRD 3.3 규칙에 따라 마인드맵을 Google Tasks로 내보냅니다.
 *
 * 매핑 규칙:
 *  Root  → Task List
 *  Lv.1  → Task (부모 없음)
 *  Lv.2  → Subtask (parent = Lv.1 Task ID)
 *  Lv.3+ → Lv.2 Task의 notes(description)에 텍스트 트리로 삽입
 */
export async function exportToGoogleTasks(
  nodes: MindNode[],
  edges: MindEdge[],
  accessToken: string,
): Promise<{ success: boolean; taskListTitle: string; taskCount: number }> {
  const rootNode = nodes.find((n) => n.id === 'root')
  if (!rootNode) throw new Error('루트 노드를 찾을 수 없습니다.')

  // 1. Task List 생성 또는 찾기
  const listId = await findOrCreateTaskList(accessToken, rootNode.data.label)

  // 2. Level 1 자식 노드 조회
  const lv1Nodes = edges
    .filter((e) => e.source === 'root')
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter(Boolean) as MindNode[]

  let taskCount = 0

  for (const lv1Node of lv1Nodes) {
    // Level 2 자식 노드
    const lv2Nodes = edges
      .filter((e) => e.source === lv1Node.id)
      .map((e) => nodes.find((n) => n.id === e.target))
      .filter(Boolean) as MindNode[]

    // 3. Lv.1 → Task 등록
    const task1 = await insertTask(accessToken, listId, { title: lv1Node.data.label })
    taskCount++

    for (const lv2Node of lv2Nodes) {
      // Level 3+ 하위 노드를 텍스트 트리로 변환
      const deepText = buildDescriptionText(lv2Node.id, nodes, edges)
      const notes = deepText
        ? `[하위 세부 계획]\n${deepText}`
        : undefined

      // 4. Lv.2 → Subtask 등록 (parent = Lv.1 Task ID)
      await insertTask(
        accessToken,
        listId,
        { title: lv2Node.data.label, notes },
        task1.id,
      )
      taskCount++
    }
  }

  return { success: true, taskListTitle: rootNode.data.label, taskCount }
}
