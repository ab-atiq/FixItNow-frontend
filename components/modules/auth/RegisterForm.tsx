"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Role, User } from "@/types";

const ROLES: Role[] = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post<User>("/auth/register", { name, email, password, role }, { auth: false });
      toast.success("Account created. Please log in.");
      router.push("/login");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
      />
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
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">I am a</label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
                (role === r
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50")
              }
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={loading} className="w-full">
        Create account
      </Button>
    </form>
  );
}
