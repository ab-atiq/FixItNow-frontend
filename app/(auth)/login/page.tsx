import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/modules/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-500">Log in to manage your bookings.</p>
      <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-gray-500">
        Do not have an account?{" "}
        <Link href="/register" className="font-medium text-primary-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
