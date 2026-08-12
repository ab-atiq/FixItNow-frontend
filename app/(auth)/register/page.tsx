import Link from "next/link";
import RegisterForm from "@/components/modules/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">Join FixItNow as a customer, technician or admin.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
