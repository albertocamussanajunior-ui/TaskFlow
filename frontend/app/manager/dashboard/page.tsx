"use client";

import Link from "next/link";
import { Activity, CheckCircle2, Circle, ClipboardList, Clock, PackageCheck, TriangleAlert, Users, Wallet } from "lucide-react";
import PerformanceCard from "@/components/PerformanceCard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { useAppStore } from "@/lib/store";
import { formatDate, memberName, projectCode } from "@/lib/ui";

const statusConfig = {
  active: { label: "Activo", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  paused: { label: "Pausado", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  completed: { label: "Concluído", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-500";
  if (progress >= 30) return "bg-orange-500";
  return "bg-red-500";
};

export default function DashboardPage() {
  const { projects, teamMembers, isLoading } = useAppStore();
  const tasks = projects.flatMap((project) => project.tasks.map((task) => ({ ...task, project })));
  const totalProjects = projects.length;
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const completedProjects = projects.filter((project) => project.status === "completed").length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const pendingTasks = tasks.length - completedTasks;
  const avgProgress = totalProjects ? Math.round(projects.reduce((acc, project) => acc + project.progress, 0) / totalProjects) : 0;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const projectStatusData = [
    { name: "Activos", total: activeProjects },
    { name: "Concluídos", total: completedProjects },
    { name: "Pausados", total: projects.filter((project) => project.status === "paused").length },
  ];

  const taskCompletionData = projects.slice(0, 6).map((project) => ({
    name: projectCode(project).slice(0, 8),
    completas: project.tasks.filter((task) => task.status === "done").length,
    pendentes: project.tasks.filter((task) => task.status !== "done").length,
  }));

  const recentActivities = [...tasks]
    .sort((a, b) => new Date(b.startDate || b.dueDate).getTime() - new Date(a.startDate || a.dueDate).getTime())
    .slice(0, 8);

  const kpiCards = [
    { icon: <Wallet size={14} />, label: "Projectos activos", value: activeProjects, sub: `${totalProjects} total de projectos` },
    { icon: <ClipboardList size={14} />, label: "Tarefas pendentes", value: pendingTasks, sub: "Aguardam conclusão" },
    { icon: <PackageCheck size={14} />, label: "Tarefas concluídas", value: completedTasks, sub: `${completionRate}% de conclusão` },
    { icon: <TriangleAlert size={14} />, label: "Progresso médio", value: `${avgProgress}%`, sub: "Média de todos os projectos" },
  ];

  return (
    <div className="space-y-6">
      <div className="w-full space-y-4 rounded-3xl bg-white p-6 dark:bg-black/50">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">Visão Geral</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{isLoading && totalProjects === 0 ? "A carregar dados..." : "Indicadores de performance"}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => <PerformanceCard key={card.label} {...card} />)}
        </div>
      </div>

      <DashboardCharts projectStatusData={projectStatusData} taskCompletionData={taskCompletionData} />
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Card de Projectos */}
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-black/50 dark:border-white/5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Projectos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{activeProjects} activos · {completedProjects} concluídos</p>
            </div>
            <Link href="/manager/projects" className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Ver todos →
            </Link>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => {
              const status = statusConfig[project.status];
              return (
                <Link 
                  key={project.id} 
                  href={`/manager/projects/${project.id}`} 
                  className="block rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-medium text-gray-400 dark:text-gray-500">{projectCode(project)}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
                        </div>
                        <h4 className="mt-1.5 text-base font-semibold text-gray-800 dark:text-white">{project.name}</h4>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          Responsável: <span className="font-medium text-gray-700 dark:text-gray-300">{memberName(teamMembers, project.lead) || "Sem responsável"}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-white/5 dark:text-gray-400">
                        <Users size={14} />
                        <span>{project.members.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-gray-500 font-medium dark:text-gray-400">
                        <ClipboardList size={14} className="mr-1 inline text-gray-400 dark:text-gray-500" />
                        {project.tasks.filter((task) => task.status === "done").length}/{project.tasks.length} tarefas
                      </span>
                      <span className="text-sm font-bold text-gray-700 dark:text-white">{project.progress}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`} style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-500">
                Sem projectos para mostrar.
              </p>
            )}
          </div>
        </div>

        {/* Card de Actividades */}
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-black/50 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Actividades</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Últimas actualizações</p>
            </div>
            <Activity size={18} className="text-gray-400 dark:text-gray-500" />
          </div>

          <div className="max-h-150 space-y-3 overflow-y-auto pr-1">
            {recentActivities.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-500">
                Sem tarefas para mostrar.
              </p>
            )}
            {recentActivities.map((task) => (
              <div key={task.id} className="rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {task.status === "done" ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : task.status === "in_progress" ? (
                      <Clock size={16} className="text-amber-500" />
                    ) : (
                      <Circle size={16} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{task.project.name}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{memberName(teamMembers, task.assignee) || task.assignee}</span>
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">{formatDate(task.dueDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}