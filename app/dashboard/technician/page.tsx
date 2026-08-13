"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/modules/dashboard/StatusBadge";
import { formatDate } from "@/lib/utils";
import type {
  AvailabilitySlot,
  Booking,
  Category,
  TechnicianProfile,
} from "@/types";

const emptySlot = (): AvailabilitySlot => ({
  start: "",
  end: "",
  note: "",
});

const emptyProfile = (): TechnicianProfile => ({
  skills: "",
  experience: 0,
  hourlyRate: 0,
  location: "",
  isAvailable: true,
  availabilitySlots: [emptySlot()],
});

const hasSavedProfile = (value?: Partial<TechnicianProfile>) =>
  Boolean(
    value?.id ||
    value?.skills ||
    value?.location ||
    (typeof value?.hourlyRate === "number" && value.hourlyRate > 0) ||
    (typeof value?.experience === "number" && value.experience > 0),
  );

const emptyServiceForm = () => ({
  serviceName: "",
  description: "",
  categoryId: "",
  basePrice: "",
});

export default function TechnicianDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<TechnicianProfile>(emptyProfile());
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [creatingService, setCreatingService] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await api.get<Booking[]>("/bookings");
      setBookings(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load bookings";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile() {
    try {
      const data = await api.get<TechnicianProfile>("/technicians/me");
      const nextProfile = {
        ...emptyProfile(),
        ...data,
        availabilitySlots:
          data.availabilitySlots && data.availabilitySlots.length > 0
            ? data.availabilitySlots
            : [emptySlot()],
      };

      setProfile(nextProfile);
      setHasProfile(hasSavedProfile(data));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to load technician profile";
      toast.error(message);
      setProfile(emptyProfile());
      setHasProfile(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await api.get<Category[]>("/categories", { auth: false });
      setCategories(data);
      setServiceForm((current) => ({
        ...current,
        categoryId: current.categoryId || data[0]?.id || "",
      }));
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => {
    loadProfile();
    loadBookings();
    loadCategories();
  }, []);

  async function updateStatus(id: string, status: "ACCEPTED" | "DECLINED") {
    setUpdatingId(id);
    try {
      await api.patch("/bookings/" + id, { status });
      toast.success("Booking " + status.toLowerCase());
      loadBookings();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Update failed";
      toast.error(message);
    } finally {
      setUpdatingId("");
    }
  }

  function updateProfileField<K extends keyof TechnicianProfile>(
    field: K,
    value: TechnicianProfile[K],
  ) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateServiceField(
    field: "serviceName" | "description" | "categoryId" | "basePrice",
    value: string,
  ) {
    setServiceForm((current) => ({ ...current, [field]: value }));
  }

  function updateAvailabilitySlot(
    index: number,
    field: keyof AvailabilitySlot,
    value: string,
  ) {
    setProfile((current) => {
      const slots = [...(current.availabilitySlots || [emptySlot()])];
      slots[index] = {
        ...slots[index],
        [field]: value,
      };
      return { ...current, availabilitySlots: slots };
    });
  }

  function addAvailabilitySlot() {
    setProfile((current) => ({
      ...current,
      availabilitySlots: [...(current.availabilitySlots || []), emptySlot()],
    }));
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        skills: profile.skills,
        experience: Number(profile.experience),
        hourlyRate: Number(profile.hourlyRate),
        location: profile.location || "",
        isAvailable: profile.isAvailable,
      };

      if (profile.id) {
        await api.put("/technicians/profile", payload);
      } else {
        await api.post("/technicians/profile", payload);
      }

      setHasProfile(true);
      toast.success("Profile saved successfully");
      await loadProfile();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to save profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvailabilitySave(e: React.FormEvent) {
    e.preventDefault();
    setSavingAvailability(true);
    try {
      const slots = (profile.availabilitySlots || [])
        .filter((slot) => slot.start && slot.end)
        .map((slot) => ({
          start: new Date(slot.start).toISOString(),
          end: new Date(slot.end).toISOString(),
          note: slot.note || "",
        }));

      await api.put("/technicians/availability", { availabilitySlots: slots });
      toast.success("Availability updated successfully");
      await loadProfile();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to update availability";
      toast.error(message);
    } finally {
      setSavingAvailability(false);
    }
  }

  async function handleServiceCreate(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = serviceForm.serviceName.trim();
    const trimmedDescription = serviceForm.description.trim();
    const validPrice = Number(serviceForm.basePrice);

    if (
      !trimmedName ||
      !serviceForm.categoryId ||
      !Number.isFinite(validPrice) ||
      validPrice <= 0
    ) {
      toast.error("Please fill in a valid service name, category, and price.");
      return;
    }

    setCreatingService(true);
    try {
      await api.post("/services", {
        serviceName: trimmedName,
        description: trimmedDescription,
        categoryId: serviceForm.categoryId,
        basePrice: validPrice,
      });

      toast.success("Service created successfully");
      setServiceForm({
        ...emptyServiceForm(),
        categoryId: categories[0]?.id || "",
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create service";
      toast.error(message);
    } finally {
      setCreatingService(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Technician Dashboard
      </h1>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Technician Profile</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <Input
                label="Skills"
                value={profile.skills}
                onChange={(e) => updateProfileField("skills", e.target.value)}
                placeholder="Plumbing, Electrical"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Experience (years)"
                  type="number"
                  min={0}
                  value={profile.experience}
                  onChange={(e) =>
                    updateProfileField("experience", Number(e.target.value))
                  }
                />

                <Input
                  label="Hourly rate"
                  type="number"
                  min={0}
                  value={profile.hourlyRate}
                  onChange={(e) =>
                    updateProfileField("hourlyRate", Number(e.target.value))
                  }
                />
              </div>

              <Input
                label="Location"
                value={profile.location || ""}
                onChange={(e) => updateProfileField("location", e.target.value)}
                placeholder="Rajshahi, Bangladesh"
              />

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={profile.isAvailable}
                  onChange={(e) =>
                    updateProfileField("isAvailable", e.target.checked)
                  }
                />
                Available for new jobs
              </label>

              <Button
                type="submit"
                isLoading={savingProfile}
                className="w-full"
              >
                {profile.id ? "Update profile" : "Create profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Availability Slots</h2>
          </CardHeader>
          <CardContent>
            {!hasProfile ? (
              <p className="text-sm text-gray-500">
                Your technician profile is not created yet. Please create your
                profile first to manage availability slots.
              </p>
            ) : (
              <form onSubmit={handleAvailabilitySave} className="space-y-4">
                {(profile.availabilitySlots || [emptySlot()]).map(
                  (slot, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Start"
                          type="datetime-local"
                          value={slot.start ? slot.start.slice(0, 16) : ""}
                          onChange={(e) =>
                            updateAvailabilitySlot(
                              index,
                              "start",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          label="End"
                          type="datetime-local"
                          value={slot.end ? slot.end.slice(0, 16) : ""}
                          onChange={(e) =>
                            updateAvailabilitySlot(index, "end", e.target.value)
                          }
                        />
                      </div>

                      <Input
                        label="Note"
                        value={slot.note || ""}
                        onChange={(e) =>
                          updateAvailabilitySlot(index, "note", e.target.value)
                        }
                        placeholder="Morning shift"
                      />
                    </div>
                  ),
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAvailabilitySlot}
                  >
                    Add slot
                  </Button>
                  <Button
                    type="submit"
                    isLoading={savingAvailability}
                    className="flex-1"
                  >
                    Save availability
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 mt-8">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Create Service</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleServiceCreate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Service name"
                  value={serviceForm.serviceName}
                  onChange={(e) =>
                    updateServiceField("serviceName", e.target.value)
                  }
                  placeholder="Leak Pipe Repair"
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={serviceForm.categoryId}
                    onChange={(e) =>
                      updateServiceField("categoryId", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) =>
                    updateServiceField("description", e.target.value)
                  }
                  rows={4}
                  placeholder="Fixing leaking pipes and joints"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <Input
                label="Base price"
                type="number"
                min="0"
                step="0.01"
                value={serviceForm.basePrice}
                onChange={(e) =>
                  updateServiceField("basePrice", e.target.value)
                }
                placeholder="45.00"
              />

              <Button
                type="submit"
                isLoading={creatingService}
                className="w-full"
              >
                Create service
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

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
                      {booking.service?.serviceName || booking.serviceId}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatDate(booking.scheduledDate)}
                    </td>
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
