"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAppStore } from "@/lib/store";
import { NotificationProvider } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAppStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-white/5 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-white/10 border-t-gray-600 dark:border-t-white/30 rounded-full animate-spin" />
          <span>A preparar o sistema...</span>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-white/5 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <MobileHeader />
          <main className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </NotificationProvider>
  );
}