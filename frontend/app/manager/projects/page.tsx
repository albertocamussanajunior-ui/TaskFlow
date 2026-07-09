"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Plus,
  Search,
  SearchX,
  Users,
  X,
} from "lucide-react";
import { useAppStore, type Project } from "@/lib/store";
import { formatDate, initials, memberName, projectCode } from "@/lib/ui";
import { MemberSelector } from "@/components/MemberSelector";

type ProjectStatus = Project["status"];

// ─── Configs ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  ProjectStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  active: {
    label: "Activo",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/20",
  },
  paused: {
    label: "Pausado",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/20",
  },
  completed: {
    label: "Concluído",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/20",
  },
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 50) return "bg-amber-500";
  if (progress >= 30) return "bg-orange-500";
  return "bg-red-500";
};

const STATUS_FILTERS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Activo", value: "active" },
  { label: "Pausado", value: "paused" },
  { label: "Concluído", value: "completed" },
];

// ─── Modal de novo projecto ───────────────────────────────────────────────────

function ProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject, teamMembers } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    const rawDue = String(form.get("due_date") ?? "");
    const dueISO = rawDue ? `${rawDue}T00:00:00Z` : "";
    const startISO = new Date().toISOString();

    await addProject({
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
      responsible: String(form.get("responsible") ?? ""),
      start_date: startISO,
      due_date: dueISO,
      members: selectedMembers,
    });

    setIsSubmitting(false);
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,540px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Novo Projecto
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              Preencha os dados para criar o projecto.
            </p>
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
          <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Nome do Projecto <span className="text-[#CC1F1F]">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="ex. Sistema de Monitoramento AMA1"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Descrição
              </label>
              <textarea
                name="description"
                placeholder="Descreva o âmbito e objectivos do projecto..."
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                  Prazo
                </label>
                <div className="relative">
                  <Calendar
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none dark:text-gray-500"
                  />
                  <input
                    name="due_date"
                    type="date"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                  Responsável
                </label>
                <div className="relative">
                  <select
                    name="responsible"
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent cursor-pointer transition dark:border-white/10 dark:bg-black/90 dark:text-gray-300"
                  >
                    <option value="">Seleccionar...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                </div>
              </div>
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
              form="project-form"
              disabled={isSubmitting}
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-black/90 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-60 transition-colors dark:bg-white/10 dark:hover:bg-white/20"
            >
              <Plus size={14} />
              {isSubmitting ? "A criar..." : "Criar Projecto"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Card de projecto ─────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const { teamMembers } = useAppStore();
  const status = statusConfig[project.status];
  const responsible =
    memberName(teamMembers, project.lead) || "Sem responsável";
  const isOverdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    project.status !== "completed";
  const progColor = getProgressColor(project.progress);

  return (
    <button
      onClick={() => router.push(`/manager/projects/${project.id}`)}
      className="group cursor-pointer text-left w-full rounded-2xl border border-gray-200 bg-white p-5 space-y-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-black/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-400 dark:bg-white/10 dark:text-gray-500">
              {projectCode(project)}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-800 transition-colors group-hover:text-black/90 dark:text-white dark:group-hover:text-white/90">
            {project.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">
            {initials(responsible)}
          </span>
          <span className="text-xs font-medium text-gray-600 truncate max-w-32 dark:text-gray-400">
            {responsible}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Users size={12} />
          {project.members.length} membros
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Calendar size={11} />
        <span>{formatDate(project.startDate)}</span>
        <ArrowRight size={10} />
        <span className={isOverdue ? "font-medium text-red-400" : ""}>
          {formatDate(project.dueDate)}
        </span>
        {isOverdue && (
          <span className="ml-1 text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-medium dark:bg-red-500/20 dark:text-red-400">
            Atrasado
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 dark:text-gray-500">Progresso</span>
          <span className="font-bold text-gray-700 dark:text-white">
            {project.progress}%
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${progColor}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </button>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { projects, isLoading } = useAppStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState<ProjectStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = projects.filter((project) => {
    const q = search.toLowerCase();
    const matchSearch =
      project.name.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q) ||
      projectCode(project).toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {isModalOpen && <ProjectModal onClose={() => setIsModalOpen(false)} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Pesquisar por nome, código ou descrição..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-8 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-black/20 focus:border-transparent dark:border-white/10 dark:bg-black/50 dark:text-white dark:placeholder:text-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={11} />
            </button>
          )}
        </div>

        <div className="flex gap-2 sm:contents">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value as ProjectStatus | "all")}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-8 text-sm text-gray-600 outline-none transition focus:ring-2 focus:ring-black/20 focus:border-transparent dark:border-white/10 dark:bg-black/50 dark:text-gray-300"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-black/90 hover:bg-black/80 px-4 py-2.5 text-sm font-medium text-white transition-colors dark:bg-white/10 dark:hover:bg-white/20"
          >
            <Plus size={14} />
            <span className="sm:inline">Novo Projecto</span>
          </button>
        </div>
      </div>

      <p className="px-1 text-sm text-gray-400 dark:text-gray-500">
        {isLoading && filtered.length === 0
          ? "A carregar projectos..."
          : `${filtered.length} projecto${filtered.length === 1 ? "" : "s"}`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-gray-200 py-16 text-center dark:bg-black/50 dark:border-white/10">
          <SearchX
            size={40}
            className="mx-auto mb-3 text-gray-200 dark:text-gray-600"
          />
          <p className="font-medium text-gray-500 dark:text-gray-400">
            Nenhum projecto encontrado
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Tente ajustar os filtros ou criar um novo projecto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
