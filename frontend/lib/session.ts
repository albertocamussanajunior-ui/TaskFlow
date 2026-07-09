export interface TokenPayload {
  exp?: number;
  name?: string;
  email?: string;
  role?: string;
  sub?: string;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
  return true;
}

export function clearStoredSession() {
  localStorage.removeItem("cybercore_auth");
  localStorage.removeItem("cybercore_token");
}

export function getTokenPayload(): TokenPayload | null {
  const token = localStorage.getItem("cybercore_token");
  return token ? decodeToken(token) : null;
}

export function notifySessionExpired() {
  window.dispatchEvent(new Event("auth:session-expired"));
}
