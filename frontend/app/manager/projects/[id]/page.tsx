"use client";

import { use, useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ClipboardList,
  Plus,
  TrendingUp,
  Users,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { TaskManager, type TaskStatus, type Task as UiTask } from "@/components/tasks/TaskManager";
import MobileTaskView from "@/components/MobileTaskView";
import { useAppStore, type Project, type Task, type TaskPriority } from "@/lib/store";
import { formatDate, initials, memberName, projectCode, taskToUiTask } from "@/lib/ui";
import { MemberSelector } from "@/components/MemberSelector";

const projectStatusConfig: Record<Project["status"], { label: string; className: string; icon: React.ReactNode }> = {
  active: { 
    label: "Activo", 
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
  },
  paused: { 
    label: "Pausado", 
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
    icon: <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
  },
  completed: { 
    label: "Concluído", 
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
    icon: <CheckCircle2 size={12} className="text-blue-600 dark:text-blue-400" />
  },
};

function getProgressColor(progress: number) {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-500";
  if (progress >= 30) return "bg-orange-500";
  return "bg-red-500";
}

function getProgressLabel(progress: number) {
  if (progress >= 80) return "Quase lá!";
  if (progress >= 50) return "Meio caminho";
  if (progress >= 30) return "Avançando";
  return "Iniciando";
}

function EditProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { editProject, teamMembers } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(project.members);
  const [startDate, setStartDate] = useState(project.startDate ? project.startDate.slice(0, 10) : "");
  const [dueDate, setDueDate] = useState(project.dueDate ? project.dueDate.slice(0, 10) : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    await editProject(project.id, {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      start_date: startDate ? `${startDate}T00:00:00Z` : "",
      due_date: dueDate ? `${dueDate}T00:00:00Z` : "",
      responsible: String(form.get("responsible") ?? ""),
      members: selectedMembers,
    });
    setIsSubmitting(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,540px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Editar Projecto</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Actualiza as informações do projecto.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors dark:text-gray-500 dark:hover:text-white dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Nome do Projecto <span className="text-[#CC1F1F]">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={project.name}
                placeholder="Nome do projecto"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Descrição
              </label>
              <textarea
                name="description"
                defaultValue={project.description}
                placeholder="Descrição do projecto..."
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                  Data de início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                  Prazo
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Responsável
              </label>
              <select
                name="responsible"
                defaultValue={project.lead}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition cursor-pointer dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
              >
                <option value="">Seleccionar...</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Membros da Equipa
              </label>
              <MemberSelector
                teamMembers={teamMembers}
                selectedMembers={selectedMembers}
                onChange={setSelectedMembers}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-white/10 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-project-form"
              disabled={isSubmitting}
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-black/90 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-60 transition-colors dark:bg-white/10 dark:hover:bg-white/20"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  A guardar...
                </>
              ) : (
                "Guardar alterações"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function EditTaskModal({ projectId, task, onClose }: { projectId: string; task: Task; onClose: () => void }) {
  const { editTask, teamMembers } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    await editTask(projectId, task.id, {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      assignee: String(form.get("assignee") ?? ""),
      due_date: dueDate ? `${dueDate}T00:00:00Z` : "",
      priority: String(form.get("priority") ?? "medium_priority") as TaskPriority,
    });
    setIsSubmitting(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white dark:bg-[#1a1a1a] p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Tarefa</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza os dados desta tarefa.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:hover:bg-white/10 dark:hover:text-white">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            required
            defaultValue={task.title}
            placeholder="Nome da tarefa"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
          />
          <textarea
            name="description"
            defaultValue={task.description}
            placeholder="Descrição"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Responsável</label>
              <select
                name="assignee"
                defaultValue={task.assignee}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <option value="">Seleccionar...</option>
                {teamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data limite</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Prioridade</label>
            <select
              name="priority"
              defaultValue={task.priority}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              <option value="low_priority">Baixa</option>
              <option value="medium_priority">Média</option>
              <option value="high_priority">Alta</option>
              <option value="critical_priority">Crítica</option>
            </select>
          </div>
          <button
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black/90 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-60 transition-colors dark:bg-white/10 dark:hover:bg-white/20"
          >
            {isSubmitting ? "A guardar..." : "Guardar alterações"}
          </button>
        </form>
      </div>
    </>
  );
}

function DeleteProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { removeProject } = useAppStore();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await removeProject(project.id);
    router.push("/manager/projects");
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white dark:bg-[#1a1a1a] p-6 shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/20">
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Eliminar Projecto</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Tens a certeza que queres eliminar <span className="font-semibold text-gray-700 dark:text-gray-300">"{project.name}"</span>? Esta acção é irreversível.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 h-10 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isDeleting ? "A eliminar..." : "Eliminar"}
          </button>
        </div>
      </div>
    </>
  );
}

function DeleteTaskModal({ projectId, task, onClose }: { projectId: string; task: Task; onClose: () => void }) {
  const { removeTask } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await removeTask(projectId, task.id);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white dark:bg-[#1a1a1a] p-6 shadow-2xl">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/20">
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Eliminar Tarefa</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Tens a certeza que queres eliminar <span className="font-semibold text-gray-700 dark:text-gray-300">"{task.title}"</span>? Esta acção é irreversível.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 h-10 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isDeleting ? "A eliminar..." : "Eliminar"}
          </button>
        </div>
      </div>
    </>
  );
}

function TaskModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { addTask, teamMembers } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const rawDue = String(form.get("due_date") ?? "");
    const dueISO = rawDue ? `${rawDue}T00:00:00Z` : "";
    
    await addTask(projectId, {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      assignee: String(form.get("assignee") ?? ""),
      due_date: dueISO,
      priority: String(form.get("priority") ?? "medium_priority") as TaskPriority,
      status: "todo",
    });
    setIsSubmitting(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm dark:bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white dark:bg-[#1a1a1a] p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nova Tarefa</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Adicione uma tarefa a este projecto.</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            name="name" 
            required 
            placeholder="Nome da tarefa" 
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500" 
          />
          <textarea 
            name="description" 
            placeholder="Descrição" 
            rows={3} 
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500" 
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Responsável</label>
              <select 
                name="assignee" 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
              >
                <option value="">Seleccionar...</option>
                {teamMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Data limite</label>
              <input 
                name="due_date" 
                required 
                type="date" 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Prioridade</label>
            <select 
              name="priority" 
              defaultValue="medium_priority" 
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              <option value="low_priority">Baixa</option>
              <option value="medium_priority">Média</option>
              <option value="high_priority">Alta</option>
              <option value="critical_priority">Crítica</option>
            </select>
          </div>
          <button 
            disabled={isSubmitting} 
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black/90 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-60 transition-colors dark:bg-white/10 dark:hover:bg-white/20"
          >
            <Plus size={15} />
            {isSubmitting ? "A criar..." : "Criar Tarefa"}
          </button>
        </form>
      </div>
    </>
  );
}

// Componente para exibir informações de data que dependem do cliente
function DueDateInfo({ dueDate, status }: { dueDate: string; status: string }) {
  const [isClient, setIsClient] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const due = new Date(dueDate + "T00:00:00Z");
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setDaysRemaining(days);
    setIsOverdue(days < 0 && status !== "completed");
  }, [dueDate, status]);

  if (!isClient) {
    return (
      <div className="mt-auto">
        <span className="text-sm font-semibold text-gray-800 dark:text-white">
          {formatDate(dueDate)}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-auto">
      <span className="text-sm font-semibold text-gray-800 dark:text-white">
        {formatDate(dueDate)}
      </span>
      {isOverdue ? (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-500 bg-red-50 dark:bg-red-500/20 px-2 py-0.5 rounded-full">
          <AlertCircle size={12} />
          {Math.abs(daysRemaining!)} dias atrasado
        </div>
      ) : daysRemaining !== null && daysRemaining >= 0 && (
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
          <Clock size={12} />
          {daysRemaining === 0 ? "Hoje" : `${daysRemaining} dias restantes`}
        </div>
      )}
    </div>
  );
}

// Componente para informações de tempo no rodapé
function ProjectTimeline({ startDate, dueDate, status }: { startDate: string; dueDate: string; status: string }) {
  const [isClient, setIsClient] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const due = new Date(dueDate + "T00:00:00Z");
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setIsOverdue(days < 0 && status !== "completed");
  }, [dueDate, status]);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
      <Calendar size={13} />
      <span>Início: {formatDate(startDate)}</span>
      <ArrowRight size={12} className="text-gray-300 dark:text-gray-600" />
      <span className={isClient && isOverdue ? "text-red-500 font-medium" : ""}>
        Fim: {formatDate(dueDate)}
      </span>
      {status === "completed" && (
        <span className="ml-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
          Concluído
        </span>
      )}
    </div>
  );
}

export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { projects, teamMembers, editTaskStatus, editProjectStatus, isLoading } = useAppStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const project = projects.find((item) => item.id === id);

  if (!project) {
    return (
      <div className="rounded-3xl bg-white dark:bg-black/50 p-8 text-sm text-gray-500 dark:text-gray-400 shadow-sm">
        {isLoading ? "A carregar projecto..." : "Projecto não encontrado."}
      </div>
    );
  }

  const tasks = project.tasks.map((task) => taskToUiTask(task, projects, teamMembers));
  const done = project.tasks.filter((task) => task.status === "done").length;
  const inProgress = project.tasks.filter((task) => task.status === "in_progress").length;
  const todo = project.tasks.filter((task) => task.status === "todo").length;
  const pStatus = projectStatusConfig[project.status];
  const progColor = getProgressColor(project.progress);
  const progressLabel = getProgressLabel(project.progress);

  const handleStatusChange = (task: (typeof tasks)[number], status: TaskStatus) => {
    void editTaskStatus(project.id, task.id, { status });
  };

  const handleProjectStatusChange = (status: Project["status"]) => {
    void editProjectStatus(project.id, { status });
    setIsStatusOpen(false);
  };

  const handleEditTask = (uiTask: UiTask) => {
    const storeTask = project.tasks.find((t) => t.id === uiTask.id);
    if (storeTask) setEditingTask(storeTask);
  };

  const handleDeleteTask = (uiTask: UiTask) => {
    const storeTask = project.tasks.find((t) => t.id === uiTask.id);
    if (storeTask) setDeletingTask(storeTask);
  };

  return (
    <div className="space-y-6">
      {isTaskModalOpen && <TaskModal projectId={project.id} onClose={() => setIsTaskModalOpen(false)} />}
      {isEditModalOpen && <EditProjectModal project={project} onClose={() => setIsEditModalOpen(false)} />}
      {isDeleteModalOpen && <DeleteProjectModal project={project} onClose={() => setIsDeleteModalOpen(false)} />}
      {editingTask && <EditTaskModal projectId={project.id} task={editingTask} onClose={() => setEditingTask(null)} />}
      {deletingTask && <DeleteTaskModal projectId={project.id} task={deletingTask} onClose={() => setDeletingTask(null)} />}
      
      {/* Card principal do projecto */}
      <div className="w-full rounded-3xl bg-white dark:bg-black/50 p-4 sm:p-6 shadow-sm">
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push("/manager/projects")} 
            className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 transition-colors hover:text-black/90 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            Voltar a Projectos
          </button>
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Status do projecto */}
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${pStatus.className}`}
              >
                {pStatus.icon}
                {pStatus.label}
                <ChevronDown size={12} className={`transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
              </button>
              {isStatusOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsStatusOpen(false)} />
                  <div className="absolute right-0 mt-1 z-40 w-40 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 shadow-xl overflow-hidden">
                    {(["active", "paused", "completed"] as Project["status"][]).map((s) => {
                      const cfg = projectStatusConfig[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleProjectStatusChange(s)}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${project.status === s ? "opacity-50 cursor-default" : ""}`}
                        >
                          {cfg.icon}{cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
            >
              <Pencil size={14} />
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-transparent px-2 sm:px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-black/90 dark:bg-white/10 px-2 sm:px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:hover:bg-white/20"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Título e Status */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                {projectCode(project)}
              </span>
              <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${pStatus.className}`}>
                {pStatus.icon}
                {pStatus.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{project.name}</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {project.description}
            </p>
          </div>
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Progresso */}
          <div className="col-span-2 lg:col-span-1 space-y-2 rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <TrendingUp size={14} />
                Progresso
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-white">{project.progress}%</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progColor}`} 
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{progressLabel}</p>
            </div>
          </div>
          
          {/* Tarefas Totais */}
          <div className="flex flex-col rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <ClipboardList size={14} />
              Tarefas
            </span>
            <div className="mt-auto flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{project.tasks.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">total</span>
            </div>
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {done}
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {inProgress}
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                {todo}
              </span>
            </div>
          </div>
          
          {/* Data Limite */}
          <div className="flex flex-col rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <CalendarDays size={14} />
              Data Limite
            </span>
            <DueDateInfo dueDate={project.dueDate} status={project.status} />
          </div>
          
          {/* Equipa */}
          <div className="col-span-2 sm:col-span-1 flex flex-col rounded-2xl bg-gray-50 dark:bg-white/5 p-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <Users size={14} />
              Equipa
            </span>
            <div className="mt-auto">
              <div className="flex items-center -space-x-1">
                {project.members.slice(0, 4).map((memberId) => (
                  <span 
                    key={memberId} 
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-white/20 text-[10px] font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-black/50"
                    title={memberName(teamMembers, memberId)}
                  >
                    {initials(memberName(teamMembers, memberId))}
                  </span>
                ))}
                {project.members.length > 4 && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 dark:bg-white/20 text-[10px] font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-black/50">
                    +{project.members.length - 4}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {project.members.length} membro{project.members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de tempo */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          <ProjectTimeline 
            startDate={project.startDate} 
            dueDate={project.dueDate} 
            status={project.status} 
          />
        </div>
      </div>

      {/* Task Manager — desktop */}
      <div className="hidden md:block">
        <TaskManager
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          projectContext={{ code: projectCode(project), name: project.name }}
          showProjectCodeInList={false}
          searchFilterFields={["name", "assignee"]}
        />
      </div>

      {/* Mobile task view */}
      <div className="md:hidden">
        <MobileTaskView
          tasks={tasks}
          onStatusChange={handleStatusChange}
          fixedProjectId={project.id}
        />
      </div>
    </div>
  );
}