"use client";

import { useAppStore } from "@/lib/store";
import { User, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { currentUser } = useAppStore();

  const displayName = currentUser?.name ?? currentUser?.email ?? "Utilizador";
  const displayEmail = currentUser?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white dark:bg-black/50 p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black/90 dark:bg-white/10 text-white text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{displayName}</h2>
            <p className="text-sm text-gray-400">{displayEmail}</p>
            {currentUser?.role && (
              <span className="mt-1 inline-block rounded-full bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                {currentUser.role}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-black/50 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Informações da conta</h3>

        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-3">
          <User size={16} className="text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Nome</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-3">
          <Mail size={16} className="text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">{displayEmail}</p>
          </div>
        </div>

        {currentUser?.role && (
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-white/5 px-4 py-3">
            <Shield size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Função</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">{currentUser.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
