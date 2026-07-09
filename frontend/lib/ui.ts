import type { Project, Task, TeamMember } from "@/lib/store";
import type { Task as UiTask } from "@/components/tasks/TaskManager";

export const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const toDateInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
};

export const formatDate = (value?: string, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-MZ", options ?? { day: "2-digit", month: "short", year: "numeric" });
};

export const projectCode = (project: Project) =>
  project.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.slice(0, 3).toUpperCase())
    .join("-") || project.id.slice(0, 8).toUpperCase();

export const memberName = (members: TeamMember[], idOrName?: string) => {
  if (!idOrName) return "";
  return members.find((member) => member.id === idOrName)?.name ?? idOrName;
};

export const taskToUiTask = (task: Task, projects: Project[], members: TeamMember[]): UiTask => {
  const project = projects.find((item) => item.id === task.projectId);
  const assigneeName = memberName(members, task.assignee);

  return {
    id: task.id,
    name: task.title,
    description: task.description,
    project: project?.name ?? "Sem projecto",
    projectCode: project ? projectCode(project) : task.projectId.slice(0, 8).toUpperCase(),
    assignee: assigneeName || "Sem responsável",
    assigneeInitials: initials(assigneeName || task.assignee),
    priority: task.priority,
    status: task.status,
    due_date: toDateInput(task.dueDate) || toDateInput(task.startDate) || new Date().toISOString().slice(0, 10),
    start_date: toDateInput(task.startDate) || toDateInput(task.dueDate) || new Date().toISOString().slice(0, 10),
  };
};
