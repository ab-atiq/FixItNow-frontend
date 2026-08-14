"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import type { AvailabilitySlot, TechnicianProfile } from "@/types";

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

export default function TechnicianProfilePage() {
  const [profile, setProfile] = useState<TechnicianProfile>(emptyProfile());
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  function updateProfileField<K extends keyof TechnicianProfile>(field: K, value: TechnicianProfile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateAvailabilitySlot(index: number, field: keyof AvailabilitySlot, value: string) {
    setProfile((current) => {
      const slots = [...(current.availabilitySlots || [emptySlot()])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...current, availabilitySlots: slots };
    });
  }

  function addAvailabilitySlot() {
    setProfile((current) => ({ ...current, availabilitySlots: [...(current.availabilitySlots || []), emptySlot()] }));
  }

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await api.get<TechnicianProfile>("/technicians/me");
      const nextProfile = { ...emptyProfile(), ...data, availabilitySlots: data.availabilitySlots && data.availabilitySlots.length > 0 ? data.availabilitySlots : [emptySlot()] };
      setProfile(nextProfile);
      setHasProfile(hasSavedProfile(data));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load technician profile";
      toast.error(message);
      setProfile(emptyProfile());
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
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
      const message = err instanceof ApiError ? err.message : "Failed to save profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvailabilitySave(e: React.FormEvent) {
    e.preventDefault();
    setSavingAvailability(true);
    try {
      const slots = (profile.availabilitySlots || []).filter((slot) => slot.start && slot.end).map((slot) => ({ start: new Date(slot.start).toISOString(), end: new Date(slot.end).toISOString(), note: slot.note || "" }));
      await api.put("/technicians/availability", { availabilitySlots: slots });
      toast.success("Availability updated successfully");
      await loadProfile();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update availability";
      toast.error(message);
    } finally {
      setSavingAvailability(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Technician Profile</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Technician Profile</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input label="Skills" value={profile.skills} onChange={(e) => updateProfileField("skills", e.target.value)} placeholder="Plumbing, Electrical" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Experience (years)" type="number" min={0} value={profile.experience} onChange={(e) => updateProfileField("experience", Number(e.target.value))} />

              <Input label="Hourly rate" type="number" min={0} value={profile.hourlyRate} onChange={(e) => updateProfileField("hourlyRate", Number(e.target.value))} />
            </div>

            <Input label="Location" value={profile.location || ""} onChange={(e) => updateProfileField("location", e.target.value)} placeholder="Rajshahi, Bangladesh" />

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={profile.isAvailable} onChange={(e) => updateProfileField("isAvailable", e.target.checked)} />
              Available for new jobs
            </label>

            <Button type="submit" isLoading={savingProfile} className="w-full">{profile.id ? "Update profile" : "Create profile"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Availability Slots</h2>
        </CardHeader>
        <CardContent>
          {!hasProfile ? (
            <p className="text-sm text-gray-500">Your technician profile is not created yet. Please create your profile first to manage availability slots.</p>
          ) : (
            <form onSubmit={handleAvailabilitySave} className="space-y-4">
              {(profile.availabilitySlots || [emptySlot()]).map((slot, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Start" type="datetime-local" value={slot.start ? slot.start.slice(0, 16) : ""} onChange={(e) => updateAvailabilitySlot(index, "start", e.target.value)} />
                    <Input label="End" type="datetime-local" value={slot.end ? slot.end.slice(0, 16) : ""} onChange={(e) => updateAvailabilitySlot(index, "end", e.target.value)} />
                  </div>

                  <Input label="Note" value={slot.note || ""} onChange={(e) => updateAvailabilitySlot(index, "note", e.target.value)} placeholder="Morning shift" />
                </div>
              ))}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addAvailabilitySlot}>Add slot</Button>
                <Button type="submit" isLoading={savingAvailability} className="flex-1">Save availability</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
