"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
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

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

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
          `https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/payments/success?session_id=${encodeURIComponent(sessionId)}`,
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
          toast.success("Payment completed successfully!");
        } else {
          setError(data.message || "Payment status could not be verified");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to complete payment";
        setError(message);
        console.error("Error fetching payment status:", err);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Successful</h1>
        <p className="mt-2 text-gray-600">
          Thank you! Your payment has been processed successfully.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Verifying payment...</p>
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
          <CardHeader className="bg-green-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Confirmed
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="text-sm font-medium text-gray-900">
                  {payment.method === "card"
                    ? "Credit/Debit Card"
                    : payment.method}
                </p>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${payment.amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Time</p>
                <p className="text-sm font-medium text-gray-900">
                  {payment.paidAt ? formatDate(payment.paidAt) : "N/A"}
                </p>
              </div>
            </div>

            {/* Provider */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Provider: {payment.provider}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/dashboard/customer" className="flex-1 sm:flex-none">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
        <Link
          href="/dashboard/customer/my-bookings"
          className="flex-1 sm:flex-none"
        >
          <Button variant="outline" className="w-full">
            View My Bookings
          </Button>
        </Link>
      </div>

      {/* Additional Info */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <p className="text-sm text-blue-900">
            ℹ️ The technician has been notified about your booking and payment.
            You will receive updates about the scheduled service via email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
