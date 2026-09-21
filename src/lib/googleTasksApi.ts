const API_BASE = "https://tasks.googleapis.com/tasks/v1";

export class GoogleTasksApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GoogleTasksApiError";
    this.status = status;
  }
}

async function request<T>(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      // ignore body parse failure, fall back to statusText
    }
    throw new GoogleTasksApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface RemoteTaskList {
  id: string;
  title: string;
}

export interface RemoteTask {
  id: string;
  title: string;
  notes?: string;
  due?: string; // RFC3339 timestamp
  status: "needsAction" | "completed";
  parent?: string;
  position: string;
}

export async function listTaskLists(accessToken: string): Promise<RemoteTaskList[]> {
  const items: RemoteTaskList[] = [];
  let pageToken: string | undefined;
  do {
    const query = pageToken ? `?pageToken=${encodeURIComponent(pageToken)}` : "";
    const page = await request<{ items?: RemoteTaskList[]; nextPageToken?: string }>(
      accessToken,
      `/users/@me/lists${query}`,
    );
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return items;
}

export async function createTaskList(
  accessToken: string,
  title: string,
): Promise<RemoteTaskList> {
  return request<RemoteTaskList>(accessToken, "/users/@me/lists", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function patchTaskList(
  accessToken: string,
  tasklistId: string,
  title: string,
): Promise<RemoteTaskList> {
  return request<RemoteTaskList>(accessToken, `/users/@me/lists/${tasklistId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteTaskList(accessToken: string, tasklistId: string): Promise<void> {
  await request<void>(accessToken, `/users/@me/lists/${tasklistId}`, { method: "DELETE" });
}

export async function listTasks(
  accessToken: string,
  tasklistId: string,
): Promise<RemoteTask[]> {
  const items: RemoteTask[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      showCompleted: "true",
      showHidden: "true",
      maxResults: "100",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await request<{ items?: RemoteTask[]; nextPageToken?: string }>(
      accessToken,
      `/lists/${tasklistId}/tasks?${params.toString()}`,
    );
    items.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return items;
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  due?: string; // RFC3339 timestamp
  status: "needsAction" | "completed";
  parent?: string;
  previous?: string;
}

export async function createTask(
  accessToken: string,
  tasklistId: string,
  input: CreateTaskInput,
): Promise<RemoteTask> {
  const params = new URLSearchParams();
  if (input.parent) params.set("parent", input.parent);
  if (input.previous) params.set("previous", input.previous);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<RemoteTask>(accessToken, `/lists/${tasklistId}/tasks${query}`, {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      notes: input.notes || undefined,
      due: input.due,
      status: input.status,
    }),
  });
}

export async function deleteTask(
  accessToken: string,
  tasklistId: string,
  taskId: string,
): Promise<void> {
  try {
    await request<void>(accessToken, `/lists/${tasklistId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  } catch (err) {
    // already gone (e.g. cascade-deleted with its parent) — fine during a clear step
    if (err instanceof GoogleTasksApiError && err.status === 404) return;
    throw err;
  }
}
