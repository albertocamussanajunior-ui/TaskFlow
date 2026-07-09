"use client";

import {
  Bell,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/manager/dashboard" },
  { icon: <FolderKanban size={20} />, label: "Projectos", href: "/manager/projects" },
  { icon: <ListTodo size={20} />, label: "Tarefas", href: "/manager/tasks" },
  { icon: <Calendar size={20} />, label: "Calendário", href: "/manager/calendar" },
  { icon: <ClipboardList size={20} />, label: "Minhas Tarefas", href: "/manager/mytasks" },
  { icon: <Users size={20} />, label: "Equipe", href: "/manager/team" },
  { icon: <Bell size={20} />, label: "Notificações", href: "/manager/notifications" },
];

const bottomItems = [
  { icon: <LogOut size={20} />, label: "Sair", href: "/" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { setAuthenticated } = useAppStore();

  const itemClassName = (href: string) => {
    const active = pathname === href;
    return `
      flex items-center gap-3 rounded-full w-full h-10 px-[10px]
      transition-colors duration-150 group
      ${
        active
          ? "bg-black/90 dark:bg-white/10 text-white"
          : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
      }
    `;
  };

  return (
    <div
      suppressHydrationWarning
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`
        h-screen hidden md:flex flex-col justify-between items-center
        bg-white dark:bg-black/50 rounded-[28px] py-3 mx-2 my-2 shrink-0
        transition-all duration-300 ease-in-out overflow-hidden
        ${open ? "w-52 px-3" : "w-14 px-2"}
      `}
    >
      <div className="flex items-center gap-3 rounded-full bg-black/90 dark:bg-white h-10 px-2.5 w-full overflow-hidden shrink-0">
        <span
          className={`
            text-white dark:text-black font-bold text-sm whitespace-nowrap overflow-hidden
            transition-all duration-300
            ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
          `}
        >
          CYBERCORE
        </span>
      </div>

      <nav className="flex flex-col items-center gap-2 w-full">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={itemClassName(item.href)}>
            <span className="shrink-0">{item.icon}</span>
            <span
              className={`
                text-sm whitespace-nowrap overflow-hidden
                transition-all duration-300
                ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
              `}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2 w-full">
        {bottomItems.map((item) =>
          item.label === "Sair" ? (
            <button
              key={item.href}
              onClick={() => {
                setAuthenticated(false);
                router.push("/");
              }}
              className={itemClassName(item.href)}
            >
              <span className="shrink-0">{item.icon}</span>
              <span
                className={`
                  text-sm whitespace-nowrap overflow-hidden
                  transition-all duration-300
                  ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
                `}
              >
                {item.label}
              </span>
            </button>
          ) : (
            <Link key={item.href} href={item.href} className={itemClassName(item.href)}>
              <span className="shrink-0">{item.icon}</span>
              <span
                className={`
                  text-sm whitespace-nowrap overflow-hidden
                  transition-all duration-300
                  ${open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"}
                `}
              >
                {item.label}
              </span>
            </Link>
          )
        )}
      </div>
    </div>
  );
}