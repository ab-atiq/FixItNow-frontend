import type { Role, User } from "@/types";

const ACCESS_TOKEN_KEY = "fixitnow_access_token";
const REFRESH_TOKEN_KEY = "fixitnow_refresh_token";
const USER_KEY = "fixitnow_user";
const COOKIE_ACCESS_TOKEN = "fixitnow_access_token";
const COOKIE_REFRESH_TOKEN = "fixitnow_refresh_token";

type AccessTokenPayload = {
  sub?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
};

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; path=/; max-age=" +
    maxAge +
    "; SameSite=Lax";
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; path=/; max-age=0";
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(name + "="));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

function decodeJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    let decoded: string;
    if (typeof window !== "undefined") {
      decoded = atob(padded);
    } else {
      decoded = Buffer.from(padded, "base64").toString("utf8");
    }

    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function setAuth(
  accessToken: string,
  refreshToken?: string,
  user?: User,
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  setCookie(COOKIE_ACCESS_TOKEN, accessToken, 7);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setCookie(COOKIE_REFRESH_TOKEN, refreshToken, 30);
  }

  const profile = user ?? getUserFromAccessToken(accessToken);
  if (profile) {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearCookie(COOKIE_ACCESS_TOKEN);
  clearCookie(COOKIE_REFRESH_TOKEN);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    getCookieValue(COOKIE_ACCESS_TOKEN)
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ??
    getCookieValue(COOKIE_REFRESH_TOKEN)
  );
}

export function getUserFromAccessToken(token?: string | null): User | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role = payload.role ?? "CUSTOMER";

  return {
    id: payload.sub ?? payload.id ?? "",
    name: payload.name ?? "",
    email: payload.email ?? "",
    role,
    createdAt: "",
    updatedAt: "",
  };
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }

  const accessToken = getAccessToken();
  return getUserFromAccessToken(accessToken);
}

export function getRoleFromAccessToken(token?: string | null): Role | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload?.role) return null;
  return payload.role;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function hasRole(allowed: Role | Role[]): boolean {
  const user = getUser();
  if (!user) return false;
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return roles.includes(user.role);
}

export function dashboardPathForRole(role: Role): string {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "TECHNICIAN") return "/dashboard/technician";
  return "/dashboard/customer";
}
