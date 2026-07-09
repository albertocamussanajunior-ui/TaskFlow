import type { TeamMember } from "@/lib/store";
import { LIST_USERS } from "../urls";
import universalRequest from "../universalRequest";

export interface ApiUser {
  id: string;
  created_at?: string;
  updated_at?: string;
  email: string;
  full_name: string;
  role?: string;
  status?: string;
  InviteToken?: string;
}

export const mapApiUserToFrontend = (api: ApiUser): TeamMember => ({
  id: api.id,
  name: api.full_name || api.email,
  role: api.role ?? "viewer",
  email: api.email,
  department: "",
  status: api.status === "away" || api.status === "offline" ? api.status : "active",
  activeTasks: 0,
});

export async function fetchUsers(): Promise<ApiUser[] | null> {
  return universalRequest<undefined, ApiUser[]>(LIST_USERS, "GET");
}
