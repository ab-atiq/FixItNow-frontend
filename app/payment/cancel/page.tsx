import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <XCircle className="mb-4 h-14 w-14 text-red-500" />
      <h1 className="text-2xl font-bold text-gray-900">Payment cancelled</h1>
      <p className="mt-2 text-sm text-gray-500">
        Your payment was not completed. You can try again from your dashboard.
      </p>
      <Link href="/dashboard/customer" className="mt-6">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}
