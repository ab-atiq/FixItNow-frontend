"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/modules/dashboard/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Booking, Payment } from "@/types";
import { getAccessToken } from "@/lib/auth";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState("");
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([
        api.get<Booking[]>("/bookings"),
        api.get<Payment[]>("/payments"),
      ]);
      setBookings(b);
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

  function openReviewDialog(booking: Booking) {
    setReviewTarget(booking);
    setReviewForm({ rating: 5, comment: "" });
  }

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reviewTarget) {
      return;
    }

    const trimmedComment = reviewForm.comment.trim();
    const normalizedRating = Number(reviewForm.rating);

    if (
      !Number.isFinite(normalizedRating) ||
      normalizedRating < 1 ||
      normalizedRating > 5
    ) {
      toast.error("Please select a valid rating between 1 and 5.");
      return;
    }

    if (!trimmedComment) {
      toast.error("Please add a short comment about the service.");
      return;
    }

    setReviewSubmitting(true);

    try {
      await api.post("/reviews", {
        bookingId: reviewTarget.id,
        rating: normalizedRating,
        comment: trimmedComment,
      });

      toast.success("Review submitted successfully.");
      setReviewTarget(null);
      setReviewForm({ rating: 5, comment: "" });
      await loadData();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to submit review";
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">My Bookings</h1>

      <Card id="bookings" className="mb-8">
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
                      {booking.status === "COMPLETED" && (
                        <Button
                          onClick={() => openReviewDialog(booking)}
                          isLoading={
                            reviewSubmitting && reviewTarget?.id === booking.id
                          }
                        >
                          Review
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

      {reviewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setReviewTarget(null);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Leave a review
              </h3>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="text-xl leading-none text-gray-500 hover:text-gray-700"
                aria-label="Close review form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setReviewForm((current) => ({
                          ...current,
                          rating: value,
                        }))
                      }
                      aria-label={`Rate ${value} out of 5`}
                      className={`text-2xl transition ${
                        value <= reviewForm.rating
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Comment
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      comment: event.target.value,
                    }))
                  }
                  placeholder="Tell us how the service went..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewTarget(null)}
                  disabled={reviewSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={reviewSubmitting}>
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      
    </div>
  );
}
