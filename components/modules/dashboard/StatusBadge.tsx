import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentStatus } from "@/types";

const BOOKING_STYLES: Record<BookingStatus, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  DECLINED: "bg-red-100 text-red-800",
  PAID: "bg-purple-100 text-purple-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        BOOKING_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
        PAYMENT_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
