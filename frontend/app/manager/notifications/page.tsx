"use client";

import { useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Clock, Filter } from "lucide-react";
import { useNotifications, type NotificationType } from "@/lib/notifications";

const typeConfig: Record<NotificationType, { label: string; icon: React.ReactNode }> = {
  task: { label: "Tarefa", icon: <CheckCircle2 size={16} className="text-emerald-500" /> },
  project: { label: "Projecto", icon: <Clock size={16} className="text-blue-500" /> },
  meeting: { label: "Reunião", icon: <AlertCircle size={16} className="text-amber-500" /> },
};

type FilterType = "all" | "unread" | NotificationType;

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center justify-between">
        <p className="px-1 text-xs text-gray-400 dark:text-gray-500">
          {unreadCount > 0 ? `${unreadCount} por ler` : "Todas lidas"}
        </p>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-[#CC1F1F] hover:text-[#aa1818] font-medium transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-gray-400 dark:text-gray-500 shrink-0" />
        {(["all", "unread", "task", "project", "meeting"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-black/90 text-white dark:bg-white/10 dark:text-white"
                : "bg-white text-gray-500 hover:text-black dark:bg-black/50 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {f === "all" && "Todas"}
            {f === "unread" && "Por ler"}
            {f === "task" && "Tarefas"}
            {f === "project" && "Projectos"}
            {f === "meeting" && "Reuniões"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="rounded-2xl bg-white dark:bg-black/50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Bell size={32} className="text-gray-200 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Sem notificações</p>
          </div>
        ) : (
          filtered.map((notif, idx) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                !notif.read
                  ? "bg-[#CC1F1F]/5 dark:bg-[#CC1F1F]/10 border-l-2 border-[#CC1F1F]"
                  : "border-l-2 border-transparent"
              } ${idx !== 0 ? "border-t border-gray-100 dark:border-white/5" : ""}`}
            >
              <div className="shrink-0 mt-0.5">
                {typeConfig[notif.type]?.icon ?? <Bell size={16} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {notif.description}
                </p>
                <span className="mt-1.5 inline-flex rounded-full bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {typeConfig[notif.type]?.label}
                </span>
              </div>
              {!notif.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#CC1F1F] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
