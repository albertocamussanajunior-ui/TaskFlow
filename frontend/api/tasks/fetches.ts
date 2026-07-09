import type { Task, TaskPriority, TaskStatus } from "@/lib/store";
import universalRequest from "../universalRequest";
import { CREATE_TASK, GET_TASK, LIST_TASKS, UPDATE_TASK, UPDATE_TASK_STATUS, DELETE_TASK } from "../urls";

export interface ApiTask {
  id: string;
  name: string;
  description?: string;
  assignee?: string;
  project_id?: string;
  depends_on?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  last_accessed_at?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_by?: string;
}

export interface CreateTaskRequest {
  name: string;
  assignee: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  depends_on?: string;
}

export interface UpdateStatusRequest {
  status: TaskStatus;
}

export interface UpdateTaskRequest {
  name: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  priority?: TaskPriority;
}

export interface GetTasksFilters {
  project_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  page?: number;
  limit?: number;
}

const normalizePriority = (priority?: string): TaskPriority => {
  if (priority === "critical_priority") return "critical_priority";
  if (priority === "high_priority") return "high_priority";
  if (priority === "low_priority") return "low_priority";
  return "medium_priority";
};

const normalizeStatus = (status?: string): TaskStatus => {
  if (status === "in_progress" || status === "review" || status === "done") return status;
  return "todo";
};

export const mapApiTaskToFrontend = (api: ApiTask): Task => ({
  id: api.id,
  title: api.name || "Tarefa sem nome",
  description: api.description ?? "",
  status: normalizeStatus(api.status),
  priority: normalizePriority(api.priority),
  assignee: api.assignee ?? "",
  projectId: api.project_id ?? "",
  startDate: api.created_at ?? "",
  dueDate: api.due_date ?? "",
  tags: [],
});

export async function fetchTasks(filters?: GetTasksFilters): Promise<ApiTask[] | null> {
  const queryString = filters
    ? `?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters)
            .filter(([, value]) => value !== undefined && value !== "")
            .map(([key, value]) => [key, String(value)]),
        ),
      ).toString()}`
    : "";

  return universalRequest<undefined, ApiTask[]>(`${LIST_TASKS}${queryString}`, "GET");
}

export async function fetchTask(id: string): Promise<Task | null> {
  const response = await universalRequest<undefined, ApiTask>(GET_TASK(id), "GET");
  return response ? mapApiTaskToFrontend(response) : null;
}

export async function createTask(projectId: string, body: CreateTaskRequest): Promise<Task | null> {
  const response = await universalRequest<CreateTaskRequest, ApiTask>(CREATE_TASK(projectId), "POST", { body });
  return response ? mapApiTaskToFrontend(response) : null;
}

export async function updateTask(id: string, body: UpdateTaskRequest): Promise<Task | null> {
  const response = await universalRequest<UpdateTaskRequest, ApiTask>(UPDATE_TASK(id), "PUT", { body });
  return response ? mapApiTaskToFrontend(response) : null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const response = await universalRequest<undefined, unknown>(DELETE_TASK(id), "DELETE");
  return response !== null;
}

export async function updateTaskStatus(id: string, body: UpdateStatusRequest): Promise<Task | null> {
  const response = await universalRequest<UpdateStatusRequest, ApiTask>(UPDATE_TASK_STATUS(id), "PUT", { body });
  return response ? mapApiTaskToFrontend(response) : null;
}
