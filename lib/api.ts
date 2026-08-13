import {
  getAccessToken,
  getRefreshToken,
  clearAuth,
  setAuth,
  getUser,
} from "@/lib/auth";
import type { ApiResponse } from "@/types";

function resolveApiUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api";
  const normalized = raw.replace(/\/+$/, "");

  return normalized.endsWith("/api") ? normalized : normalized + "/api";
}

const API_URL = typeof window === "undefined" ? resolveApiUrl() : "/api-proxy";

export class ApiError extends Error {
  statusCode: number;
  details: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  cache?: RequestCache;
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(API_URL + "/auth/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + refreshToken,
      },
      cache: "no-store",
    });

    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const nextAccessToken =
      payload?.data?.accessToken ||
      payload?.data?.token ||
      payload?.accessToken ||
      payload?.token;

    if (!response.ok || !nextAccessToken) {
      clearAuth();
      return null;
    }

    const currentUser = getUser();
    setAuth(nextAccessToken, refreshToken, currentUser ?? undefined);
    return nextAccessToken;
  } catch {
    clearAuth();
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retryWithRefresh = false,
): Promise<T> {
  const { method = "GET", body, auth = true, cache } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    let token = getAccessToken();
    if (!token && !retryWithRefresh) {
      token = (await refreshAccessToken()) ?? null;
    }
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
  }

  let response: Response;
  try {
    response = await fetch(API_URL + endpoint, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: cache || "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the server. Is the backend running?",
    );
  }

  let payload: ApiResponse<T> | any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401 && !retryWithRefresh) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return request<T>(endpoint, options, true);
      }
    }

    if (response.status === 401) {
      clearAuth();
    }
    const message = (payload && payload.message) || "Request failed";
    throw new ApiError(
      response.status,
      message,
      payload && payload.errorDetails,
    );
  }

  return (payload && payload.data) as T;
}

export const api = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "PATCH", body }),

  del: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "DELETE" }),
};
