"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, type ReactNode
} from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  type ApiNotification,
} from "@/api/notifications/fetches";

export type NotificationType = "task" | "project" | "meeting";

export interface Notification {
  id: string;         // ← changed from number to string (API uses string IDs)
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
  entityId: string;
  entityType: string;
}

const POLL_INTERVAL = 30_000;

const typeMap: Record<string, NotificationType> = {
  task_assigned:       "task",
  task_status_changed: "task",
  task_created:        "task",
  project_updated:     "project",
  member_added:        "project",
};

function mapApiNotification(api: ApiNotification): Notification {
  return {
    id:          api.id,
    type:        typeMap[api.type] ?? "task",
    title:       api.title,
    description: api.message,
    time:        new Date(api.created_at).toLocaleString("pt-PT", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }),
    read:        api.read,
    entityId:    api.entity_id,
    entityType:  api.entity_type,
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);

  const load = useCallback(async () => {
    const [raw, count] = await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ]);
    if (raw) setNotifications(raw.map(mapApiNotification));
    setUnreadCount(count);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await apiMarkAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await apiMarkAllAsRead();
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: load }),
    [notifications, unreadCount, loading, markAsRead, markAllAsRead, load],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}