"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/modules/dashboard/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Booking } from "@/types";

export default function TechnicianDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await api.get<Booking[]>("/bookings");
      setBookings(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load bookings";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateStatus(id: string, status: "ACCEPTED" | "DECLINED") {
    setUpdatingId(id);
    try {
      await api.patch("/bookings/" + id + "/status", { status });
      toast.success("Booking " + status.toLowerCase());
      loadBookings();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Update failed";
      toast.error(message);
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Technician Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Profile & Availability</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Profile and availability management endpoints are not wired up on the backend yet.
            Once "/api/technician/profile" and "/api/technician/availability" exist, connect the
            forms here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Incoming Bookings</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-gray-500">No bookings yet.</p>
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
                      {booking.service?.name || booking.serviceId}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{formatDate(booking.scheduledDate)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 pr-4">
                      {booking.status === "REQUESTED" && (
                        <div className="flex gap-2">
                          <Button
                            isLoading={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "ACCEPTED")}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            isLoading={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "DECLINED")}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
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
