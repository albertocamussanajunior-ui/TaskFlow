"use client";

import { clearStoredSession, notifySessionExpired } from "@/lib/session";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions<T = undefined> {
  body?: T;
  headers?: HeadersInit;
}

export default async function universalRequest<TRequest = undefined, TResponse = unknown>(
  url: string,
  method: RequestMethod,
  options: RequestOptions<TRequest> = {},
): Promise<TResponse | null> {
  try {
    const token = localStorage.getItem("cybercore_token");
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearStoredSession();
        notifySessionExpired();
      } else {
        console.error("API error", response.status, await response.text());
      }
      return null;
    }

    if (response.status === 204) return {} as TResponse;
    return (await response.json()) as TResponse;
  } catch (error) {
    console.error("Request failed", error);
    return null;
  }
}
