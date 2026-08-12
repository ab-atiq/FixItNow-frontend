import type { Role, User } from "@/types";

const TOKEN_KEY = "fixitnow_token";
const USER_KEY = "fixitnow_user";
const COOKIE_TOKEN = "fixitnow_token";
const COOKIE_ROLE = "fixitnow_role";

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie =
    name + "=" + encodeURIComponent(value) + "; path=/; max-age=" + maxAge + "; SameSite=Lax";
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; path=/; max-age=0";
}

export function setAuth(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie(COOKIE_TOKEN, token, 7);
  setCookie(COOKIE_ROLE, user.role, 7);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearCookie(COOKIE_TOKEN);
  clearCookie(COOKIE_ROLE);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
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
