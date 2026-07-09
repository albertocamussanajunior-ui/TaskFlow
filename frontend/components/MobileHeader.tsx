"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useNotifications } from "@/lib/notifications";
import { useTheme } from "@/lib/theme";

const pageTitles: Record<string, string> = {
  "/manager/dashboard": "Dashboard",
  "/manager/projects": "Projectos",
  "/manager/calendar": "Calendário",
  "/manager/mytasks": "Minhas Tarefas",
  "/manager/team": "Equipa",
  "/manager/tasks": "Tarefas",
  "/manager/notifications": "Notificações",
  "/manager/settings": "Definições",
  "/manager/profile": "Perfil",
  "/manager/help": "Ajuda",
};

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { projects } = useAppStore();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const projectDetailMatch = pathname.match(/^\/manager\/projects\/([^/]+)$/);
  const projectTitle = projectDetailMatch
    ? (projects.find((p) => p.id === projectDetailMatch[1])?.name ?? "Projecto")
    : null;
  const title = projectTitle ?? pageTitles[pathname] ?? "CyberCore";

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 bg-white dark:bg-[#0f0f0f] px-4 border-b border-gray-100 dark:border-white/10 shrink-0">
      <span className="text-base font-bold text-gray-900 dark:text-white truncate">{title}</span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={() => router.push("/manager/notifications")}
          aria-label="Notificações"
          className="relative flex items-center justify-center w-9 h-9 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#CC1F1F] text-[#fff] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
