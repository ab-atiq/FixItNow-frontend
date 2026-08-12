"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { setAuth, dashboardPathForRole } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ApiResponse, LoginResponseData, User } from "@/types";

type LoginApiData = LoginResponseData & {
  accessToken?: string;
  refreshToken?: string;
};

async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch("/api-proxy/auth/me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
    cache: "no-store",
  });

  let payload: ApiResponse<User> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<User>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.data) {
    throw new ApiError(
      response.status || 0,
      payload?.message || "Unable to load user profile",
    );
  }

  return payload.data;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<LoginApiData>(
        "/auth/login",
        { email, password },
        { auth: false },
      );
      const token = data.token || data.accessToken;

      if (!token) {
        throw new ApiError(
          500,
          "Login response did not include an access token",
        );
      }

      const user = data.user || (await getCurrentUser(token));
      setAuth(token, user);
      toast.success("Logged in successfully");
      const redirect = searchParams.get("redirect");
      router.push(redirect || dashboardPathForRole(user.role));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={loading} className="w-full">
        Log in
      </Button>
    </form>
  );
}
