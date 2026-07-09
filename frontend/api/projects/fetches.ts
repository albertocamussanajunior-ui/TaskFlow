import type { Project } from "@/lib/store";
import universalRequest from "../universalRequest";
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  GET_PROJECT,
  LIST_PROJECTS,
  UPDATE_PROJECT,
  UPDATE_PROJECT_STATUS,
} from "../urls";

export interface ApiProject {
  created_at?: string;
  created_by?: string;
  deleted_by?: string;
  description?: string;
  due_date?: string;
  id: string;
  last_accessed_at?: string;
  members?: string[];
  name: string;
  responsible?: string;
  start_date?: string;
  status?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  due_date: string;
  start_date?: string;
  responsible: string;
  members: string[];
}

export interface UpdateStatusRequest {
  status: string;
}

interface ListProjectsResponse {
  data?: ApiProject[];
  meta?: {
    limit: number;
    page: number;
  };
}

const normalizeProjectStatus = (status?: string): Project["status"] => {
  if (status === "completed") return "completed";
  if (status === "paused" || status === "on_hold") return "paused";
  return "active";
};

export const mapApiProjectToFrontend = (api: ApiProject): Project => ({
  id: api.id,
  name: api.name || "Projecto sem nome",
  description: api.description ?? "",
  status: normalizeProjectStatus(api.status),
  lead: api.responsible ?? "",
  startDate: api.start_date ?? api.created_at ?? "",
  dueDate: api.due_date ?? "",
  progress: 0,
  tasks: [],
  members: api.members ?? [],
});

const unwrapProjects = (response: ApiProject[] | ListProjectsResponse | null) => {
  if (!response) return null;
  return Array.isArray(response) ? response : response.data ?? [];
};

export async function fetchProjects(): Promise<ApiProject[] | null> {
  const response = await universalRequest<undefined, ApiProject[] | ListProjectsResponse>(LIST_PROJECTS, "GET");
  return unwrapProjects(response);
}

export async function fetchProject(id: string): Promise<Project | null> {
  const response = await universalRequest<undefined, ApiProject>(GET_PROJECT(id), "GET");
  return response ? mapApiProjectToFrontend(response) : null;
}

export async function createProject(body: CreateProjectRequest): Promise<Project | null> {
  const response = await universalRequest<CreateProjectRequest, ApiProject>(CREATE_PROJECT, "POST", { body });
  return response ? mapApiProjectToFrontend(response) : null;
}

export async function updateProject(id: string, body: CreateProjectRequest): Promise<Project | null> {
  const response = await universalRequest<CreateProjectRequest, ApiProject>(UPDATE_PROJECT(id), "PUT", { body });
  return response ? mapApiProjectToFrontend(response) : null;
}

export async function updateProjectStatus(id: string, body: UpdateStatusRequest): Promise<Project | null> {
  const response = await universalRequest<UpdateStatusRequest, ApiProject>(UPDATE_PROJECT_STATUS(id), "PUT", { body });
  return response ? mapApiProjectToFrontend(response) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const response = await universalRequest<undefined, unknown>(DELETE_PROJECT(id), "DELETE");
  return response !== null;
}
