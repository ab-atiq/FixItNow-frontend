"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, Payment } from "@/types";
import { getAccessToken } from "@/lib/auth";

export default function PaymentHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Card id="payments">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Payment History</h2>
        </CardHeader>
        {loading === true ? (
          <CardContent className="text-center text-gray-500">
            Loading...
          </CardContent>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
