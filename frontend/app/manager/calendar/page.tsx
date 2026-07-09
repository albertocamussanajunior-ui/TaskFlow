"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  CheckCircle2,
  GitPullRequest,
  Search,
  X,
  ChevronDown,
  Flag,
  MoreVertical,
} from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/components/tasks/TaskManager";
import { useAppStore } from "@/lib/store";
import { formatDate, taskToUiTask } from "@/lib/ui";

type UiTask = ReturnType<typeof taskToUiTask>;

const priorityConfig: Record<TaskPriority, { label: string; className: string; dotColor: string }> = {
  low_priority: { label: "Baixa", className: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", dotColor: "bg-green-400" },
  medium_priority: { label: "Média", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", dotColor: "bg-yellow-400" },
  high_priority: { label: "Alta", className: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", dotColor: "bg-red-400" },
  critical_priority: { label: "Crítica", className: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400", dotColor: "bg-purple-400" },
};

const columns: { id: TaskStatus; label: string; icon: React.ReactNode; accent: string; bg: string }[] = [
  { id: "todo", label: "A Fazer", icon: <Circle size={13} />, accent: "text-gray-500 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
  { id: "in_progress", label: "Em Progresso", icon: <Clock size={13} />, accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { id: "review", label: "Revisão", icon: <GitPullRequest size={13} />, accent: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { id: "done", label: "Concluído", icon: <CheckCircle2 size={13} />, accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
];

const avatarColors: Record<string, string> = {
  JS: "bg-violet-200 text-violet-700 dark:bg-violet-500/30 dark:text-violet-300",
  MS: "bg-pink-200 text-pink-700 dark:bg-pink-500/30 dark:text-pink-300",
  CP: "bg-sky-200 text-sky-700 dark:bg-sky-500/30 dark:text-sky-300",
  PR: "bg-orange-200 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300",
  SM: "bg-teal-200 text-teal-700 dark:bg-teal-500/30 dark:text-teal-300",
  AC: "bg-rose-200 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "xs" }) {
  const color = avatarColors[initials] ?? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  const dim = size === "xs" ? "w-5 h-5 text-[9px]" : "w-6 h-6 text-xs";
  return (
    <span className={`${dim} ${color} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </span>
  );
}

export default function TasksCalendarPage() {
  const router = useRouter();
  const { projects, teamMembers, isLoading } = useAppStore();

  const [today, setToday] = useState<Date | null>(null);
  const [current, setCurrent] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrent(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  const allTasks = useMemo(
    () => projects.flatMap((project) => project.tasks.map((task) => taskToUiTask(task, projects, teamMembers))),
    [projects, teamMembers],
  );

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchSearch =
        task.name.toLowerCase().includes(search.toLowerCase()) ||
        task.assignee.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [allTasks, search, priorityFilter]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, UiTask[]> = {};
    filteredTasks.forEach((task) => {
      const key = task.due_date;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [filteredTasks]);

  const findProjectId = (taskId: string) =>
    projects.find((project) => project.tasks.some((task) => task.id === taskId))?.id;

  if (!current || !today) {
    return <div className="rounded-3xl bg-white p-8 text-sm text-gray-500 shadow-sm dark:bg-black/50 dark:text-gray-400">A carregar calendário...</div>;
  }

  if (isLoading && allTasks.length === 0) {
    return <div className="rounded-3xl bg-white p-8 text-sm text-gray-500 shadow-sm dark:bg-black/50 dark:text-gray-400">A carregar tarefas...</div>;
  }

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  const toKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const selectedTasks = selected ? (tasksByDate[selected] ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 transition w-52 dark:bg-black/50 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="relative">
            <Flag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-8 pr-7 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black/20 cursor-pointer transition dark:bg-black/50 dark:border-white/10 dark:text-gray-300"
            >
              <option value="all">Prioridade</option>
              <option value="low_priority">Baixa</option>
              <option value="medium_priority">Média</option>
              <option value="high_priority">Alta</option>
              <option value="critical_priority">Crítica</option>
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>

          {(search || priorityFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setPriorityFilter("all"); }}
              className="flex items-center gap-1 text-sm text-black/60 hover:text-black/90 font-medium transition-colors dark:text-gray-400 dark:hover:text-white"
            >
              <X size={12} />
              Limpar
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {columns.map((col) => (
            <span key={col.id} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span className={`${col.bg} p-0.5 rounded`}>{col.icon}</span>
              {col.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:bg-black/50 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 dark:hover:bg-white/10 dark:text-gray-400">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
              >
                Hoje
              </button>
              <button onClick={next} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 dark:hover:bg-white/10 dark:text-gray-400">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                {weekday}
              </div>
            ))}

            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`blank-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const key = toKey(day);
              const dayTasks = tasksByDate[key] ?? [];
              const isSelected = selected === key;

              return (
                <button
                  key={day}
                  onClick={() => setSelected(isSelected ? null : key)}
                  className={`relative p-1 sm:p-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all min-h-12 sm:min-h-13 ${
                    isSelected
                      ? "bg-black/90 text-white shadow dark:bg-white/10"
                      : isToday(day)
                      ? "bg-gray-100 shadow-sm text-black font-bold dark:bg-white/10 dark:text-white"
                      : "hover:bg-gray-50 text-gray-700 dark:hover:bg-white/5 dark:text-gray-300"
                  }`}
                >
                  <span className="text-xs font-semibold leading-none">{day}</span>

                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                      {dayTasks.slice(0, 3).map((task) => (
                        <span
                          key={task.id}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : priorityConfig[task.priority].dotColor}`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className={`text-[9px] font-bold leading-none ${isSelected ? "text-white/80" : "text-gray-400 dark:text-gray-500"}`}>
                          +{dayTasks.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 flex-wrap pt-3 mt-3 border-t border-gray-100 dark:border-white/10">
            {Object.entries(priorityConfig).map(([, config]) => (
              <span key={config.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                {config.label}
              </span>
            ))}
            <span className="text-xs text-gray-400 dark:text-gray-500">|</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredTasks.length} tarefa{filteredTasks.length !== 1 ? "s" : ""} no período
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex flex-col max-h-150 dark:bg-black/50 dark:border-white/10">
          <div className="shrink-0">
            <h4 className="text-sm font-bold text-gray-800 capitalize dark:text-white">
              {selected
                ? formatDate(selected, { weekday: "long", day: "numeric", month: "long" })
                : "Selecione um dia"}
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {selected
                ? `${selectedTasks.length} ${selectedTasks.length === 1 ? "tarefa" : "tarefas"}`
                : "Clique num dia para ver os detalhes"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 pr-0.5 space-y-2">
            {selectedTasks.length === 0 && selected && (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <CheckCircle2 size={28} className="text-gray-200 dark:text-gray-700" />
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Sem tarefas neste dia</p>
              </div>
            )}

            {selectedTasks.map((task) => {
              const priority = priorityConfig[task.priority];
              const col = columns.find((column) => column.id === task.status)!;
              const projectId = findProjectId(task.id);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => projectId && router.push(`/manager/projects/${projectId}`)}
                  className="w-full text-left bg-gray-50 rounded-xl p-3 space-y-2 hover:bg-gray-100 transition-colors dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 leading-snug dark:text-white">{task.name}</p>
                    <span className="text-gray-300 dark:text-gray-600 shrink-0">
                      <MoreVertical size={14} />
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={task.assigneeInitials} size="xs" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignee.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.className}`}>
                        {priority.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.bg} ${col.accent}`}>
                        {col.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">
                    {task.project} • {task.projectCode}
                  </div>
                </button>
              );
            })}

            {!selected && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-12">
                <CalendarIcon size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Selecione um dia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}