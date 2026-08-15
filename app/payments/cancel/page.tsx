"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

interface PaymentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Payment;
}

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const reason = searchParams.get("reason");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!sessionId) {
        setError("Payment session information not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Call the backend API directly
        const response = await fetch(
          `https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/payments/cancel?session_id=${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || "Failed to retrieve payment status",
          );
        }

        const data: PaymentResponse = await response.json();

        if (data.success && data.data) {
          setPayment(data.data);
          toast.info("Payment was cancelled");
        } else {
          setError(data.message || "Payment status could not be verified");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to retrieve payment";
        setError(message);
        console.error("Error fetching payment status:", err);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [sessionId]);

  const cancelReasons: Record<string, string> = {
    user_closed: "You closed the payment page",
    session_expired: "Your payment session expired",
    payment_failed: "Payment was declined",
    insufficient_funds: "Insufficient funds",
    invalid_card: "Invalid card information",
  };

  const reasonText = reason ? (cancelReasons[reason] ?? reason) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Cancel Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="mt-2 text-gray-600">
          Your payment was not completed. No charges have been made to your
          account.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading payment details...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 mb-8">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Please contact support if the issue persists.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : payment ? (
        <Card className="mb-8">
          <CardHeader className="bg-yellow-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Cancelled
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-mono text-xs text-gray-900 break-all">
                  {payment.transactionId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {payment.status}
                </span>
              </div>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {payment.bookingId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(payment.amount ?? 0)}
                </p>
              </div>
            </div>

            {/* Cancellation Reason */}
            {reasonText && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Cancellation Reason
                </p>
                <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-100">
                  {reasonText}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Info Card */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="space-y-2 text-sm text-blue-900">
            <p>• Your booking is still active and waiting for payment</p>
            <p>• No charges have been made to your account</p>
            <p>• The technician has not been notified yet</p>
            <p>• You can return to your bookings and try payment again</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        <Link href="/dashboard/customer/my-bookings" className="block">
          <Button className="w-full">Back to My Bookings</Button>
        </Link>

        <Link href="/dashboard/customer" className="block">
          <Button variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>

      {/* Support Info */}
      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">Need help?</span> If you continue to
            have issues with payment, please contact our support team.
          </p>
          <p className="text-xs text-gray-600">
            Contact: support@fixitnow.com | Phone: +1-800-FIXIT
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
