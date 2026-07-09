"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, LogOut, HelpCircle, CheckCircle2, Clock, AlertCircle, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useNotifications } from "@/lib/notifications";

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

const userMenuItems = [
  { icon: <User size={16} />, label: "Perfil", href: "/manager/profile" },
  { icon: <HelpCircle size={16} />, label: "Ajuda", href: "/manager/help" },
  { icon: <LogOut size={16} />, label: "Sair", href: "/logout", danger: true },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setAuthenticated, projects } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const projectDetailMatch = pathname.match(/^\/manager\/projects\/([^/]+)$/);
  const projectTitle = projectDetailMatch
    ? (projects.find((p) => p.id === projectDetailMatch[1])?.name ?? "Projecto")
    : null;
  const title = projectTitle ?? pageTitles[pathname] ?? "Manager";
  const displayName = currentUser?.name ?? currentUser?.email ?? "Utilizador";
  const displayEmail = currentUser?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "project":
        return <Clock size={16} className="text-blue-500" />;
      case "meeting":
        return <AlertCircle size={16} className="text-amber-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const logout = () => {
    setAuthenticated(false);
    router.push("/");
  };

  return (
    <div className="hidden md:flex items-center justify-between h-14 bg-white dark:bg-black/50 rounded-l-full rounded-r-full p-2 m-2 pl-6 relative">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        {title}
      </h1>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 w-10 h-10 transition-colors"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-white" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>

        {/* Notificações */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 w-10 h-10 p-1 transition-colors"
          >
            <Bell size={20} className="text-gray-600 dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#CC1F1F] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <span className="text-sm font-semibold text-gray-800 dark:text-white">Notificações</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#CC1F1F] hover:text-[#aa1818] font-medium transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell size={32} className="mx-auto text-gray-200 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">Sem notificações</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        !notif.read ? "bg-[#CC1F1F]/5 dark:bg-[#CC1F1F]/10 border-l-2 border-[#CC1F1F]" : ""
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {notif.description}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {notif.time}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CC1F1F] shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/10 px-4 py-2 text-center">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      router.push("/manager/notifications");
                    }}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Ver todas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu do Usuário */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center justify-center rounded-l-full rounded-r-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 p-1 gap-2 transition-colors"
          >
            <div className="rounded-full bg-black/90 dark:bg-white/10 w-8 h-8 flex items-center justify-center text-white dark:text-white text-xs font-bold">
              {initials}
            </div>
            <h4 className="text-xs font-medium text-gray-700 dark:text-white">{displayName}</h4>
            <ChevronDown
              size={20}
              className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{displayName}</p>
                <p className="text-xs text-gray-400">{displayEmail}</p>
                {currentUser?.role && (
                  <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full capitalize">
                    {currentUser.role}
                  </span>
                )}
              </div>

              <div className="py-1">
                {userMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.danger ? logout : () => router.push(item.href)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors w-full text-left ${
                      item.danger
                        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
