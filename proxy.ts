import { NextRequest, NextResponse } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  "/dashboard/customer": "CUSTOMER",
  "/dashboard/technician": "TECHNICIAN",
  "/dashboard/admin": "ADMIN",
};

function decodeJwtRole(token: string | undefined): string | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { role?: string };
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

async function refreshAccessToken(request: NextRequest) {
  const refreshToken = request.cookies.get("fixitnow_refresh_token")?.value;
  if (!refreshToken) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api";
  const apiUrl = new URL(
    "/auth/refresh-token",
    baseUrl.replace(/\/+$/, "") + "/",
  );

  const response = await fetch(apiUrl.toString(), {
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

  return response.ok && nextAccessToken ? nextAccessToken : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get("fixitnow_access_token")?.value;
  let role = decodeJwtRole(accessToken);

  if (!accessToken || !role) {
    const refreshedToken = await refreshAccessToken(request);
    if (refreshedToken) {
      const response = NextResponse.next();
      response.cookies.set("fixitnow_access_token", refreshedToken, {
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });
      accessToken = refreshedToken;
      role = decodeJwtRole(accessToken);
    }
  }

  if (!accessToken || !role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = ROLE_PREFIXES[matchedPrefix];
  if (role !== requiredRole) {
    const fallback =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "TECHNICIAN"
          ? "/dashboard/technician"
          : role === "CUSTOMER"
            ? "/dashboard/customer"
            : "/login";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
