import { LOGIN_USER } from "../urls";
import universalRequest from "../universalRequest";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export async function loginUser(body: LoginRequest): Promise<string | null> {
  const response = await universalRequest<LoginRequest, LoginResponse>(LOGIN_USER, "POST", { body });
  return response?.access_token ?? null;
}
