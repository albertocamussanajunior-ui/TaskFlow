"use client";

import { TaskManager, type TaskStatus } from "@/components/tasks/TaskManager";
import MobileTaskView from "@/components/MobileTaskView";
import { useAppStore } from "@/lib/store";
import { taskToUiTask } from "@/lib/ui";

export default function TasksPage() {
  const { projects, teamMembers, editTaskStatus, isLoading } = useAppStore();
  const tasks = projects.flatMap((project) => project.tasks.map((task) => taskToUiTask(task, projects, teamMembers)));

  const handleStatusChange = (task: (typeof tasks)[number], status: TaskStatus) => {
    const project = projects.find((item) => item.tasks.some((projectTask) => projectTask.id === task.id));
    if (project) void editTaskStatus(project.id, task.id, { status });
  };

  if (isLoading && tasks.length === 0) {
    return <div className="bg-[#F1F3E9] rounded-3xl p-8 text-sm text-gray-500">A carregar tarefas...</div>;
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <TaskManager
          tasks={tasks}
          onStatusChange={handleStatusChange}
          showProjectCodeInList
          searchFilterFields={["name", "project", "assignee"]}
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileTaskView tasks={tasks} onStatusChange={handleStatusChange} />
      </div>
    </>
  );
}
