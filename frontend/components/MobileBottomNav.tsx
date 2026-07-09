"use client";

import { useState } from "react";
import { Calendar, ClipboardList, FolderKanban, ListTodo, LogOut, MoreHorizontal, User, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

const mainItems = [
  { icon: FolderKanban,  label: "Projectos", href: "/manager/projects" },
  { icon: ListTodo,      label: "Tarefas",   href: "/manager/tasks"    },
  { icon: ClipboardList, label: "Minhas",    href: "/manager/mytasks"  },
  { icon: Calendar,      label: "Calendário",href: "/manager/calendar" },
];

const menuItems = [
  { icon: Users, label: "Equipa",  href: "/manager/team"    },
  { icon: User,  label: "Perfil",  href: "/manager/profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setAuthenticated } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuActive = menuItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  function handleLogout() {
    setMenuOpen(false);
    setAuthenticated(false);
    router.push("/");
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-white/10">
        {mainItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
                active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setMenuOpen(true)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
            menuActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={menuActive ? 2.5 : 2} />
          <span className={`text-[10px] ${menuActive ? "font-semibold" : "font-medium"}`}>Menu</span>
        </button>
      </nav>

      {menuOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white dark:bg-[#111] pb-8 shadow-2xl">
            <div className="mx-auto mt-3 mb-4 h-1 w-10 rounded-full bg-gray-200 dark:bg-white/20" />

            <div className="flex items-center justify-between px-5 mb-3">
              <span className="text-sm font-bold text-gray-800 dark:text-white">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-3 space-y-1">
              {menuItems.map(({ icon: Icon, label, href }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                      active
                        ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}

              <div className="h-px bg-gray-100 dark:bg-white/10 mx-1 my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
