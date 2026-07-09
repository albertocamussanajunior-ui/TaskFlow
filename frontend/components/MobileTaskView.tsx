"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Circle, Plus, X, ChevronDown } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Task as UiTask, TaskStatus } from "@/components/tasks/TaskManager";
import type { TaskPriority } from "@/lib/store";

// ─── Configs ──────────────────────────────────────────────────────────────────

const priorityBorder: Record<TaskPriority, string> = {
  low_priority:      "border-l-emerald-400",
  medium_priority:   "border-l-blue-400",
  high_priority:     "border-l-amber-400",
  critical_priority: "border-l-red-500",
};

const priorityDot: Record<TaskPriority, string> = {
  low_priority:      "bg-emerald-400",
  medium_priority:   "bg-blue-400",
  high_priority:     "bg-amber-400",
  critical_priority: "bg-red-500",
};

const priorityLabel: Record<TaskPriority, string> = {
  low_priority:      "Baixa",
  medium_priority:   "Média",
  high_priority:     "Alta",
  critical_priority: "Crítica",
};

type Filter = "all" | "todo" | "active" | "done";

const filters: { id: Filter; label: string }[] = [
  { id: "all",    label: "Todas"      },
  { id: "todo",   label: "A Fazer"    },
  { id: "active", label: "Em Curso"   },
  { id: "done",   label: "Concluídas" },
];

// ─── Create bottom sheet ──────────────────────────────────────────────────────

function CreateSheet({
  fixedProjectId,
  onClose,
}: {
  fixedProjectId?: string;
  onClose: () => void;
}) {
  const { addTask, projects, teamMembers } = useAppStore();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const projectId = fixedProjectId ?? String(form.get("project_id") ?? "");
    const rawDue = String(form.get("due_date") ?? "");

    if (!projectId) { setSubmitting(false); return; }

    await addTask(projectId, {
      name:        String(form.get("name") ?? ""),
      description: "",
      assignee:    String(form.get("assignee") ?? ""),
      due_date:    rawDue ? `${rawDue}T00:00:00Z` : new Date(Date.now() + 7 * 86400000).toISOString(),
      priority:    String(form.get("priority") ?? "medium_priority") as TaskPriority,
      status:      "todo",
    });
    setSubmitting(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white dark:bg-[#111] p-5 pb-8 shadow-2xl">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-white/20" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Nova Tarefa</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            required
            autoFocus
            placeholder="Nome da tarefa"
            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition"
          />

          {!fixedProjectId && (
            <div className="relative">
              <select
                name="project_id"
                required
                className="w-full appearance-none rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 pr-9 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition cursor-pointer"
              >
                <option value="">Seleccionar projecto…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                name="priority"
                defaultValue="medium_priority"
                className="w-full appearance-none rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 pr-9 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition cursor-pointer"
              >
                <option value="low_priority">Baixa</option>
                <option value="medium_priority">Média</option>
                <option value="high_priority">Alta</option>
                <option value="critical_priority">Crítica</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <input
              name="due_date"
              type="date"
              className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition"
            />
          </div>

          <div className="relative">
            <select
              name="assignee"
              className="w-full appearance-none rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 pr-9 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition cursor-pointer"
            >
              <option value="">Responsável (opcional)</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-2xl bg-black/90 dark:bg-white/10 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
          >
            {submitting ? "A criar…" : "Criar Tarefa"}
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
}: {
  task: UiTask;
  onToggle: () => void;
}) {
  const done = task.status === "done";
  const border = priorityBorder[task.priority as TaskPriority] ?? "border-l-gray-300";

  return (
    <div
      className="flex items-center gap-3 bg-white dark:bg-black/50 rounded-2xl px-4 py-3.5 shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 transition-transform active:scale-90"
        aria-label={done ? "Marcar como não concluída" : "Marcar como concluída"}
      >
        {done
          ? <CheckCircle2 size={22} className="text-emerald-500" />
          : <Circle size={22} className="text-gray-300 dark:text-gray-600" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${done ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-white"}`}>
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.project && (
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">{task.project}</span>
          )}
          {task.project && task.due_date && <span className="text-gray-200 dark:text-gray-700">·</span>}
          {task.due_date && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(task.due_date).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`w-2 h-2 rounded-full ${priorityDot[task.priority as TaskPriority] ?? "bg-gray-300"}`} />
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{priorityLabel[task.priority as TaskPriority]}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MobileTaskViewProps {
  tasks: UiTask[];
  onStatusChange: (task: UiTask, status: TaskStatus) => void;
  fixedProjectId?: string;
}

export default function MobileTaskView({ tasks, onStatusChange, fixedProjectId }: MobileTaskViewProps) {
  const [filter, setFilter]       = useState<Filter>("all");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = tasks.filter((t) => {
    if (filter === "all")    return true;
    if (filter === "todo")   return t.status === "todo";
    if (filter === "active") return t.status === "in_progress" || t.status === "review";
    if (filter === "done")   return t.status === "done";
    return true;
  });

  const todo   = tasks.filter((t) => t.status === "todo").length;
  const active = tasks.filter((t) => t.status === "in_progress" || t.status === "review").length;
  const done   = tasks.filter((t) => t.status === "done").length;

  function handleToggle(task: UiTask) {
    onStatusChange(task, task.status === "done" ? "todo" : "done");
  }

  return (
    <div className="space-y-4">
      {showCreate && (
        <CreateSheet fixedProjectId={fixedProjectId} onClose={() => setShowCreate(false)} />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "A Fazer",   count: todo,   color: "text-gray-700 dark:text-gray-200"   },
          { label: "Em Curso",  count: active, color: "text-amber-600 dark:text-amber-400" },
          { label: "Concluídas",count: done,   color: "text-emerald-600 dark:text-emerald-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white dark:bg-black/50 rounded-2xl p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{count}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === id
                ? "bg-black/90 text-white dark:bg-white/10 dark:text-white"
                : "bg-white dark:bg-black/50 text-gray-500 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-black/50 rounded-2xl p-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Sem tarefas neste filtro</p>
          </div>
        )}
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} onToggle={() => handleToggle(task)} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-black/90 dark:bg-white/10 shadow-lg text-white transition-transform active:scale-95"
        aria-label="Nova Tarefa"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
