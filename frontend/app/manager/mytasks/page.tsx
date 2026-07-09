"use client";

import { TaskManager, type TaskStatus } from "@/components/tasks/TaskManager";
import MobileTaskView from "@/components/MobileTaskView";
import { useAppStore } from "@/lib/store";
import { taskToUiTask } from "@/lib/ui";

export default function MyTasksPage() {
  const { projects, teamMembers, currentUser, editTaskStatus, isLoading } = useAppStore();
  const userKeys = [currentUser?.sub, currentUser?.email, currentUser?.name].filter(Boolean).map((key) => String(key).toLowerCase());

  const tasks = projects
    .flatMap((project) => project.tasks)
    .filter((task) => {
      const assignee = task.assignee.toLowerCase();
      const assigneeName = teamMembers.find((member) => member.id === task.assignee)?.name.toLowerCase();
      const assigneeEmail = teamMembers.find((member) => member.id === task.assignee)?.email.toLowerCase();
      return userKeys.some((key) => key === assignee || key === assigneeName || key === assigneeEmail);
    })
    .map((task) => taskToUiTask(task, projects, teamMembers));

  const handleStatusChange = (task: (typeof tasks)[number], status: TaskStatus) => {
    const project = projects.find((item) => item.tasks.some((projectTask) => projectTask.id === task.id));
    if (project) void editTaskStatus(project.id, task.id, { status });
  };

  if (isLoading && tasks.length === 0) {
    return <div className="bg-[#F1F3E9] dark:bg-black/50 rounded-3xl p-8 text-sm text-gray-500 dark:text-gray-400">A carregar as suas tarefas...</div>;
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block space-y-4">
        <div className="bg-[#F1F3E9] dark:bg-black/50 rounded-3xl p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length === 0 ? "Ainda não há tarefas atribuídas a si." : `${tasks.length} tarefa${tasks.length === 1 ? "" : "s"} atribuída${tasks.length === 1 ? "" : "s"} a si.`}
          </p>
        </div>
        <TaskManager
          tasks={tasks}
          onStatusChange={handleStatusChange}
          showProjectCodeInList
          searchFilterFields={["name", "project"]}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileTaskView tasks={tasks} onStatusChange={handleStatusChange} />
      </div>
    </>
  );
}
