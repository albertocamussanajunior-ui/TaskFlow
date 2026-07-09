import universalRequest from "../universalRequest";
import {
  LIST_NOTIFICATIONS,
  UNREAD_COUNT,
  MARK_AS_READ,
  MARK_ALL_AS_READ,
  DELETE_NOTIFICATION,
} from "../urls";

export interface ApiNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_id: string;
  entity_type: string;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<ApiNotification[] | null> {
  return universalRequest<undefined, ApiNotification[]>(LIST_NOTIFICATIONS, "GET");
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await universalRequest<undefined, { count: number }>(UNREAD_COUNT, "GET");
  return res?.count ?? 0;
}

export async function markAsRead(id: string): Promise<boolean> {
  const res = await universalRequest(MARK_AS_READ(id), "PUT");
  return res !== null;
}

export async function markAllAsRead(): Promise<boolean> {
  const res = await universalRequest(MARK_ALL_AS_READ, "PUT");
  return res !== null;
}

export async function deleteNotification(id: string): Promise<boolean> {
  const res = await universalRequest(DELETE_NOTIFICATION(id), "DELETE");
  return res !== null;
}