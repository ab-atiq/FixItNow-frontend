import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <CheckCircle2 className="mb-4 h-14 w-14 text-green-500" />
      <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
      <p className="mt-2 text-sm text-gray-500">
        Your booking has been marked as paid. The technician has been notified.
      </p>
      <Link href="/dashboard/customer" className="mt-6">
        <Button>Go to my dashboard</Button>
      </Link>
    </div>
  );
}
