"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Loader2,
  Mail,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useAppStore, type TeamMember } from "@/lib/store";
import { initials } from "@/lib/ui";

const statusConfig = {
  active: { label: "Activo", dot: "bg-emerald-400" },
  away: { label: "Ausente", dot: "bg-amber-400" },
  offline: { label: "Offline", dot: "bg-gray-300" },
};

interface MemberCardProps {
  member: TeamMember;
  done: number;
  inProgress: number;
  todo: number;
  total: number;
}

function MemberCard({ member, done, inProgress, todo, total }: MemberCardProps) {
  const status = statusConfig[member.status];
  const roleLabel = member.role || "Utilizador";
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="group flex flex-col gap-4 rounded-2xl bg-white p-5 transition-all duration-200 hover:shadow-md dark:bg-black/50 dark:hover:bg-black/60">
      <div className="flex items-start gap-3">
        <div className="relative">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/90 text-lg font-bold text-white dark:bg-white/10">
            {initials(member.name)}
          </span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#FCFDF5] dark:border-black/50 ${status.dot}`}
            title={status.label}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-800 dark:text-white">
            {member.name}
          </p>
          <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
            {roleLabel}
          </span>
        </div>
      </div>

      <label
        className="flex items-center gap-2 truncate text-xs text-black transition-colors hover:text-[#CC1F1F] dark:text-gray-300 dark:hover:text-[#CC1F1F]"
      >
        <Mail size={12} className="shrink-0" />
        <span className="truncate">{member.email}</span>
      </label>

      <div className="h-px bg-gray-100 dark:bg-white/5" />
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-black dark:text-gray-300">
            Progresso
          </span>
          <span className="text-xs font-bold text-black dark:text-white">
            {pct}%{" "}
            <span className="font-normal text-gray-400">({done}/{total})</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex w-full justify-between gap-1">
          <div className="flex items-center gap-1 text-xs text-black dark:text-gray-300">
            <CheckCircle2 size={11} className="shrink-0 text-emerald-500" />
            <span>{done}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-black dark:text-gray-300">
            <Clock size={11} className="shrink-0 text-amber-500" />
            <span>{inProgress}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-black dark:text-gray-300">
            <Circle size={11} className="shrink-0 text-gray-300 dark:text-gray-600" />
            <span>{todo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { teamMembers, projects, isLoading, addUser } = useAppStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    TeamMember["status"] | "all"
  >("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "member",
    password: "",
  });

  const allTasks = projects.flatMap((project) => project.tasks);

  const members = teamMembers.map((member) => {
    const memberTasks = allTasks.filter((task) => task.assignee === member.id);
    const done = memberTasks.filter((task) => task.status === "done").length;
    const inProgress = memberTasks.filter(
      (task) => task.status === "in_progress" || task.status === "review",
    ).length;
    const todo = memberTasks.filter((task) => task.status === "todo").length;
    return { ...member, done, inProgress, todo, total: memberTasks.length };
  });

  const filtered = members.filter((member) => {
    const query = search.toLowerCase();
    const matchSearch =
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query);
    const matchStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setForm({ fullName: "", email: "", role: "member", password: "" });
    setFormError("");
  };

  const closeCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateOpen(false);
    resetForm();
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Preencha nome, email e senha.");
      return;
    }

    if (form.password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    const created = await addUser({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      password: form.password,
      status: "active",
    });
    setIsSubmitting(false);

    if (!created) {
      setFormError("Não foi possível criar o utilizador.");
      return;
    }

    setIsCreateOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="px-1 text-xs text-gray-400 dark:text-gray-500">
          {isLoading && filtered.length === 0
            ? "A carregar equipa..."
            : `${filtered.length} membros encontrados`}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CC1F1F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a81818] focus:outline-none focus:ring-2 focus:ring-[#CC1F1F]/30"
          >
            <Plus size={14} />
            Novo utilizador
          </button>
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar membro..."
              className="w-full rounded-xl bg-white py-2 pl-8 pr-7 text-sm text-black outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#CC1F1F]/20 dark:bg-black/50 dark:text-white dark:placeholder:text-gray-500"
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
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as TeamMember["status"] | "all",
                )
              }
              className="cursor-pointer appearance-none rounded-xl bg-white py-2 pl-4 pr-8 text-sm text-gray-600 outline-none transition focus:ring-2 focus:ring-[#CC1F1F]/20 dark:bg-black/50 dark:text-gray-300"
            >
              <option value="all">Todos</option>
              <option value="active">Activo</option>
              <option value="away">Ausente</option>
              <option value="offline">Offline</option>
            </select>
            <ChevronDown
              size={11}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-[#101010]"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">
                  Criar utilizador
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  O novo membro fica activo assim que for criado.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Nome completo
                </span>
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#CC1F1F]/20 dark:bg-black/50 dark:text-white"
                  placeholder="Ex.: Maria Silva"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#CC1F1F]/20 dark:bg-black/50 dark:text-white"
                  placeholder="nome@empresa.com"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Perfil
                  </span>
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, role: event.target.value }))
                    }
                    className="mt-1 w-full cursor-pointer rounded-xl bg-gray-100 px-3 py-2 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#CC1F1F]/20 dark:bg-black/50 dark:text-white"
                  >
                    <option value="member">Membro</option>
                    <option value="manager">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Senha inicial
                  </span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl bg-gray-100 px-3 py-2 text-sm text-black outline-none transition focus:ring-2 focus:ring-[#CC1F1F]/20 dark:bg-black/50 dark:text-white"
                    placeholder="mín. 6 caracteres"
                  />
                </label>
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-[#CC1F1F] dark:bg-[#CC1F1F]/10">
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#CC1F1F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a81818] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-12 dark:bg-black/50">
          <Users className="text-gray-400 dark:text-gray-500" />
          <p className="text-sm font-medium text-black dark:text-white">
            Nenhum membro encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              done={member.done}
              inProgress={member.inProgress}
              todo={member.todo}
              total={member.total}
            />
          ))}
        </div>
      )}
    </div>
  );
}
