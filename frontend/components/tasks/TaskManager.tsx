"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  Flag,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  CheckCircle2,
  GitPullRequest,
  Calendar,
  MoreVertical,
  AlignLeft,
  Columns3,
  GanttChartSquare,
  Users,
  Tag,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

// ─── Tipos Exportados ─────────────────────────────────────────────────────────

export type TaskStatus   = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low_priority" | "medium_priority" | "high_priority" | "critical_priority";
export type ViewMode     = "kanban" | "list" | "timeline";

export type Task = {
  id: string;
  name: string;
  description: string;
  project?: string;
  projectCode?: string;
  assignee: string;
  assigneeInitials: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  start_date: string;
};

// ─── Configs ─────────────────────────────────────────────────────────────────

const priorityConfig: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  low_priority:      { label: "Baixa",   dot: "bg-green-400",  badge: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"   },
  medium_priority:   { label: "Média",   dot: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" },
  high_priority:     { label: "Alta",    dot: "bg-red-400",    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"       },
  critical_priority: { label: "Crítica", dot: "bg-purple-400", badge: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" },
};

const columns: {
  id: TaskStatus;
  label: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
  border: string;
  bar: string;
}[] = [
  { id: "todo",        label: "Por Fazer",     icon: <Circle size={12} />,         accent: "text-gray-500 dark:text-gray-400",    bg: "bg-gray-100 dark:bg-gray-800",    border: "border-gray-200 dark:border-gray-700",    bar: "bg-gray-400 dark:bg-gray-500"    },
  { id: "in_progress", label: "Em Progresso",  icon: <Clock size={12} />,          accent: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-500/20", border: "border-amber-200 dark:border-amber-500/30", bar: "bg-amber-400"   },
  { id: "review",      label: "Revisão",       icon: <GitPullRequest size={12} />, accent: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-500/20", border: "border-blue-200 dark:border-blue-500/30", bar: "bg-blue-400"    },
  { id: "done",        label: "Concluído",     icon: <CheckCircle2 size={12} />,   accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20", border: "border-emerald-200 dark:border-emerald-500/30", bar: "bg-emerald-500" },
];

const avatarColors: Record<string, string> = {
  JS: "bg-violet-200 text-violet-700 dark:bg-violet-500/30 dark:text-violet-300",
  MS: "bg-pink-200 text-pink-700 dark:bg-pink-500/30 dark:text-pink-300",
  CP: "bg-sky-200 text-sky-700 dark:bg-sky-500/30 dark:text-sky-300",
  PR: "bg-orange-200 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300",
  SM: "bg-teal-200 text-teal-700 dark:bg-teal-500/30 dark:text-teal-300",
  AC: "bg-rose-200 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300",
  LF: "bg-indigo-200 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300",
  RM: "bg-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-500/30 dark:text-fuchsia-300",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", timeZone: "UTC" });
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("pt-MZ", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

function isOverdue(iso: string, status: TaskStatus): boolean {
  if (typeof window === 'undefined') return false;
  const now = new Date();
  const due = new Date(iso + "T00:00:00Z");
  return due < now && status !== "done";
}

// ─── Componentes Auxiliares ─────────────────────────────────────────────────

function Avatar({ initials, size = "sm" }: { initials: string; size?: "xs" | "sm" | "lg" }) {
  const color = avatarColors[initials] ?? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  const dim =
    size === "lg" ? "w-9 h-9 text-sm"
    : size === "xs" ? "w-5 h-5 text-[8px]"
    : "w-6 h-6 text-[10px]";
  return (
    <span className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0 ${color}`}>
      {initials}
    </span>
  );
}

// ─── Painel de Detalhes ───────────────────────────────────────────────────────

function TaskDetailPanel({
  task,
  onClose,
  onEdit,
  onDelete,
  projectContext,
}: {
  task: Task;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  projectContext?: { code: string; name: string };
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const priority = priorityConfig[task.priority];
  const col      = columns.find((c) => c.id === task.status)!;
  const overdue  = isClient && isOverdue(task.due_date, task.status);
  const projCode = projectContext?.code || task.projectCode || "PM";
  const projName = projectContext?.name || task.project    || "Geral";

  const dueFormatted = formatDateLong(task.due_date);
  const startFormatted = formatDateLong(task.start_date);

  return (
    <>
      <div className="fixed inset-0 bg-black/15 dark:bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-[#1a1a1a] z-50 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-white/10">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-gray-400 dark:text-gray-500 mb-1">{projCode}</p>
            <h3 className="text-base font-bold text-gray-800 dark:text-white leading-snug">{task.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:hover:text-white dark:hover:bg-white/10 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${col.bg} ${col.accent}`}>
              {col.icon}{col.label}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priority.badge}`}>
              {priority.label}
            </span>
          </div>

          {task.description && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Descrição</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          <div className="h-px bg-gray-200 dark:bg-white/10" />

          <div className="space-y-3.5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Detalhes</p>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Users size={13} className="text-gray-400 dark:text-gray-500" />Responsável
              </span>
              <div className="flex items-center gap-2">
                <Avatar initials={task.assigneeInitials} />
                <span className="text-sm text-gray-800 dark:text-white font-medium">{task.assignee}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Tag size={13} className="text-gray-400 dark:text-gray-500" />Projecto
              </span>
              <span className="text-sm text-gray-800 dark:text-white font-medium">{projName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={13} className="text-gray-400 dark:text-gray-500" />Início
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{startFormatted}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <ArrowRight size={13} className="text-gray-400 dark:text-gray-500" />Prazo
              </span>
              <span className={`text-sm font-medium ${overdue ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
                {dueFormatted}
                {overdue && (
                  <span className="ml-1.5 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full dark:bg-red-500/20 dark:text-red-400">
                    Atrasada
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-white/10 flex gap-2">
          {onEdit && (
            <button
              onClick={() => { onClose(); onEdit(task); }}
              className="flex-1 h-9 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => { onClose(); onDelete(task); }}
              className="flex-1 h-9 rounded-xl border border-red-200 dark:border-red-500/30 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({
  task,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onClick: (task: Task) => void;
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const priority = priorityConfig[task.priority];
  const overdue  = isClient && isOverdue(task.due_date, task.status);
  const dueLabel = formatDate(task.due_date);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 transition-all duration-150 group space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-white leading-snug flex-1">{task.name}</p>
        <button
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 mt-0.5"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Avatar initials={task.assigneeInitials} size="xs" />
          <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
            <Calendar size={10} />
            {dueLabel}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.badge}`}>
          {priority.label}
        </span>
      </div>
    </div>
  );
}

// ─── Vista: Kanban ────────────────────────────────────────────────────────────

function KanbanView({
  tasks,
  onMove,
  onSelect,
}: {
  tasks: Task[];
  onMove: (id: string, to: TaskStatus) => void;
  onSelect: (task: Task) => void;
}) {
  const draggingId = useRef<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    draggingId.current = null;
    setDragOverCol(null);
  };

  const handleDrop = (col: TaskStatus) => {
    const taskId = draggingId.current;
    if (taskId) onMove(taskId, col);
    draggingId.current = null;
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverCol(col.id); }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null);
            }}
            onDrop={(e) => { e.preventDefault(); handleDrop(col.id); }}
            className={`bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-3xl p-4 flex flex-col gap-3 min-h-48 transition-all duration-150
              ${dragOverCol === col.id ? "ring-2 ring-[#CC1F1F]/30 border-[#CC1F1F]/20" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              <span className={`${col.accent} ${col.bg} p-1.5 rounded-lg`}>{col.icon}</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
              <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-md ${col.bg} ${col.accent}`}>
                {colTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {colTasks.map((task) => (
                <KanbanCard key={task.id} task={task} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onClick={onSelect} />
              ))}
              {colTasks.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Sem tarefas</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Linha de Tarefa (Lista) ──────────────────────────────────────────────────

function TaskRow({
  task,
  onSelect,
  showProjectCode = true,
}: {
  task: Task;
  onSelect: (task: Task) => void;
  showProjectCode?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const priority = priorityConfig[task.priority];
  const overdue  = isClient && isOverdue(task.due_date, task.status);
  const dueLabel = formatDate(task.due_date);

  return (
    <div
      onClick={() => onSelect(task)}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl group cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-100"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />

      <span className={`flex-1 text-sm text-gray-700 dark:text-gray-300 truncate ${task.status === "done" ? "line-through text-gray-400 dark:text-gray-500" : ""}`}>
        {task.name}
      </span>

      {showProjectCode && task.projectCode && (
        <span className="hidden md:inline text-xs text-gray-400 dark:text-gray-500 font-mono shrink-0 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
          {task.projectCode}
        </span>
      )}

      <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline ${priority.badge}`}>
        {priority.label}
      </span>

      <Avatar initials={task.assigneeInitials} size="xs" />

      <span className={`hidden sm:flex items-center gap-1 text-xs shrink-0 ${overdue ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
        <Calendar size={11} />
        {dueLabel}
      </span>

      <button
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-all shrink-0"
      >
        <MoreVertical size={13} />
      </button>
    </div>
  );
}

// ─── Vista: Lista ─────────────────────────────────────────────────────────────

function ListView({
  tasks,
  onSelect,
  showProjectCode = true,
}: {
  tasks: Task[];
  onSelect: (task: Task) => void;
  showProjectCode?: boolean;
}) {
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>({
    todo: false, in_progress: false, review: false, done: false,
  });

  const toggle = (col: TaskStatus) =>
    setCollapsed((prev) => ({ ...prev, [col]: !prev[col] }));

  return (
    <div className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-3xl p-4 space-y-1">
      <div className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <span className="w-3" />
        <span className="flex-1">Tarefa</span>
        {showProjectCode && <span className="hidden md:block w-16 text-right">Projecto</span>}
        <span className="hidden sm:block w-16">Prioridade</span>
        <span className="w-5" />
        <span className="hidden sm:block w-20 text-right">Prazo</span>
        <span className="w-5" />
      </div>

      <div className="h-px bg-gray-200 dark:bg-white/10 mx-2 mb-2" />

      {columns.map((col) => {
        const colTasks    = tasks.filter((t) => t.status === col.id);
        const isCollapsed = collapsed[col.id];

        return (
          <div key={col.id}>
            <button
              onClick={() => toggle(col.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight
                size={13}
                className={`text-gray-400 dark:text-gray-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
              />
              <span className={`${col.accent} ${col.bg} p-0.5 rounded-md`}>{col.icon}</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{col.label}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${col.bg} ${col.accent}`}>
                {colTasks.length}
              </span>
            </button>

            {!isCollapsed && (
              <div className="flex flex-col gap-0.5 pl-2 mt-0.5">
                {colTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onSelect={onSelect} showProjectCode={showProjectCode} />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 px-8 py-3">Sem tarefas neste estado</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Vista: Timeline ──────────────────────────────────────────────────────────

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const COL_W = 28;

function TimelineView({ tasks, onSelect }: { tasks: Task[]; onSelect: (task: Task) => void }) {
  const [refDate, setRefDate] = useState<Date | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setRefDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  if (!refDate || !today) {
    return <div className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-3xl p-4 text-gray-500 dark:text-gray-400">Carregando...</div>;
  }

  const year        = refDate.getFullYear();
  const month       = refDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days        = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayDay    = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : null;

  const getBar = (task: Task) => {
    const startD     = new Date(task.start_date + "T00:00:00Z");
    const endD       = new Date(task.due_date   + "T00:00:00Z");
    const monthStart = new Date(year, month, 1);
    const monthEnd   = new Date(year, month, daysInMonth);
    if (endD < monthStart || startD > monthEnd) return null;
    const cs    = startD < monthStart ? monthStart : startD;
    const ce    = endD   > monthEnd   ? monthEnd   : endD;
    const left  = (cs.getDate() - 1) * COL_W;
    const width = Math.max((ce.getDate() - cs.getDate() + 1) * COL_W, COL_W);
    return { left, width };
  };

  return (
    <div className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-3xl p-4 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800 dark:text-white">{MONTHS_PT[month]} {year}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRefDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setRefDate(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition"
          >
            Hoje
          </button>
          <button
            onClick={() => setRefDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <div style={{ minWidth: daysInMonth * COL_W + 220 }}>
          <div className="flex border-b border-gray-200 dark:border-white/10">
            <div className="w-52 shrink-0" />
            <div className="flex">
              {days.map((d) => {
                const isWeekend = new Date(year, month, d).getDay() === 0 || new Date(year, month, d).getDay() === 6;
                return (
                  <div
                    key={d}
                    style={{ width: COL_W }}
                    className={`text-center text-[10px] py-1.5 font-medium border-r border-gray-200 dark:border-white/10 shrink-0
                      ${d === todayDay
                        ? "text-[#CC1F1F] font-bold bg-red-50 dark:bg-red-500/10"
                        : isWeekend
                        ? "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-white/5"
                        : "text-gray-400 dark:text-gray-500"
                      }`}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col">
            {tasks.map((task) => {
              const bar      = getBar(task);
              const col      = columns.find((c) => c.id === task.status)!;
              const priority = priorityConfig[task.priority];

              return (
                <div
                  key={task.id}
                  onClick={() => onSelect(task)}
                  className="flex items-center group hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/5 last:border-0 transition-colors cursor-pointer"
                >
                  <div className="w-52 shrink-0 flex items-center gap-2 px-3 py-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />
                    <span className={`text-xs text-gray-700 dark:text-gray-300 truncate flex-1 ${task.status === "done" ? "line-through text-gray-400 dark:text-gray-500" : ""}`}>
                      {task.name}
                    </span>
                    <Avatar initials={task.assigneeInitials} size="xs" />
                  </div>

                  <div className="flex-1 relative" style={{ height: 36 }}>
                    <div className="absolute inset-0 flex">
                      {days.map((d) => {
                        const isWeekend = new Date(year, month, d).getDay() === 0 || new Date(year, month, d).getDay() === 6;
                        return (
                          <div
                            key={d}
                            style={{ width: COL_W }}
                            className={`h-full border-r border-gray-100 dark:border-white/5 shrink-0 ${
                              d === todayDay
                                ? "border-[#CC1F1F]/20 bg-red-50/60 dark:bg-red-500/5"
                                : isWeekend
                                ? "bg-gray-50 dark:bg-white/5"
                                : ""
                            }`}
                          />
                        );
                      })}
                    </div>

                    {bar && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full ${col.bar} flex items-center px-2 overflow-hidden`}
                        style={{ left: bar.left, width: bar.width }}
                        title={`${task.name} · ${task.start_date} → ${task.due_date}`}
                      >
                        <span className="text-[10px] font-semibold text-white truncate leading-none">
                          {bar.width > 60 ? task.name : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">Nenhuma tarefa encontrada</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-gray-200 dark:border-white/10">
        {columns.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className={`w-3 h-1.5 rounded-full ${c.bar}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── TaskManager ──────────────────────────────────────────────────────────────

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange?: (tasks: Task[]) => void;
  projectContext?: { code: string; name: string };
  showProjectCodeInList?: boolean;
  searchFilterFields?: ("name" | "project" | "assignee")[];
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export function TaskManager({
  tasks,
  onTasksChange,
  projectContext,
  showProjectCodeInList = true,
  searchFilterFields = ["name", "project", "assignee"],
  onStatusChange,
  onEditTask,
  onDeleteTask,
}: TaskManagerProps) {
  const [view, setView]                 = useState<ViewMode>("kanban");
  const [search, setSearch]             = useState("");
  const [priorityFilter, setPriority]   = useState<TaskPriority | "all">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) setView("list");
  }, []);

  const filtered = tasks.filter((t) => {
    const matchSearch =
      (searchFilterFields.includes("name")     && t.name.toLowerCase().includes(search.toLowerCase()))     ||
      (searchFilterFields.includes("project")  && t.project?.toLowerCase().includes(search.toLowerCase())) ||
      (searchFilterFields.includes("assignee") && t.assignee.toLowerCase().includes(search.toLowerCase()));
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const handleMove = (id: string, to: TaskStatus) => {
    const movedTask = tasks.find((t) => t.id === id);
    if (!movedTask || movedTask.status === to) return;
    const updated = tasks.map((t) => (t.id === id ? { ...t, status: to } : t));
    onTasksChange?.(updated);
    onStatusChange?.(movedTask, to);
  };

  const views: { id: ViewMode; label: string; icon: React.ReactNode; mobileHidden?: boolean }[] = [
    { id: "kanban",   label: "Kanban",   icon: <Columns3 size={13} />        },
    { id: "list",     label: "Lista",    icon: <AlignLeft size={13} />       },
    { id: "timeline", label: "Timeline", icon: <GanttChartSquare size={13} />, mobileHidden: true },
  ];

  return (
    <div className="space-y-6">
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          projectContext={projectContext}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-1 gap-1 w-fit">
          {views.map(({ id, label, icon, mobileHidden }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`${mobileHidden ? "hidden sm:flex" : "flex"} items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                view === id
                  ? "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-8 pr-7 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#CC1F1F]/20 focus:border-transparent transition w-44"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={11} />
              </button>
            )}
          </div>

          <div className="relative">
            <Flag size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriority(e.target.value as TaskPriority | "all")}
              className="appearance-none bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl pl-8 pr-7 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#CC1F1F]/20 focus:border-transparent cursor-pointer transition"
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
              onClick={() => { setSearch(""); setPriority("all"); }}
              className="flex items-center gap-1 text-sm text-[#CC1F1F] hover:text-[#aa1818] font-medium"
            >
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      </div>

      {view === "kanban"   && <KanbanView   tasks={filtered} onMove={handleMove} onSelect={setSelectedTask} />}
      {view === "list"     && <ListView     tasks={filtered} onSelect={setSelectedTask} showProjectCode={showProjectCodeInList} />}
      {view === "timeline" && <TimelineView tasks={filtered} onSelect={setSelectedTask} />}
    </div>
  );
}