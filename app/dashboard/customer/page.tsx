"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/modules/dashboard/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, Payment } from "@/types";
import { getAccessToken } from "@/lib/auth";

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([
        api.get<Booking[]>("/bookings"),
        api.get<Payment[]>("/payments"),
      ]);
      setBookings(b);
      setPayments(p);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load dashboard";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handlePay(booking: Booking) {
    setPayingId(booking.id);

    try {
      const amount = Number(booking.service?.basePrice ?? 0);
      const token = getAccessToken();

      const query = new URLSearchParams({
        bookingId: booking.id,
        amount: String(amount),
        currency: "usd",
      });
      console.log("Payment request query:", query.toString());

      // const response = await fetch(
      //   `https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/payments/checkout?${query.toString()}`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       ...(token ? { Authorization: `Bearer ${token}` } : {}),
      //     },
      //     cache: "no-store",
      //   },
      // );

      const response = await fetch(
        `https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/payments/checkout?${query.toString()}`,
        {
          method: "GET",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
          cache: "no-store",
        },
      );

      const payload = await response.json();
      const checkoutUrl = payload?.data?.paymentUrl ?? payload?.paymentUrl;

      // console.log("Payment request response:", payload);
      // console.log("Checkout URL:", checkoutUrl);

      if (!response.ok || !checkoutUrl) {
        throw new ApiError(
          response.status || 500,
          payload?.message || "Checkout URL was not returned by the server.",
        );
      }

      toast.success("Redirecting to Stripe checkout...");
      window.location.href = checkoutUrl;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Payment failed";
      toast.error(message);
    } finally {
      setPayingId("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">My Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">My Bookings</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-gray-500">
              You have not booked any service yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Scheduled</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {booking.service?.serviceName || booking.serviceId}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatDate(booking.scheduledDate)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 pr-4">
                      {booking.status === "ACCEPTED" && !booking.payment && (
                        <Button
                          onClick={() => handlePay(booking)}
                          isLoading={payingId === booking.id}
                        >
                          Pay now
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Payment History</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-2 pr-4">Transaction</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Paid at</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-600">
                      {payment.transactionId}
                    </td>
                    <td className="py-3 pr-4">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 pr-4">{payment.status}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
