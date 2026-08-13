"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, DollarSign } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Booking, Service } from "@/types";

export default function TechnicianDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const technicianId = params.id;

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<Service[]>("/services", { auth: false })
      .then((all) => {
        const forTechnician = all.filter(
          (s) => s.technician?.userId === technicianId,
        );
        setServices(forTechnician.length ? forTechnician : all);
      })
      .catch(() => setServices([]));
  }, [technicianId]);

  async function handleBooking(e: FormEvent) {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Please log in as a customer to book a technician.");
      router.push("/login");
      return;
    }

    if (!selectedServiceId || !scheduledDate) {
      toast.error("Select a service and a date first.");
      return;
    }

    setLoading(true);
    try {
      await api.post<Booking>("/bookings", {
        technicianId,
        serviceId: selectedServiceId,
        scheduledDate: new Date(scheduledDate).toISOString(),
      });
      toast.success("Booking requested successfully");
      router.push("/dashboard/customer");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Card className="mb-8">
        <CardContent className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {technicianId.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Technician Profile
            </h1>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-4 w-4 text-yellow-500" />
              Rated by customers on completed jobs
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Services offered
          </h2>
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <button
                type="button"
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={
                  "rounded-lg border p-3 text-left transition-colors " +
                  (selectedServiceId === service.id
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:bg-gray-50")
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {service.serviceName}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatCurrency(service.basePrice)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {service.description}
                </p>
              </button>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-gray-500">
                No services listed for this technician yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Book this technician
          </h2>
          <form onSubmit={handleBooking} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Scheduled date
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <Button
              type="submit"
              isLoading={loading}
              disabled={!selectedServiceId}
            >
              Request Booking
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
