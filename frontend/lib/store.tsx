"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  createProject,
  deleteProject,
  fetchProjects,
  mapApiProjectToFrontend,
  updateProject,
  updateProjectStatus,
  type CreateProjectRequest,
  type UpdateStatusRequest as ProjectUpdateStatusRequest,
} from "@/api/projects/fetches";
import {
  createTask,
  deleteTask,
  fetchTasks,
  mapApiTaskToFrontend,
  updateTask,
  updateTaskStatus,
  type CreateTaskRequest,
  type UpdateStatusRequest,
  type UpdateTaskRequest,
} from "@/api/tasks/fetches";
import { createUser, fetchUsers, mapApiUserToFrontend, type CreateUserRequest } from "@/api/users/fetches";
import {
  clearStoredSession,
  decodeToken,
  getTokenPayload,
  isTokenValid,
  type TokenPayload,
} from "@/lib/session";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low_priority" | "medium_priority" | "high_priority" | "critical_priority";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  projectId: string;
  startDate: string;
  dueDate: string;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  lead: string;
  startDate: string;
  dueDate: string;
  progress: number;
  tasks: Task[];
  members: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  status: "active" | "away" | "offline";
  activeTasks: number;
}

interface AppState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  currentUser: TokenPayload | null;
  projects: Project[];
  teamMembers: TeamMember[];
  setAuthenticated: (value: boolean, payload?: TokenPayload | null) => void;
  refreshData: () => Promise<void>;
  addUser: (body: CreateUserRequest) => Promise<TeamMember | null>;
  addProject: (body: CreateProjectRequest) => Promise<void>;
  editProject: (id: string, body: CreateProjectRequest) => Promise<void>;
  editProjectStatus: (id: string, body: ProjectUpdateStatusRequest) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  addTask: (projectId: string, body: CreateTaskRequest) => Promise<void>;
  editTask: (projectId: string, taskId: string, body: UpdateTaskRequest) => Promise<void>;
  removeTask: (projectId: string, taskId: string) => Promise<void>;
  editTaskStatus: (projectId: string, taskId: string, body: UpdateStatusRequest) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const calculateProgress = (tasks: Task[]) => {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100);
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<TokenPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("cybercore_token");
    const storedAuth = localStorage.getItem("cybercore_auth");

    if (token && storedAuth === "true") {
      setIsAuthenticated(true);
      setCurrentUser(decodeToken(token));
    } else if (token || storedAuth) {
      clearStoredSession();
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setProjects([]);
      setTeamMembers([]);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    const [apiProjects, apiUsers] = await Promise.all([fetchProjects(), fetchUsers()]);

    if (apiUsers) {
      setTeamMembers(apiUsers.map(mapApiUserToFrontend));
    }

    if (apiProjects) {
      const projectsWithTasks = await Promise.all(
        apiProjects.map(async (apiProject) => {
          const tasks = (await fetchTasks({ project_id: apiProject.id }))?.map(mapApiTaskToFrontend) ?? [];
          const project = mapApiProjectToFrontend(apiProject);
          return { ...project, tasks, progress: calculateProgress(tasks) };
        }),
      );
      setProjects(projectsWithTasks);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refreshData();
    }
  }, [isAuthenticated]);

  const handleSetAuthenticated = (value: boolean, payload?: TokenPayload | null) => {
    if (value) {
      localStorage.setItem("cybercore_auth", "true");
      setIsAuthenticated(true);
      setCurrentUser(payload ?? getTokenPayload());
    } else {
      clearStoredSession();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setProjects([]);
      setTeamMembers([]);
    }
  };

  const addProject = async (body: CreateProjectRequest) => {
    const created = await createProject(body);
    if (created) setProjects((prev) => [...prev, created]);
  };

  const addUser = async (body: CreateUserRequest) => {
    const created = await createUser(body);
    if (created) setTeamMembers((prev) => [...prev, created]);
    return created;
  };

  const editProject = async (id: string, body: CreateProjectRequest) => {
    const updated = await updateProject(id, body);
    if (updated) {
      setProjects((prev) => prev.map((project) => (project.id === id ? { ...updated, tasks: project.tasks } : project)));
    }
  };

  const editProjectStatus = async (id: string, body: ProjectUpdateStatusRequest) => {
    const updated = await updateProjectStatus(id, body);
    if (updated) {
      setProjects((prev) => prev.map((project) => (project.id === id ? { ...updated, tasks: project.tasks } : project)));
    }
  };

  const removeProject = async (id: string) => {
    const success = await deleteProject(id);
    if (success) setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const addTask = async (projectId: string, body: CreateTaskRequest) => {
    const created = await createTask(projectId, body);
    if (created) {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          const tasks = [...project.tasks, created];
          return { ...project, tasks, progress: calculateProgress(tasks) };
        }),
      );
    }
  };

  const editTask = async (projectId: string, taskId: string, body: UpdateTaskRequest) => {
    const updated = await updateTask(taskId, body);
    if (updated) {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          const tasks = project.tasks.map((task) => (task.id === taskId ? updated : task));
          return { ...project, tasks, progress: calculateProgress(tasks) };
        }),
      );
    }
  };

  const removeTask = async (projectId: string, taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          const tasks = project.tasks.filter((task) => task.id !== taskId);
          return { ...project, tasks, progress: calculateProgress(tasks) };
        }),
      );
    }
  };

  const editTaskStatus = async (projectId: string, taskId: string, body: UpdateStatusRequest) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        const tasks = project.tasks.map((task) => (task.id === taskId ? { ...task, status: body.status } : task));
        return { ...project, tasks, progress: calculateProgress(tasks) };
      }),
    );

    const updated = await updateTaskStatus(taskId, body);
    if (updated) {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          const tasks = project.tasks.map((task) => (task.id === taskId ? updated : task));
          return { ...project, tasks, progress: calculateProgress(tasks) };
        }),
      );
    } else {
      const apiTasks = await fetchTasks({ project_id: projectId });
      if (apiTasks) {
        setProjects((prev) =>
          prev.map((project) => {
            if (project.id !== projectId) return project;
            const tasks = apiTasks.map(mapApiTaskToFrontend);
            return { ...project, tasks, progress: calculateProgress(tasks) };
          }),
        );
      }
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isInitialized,
      isLoading,
      currentUser,
      projects,
      teamMembers,
      setAuthenticated: handleSetAuthenticated,
      refreshData,
      addUser,
      addProject,
      editProject,
      editProjectStatus,
      removeProject,
      addTask,
      editTask,
      removeTask,
      editTaskStatus,
    }),
    [isAuthenticated, isInitialized, isLoading, currentUser, projects, teamMembers],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
}

export { decodeToken, getTokenPayload, type TokenPayload } from "@/lib/session";
