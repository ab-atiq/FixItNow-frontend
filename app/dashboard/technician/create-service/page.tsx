"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Category } from "@/types";

const emptyServiceForm = () => ({
  serviceName: "",
  description: "",
  categoryId: "",
  basePrice: "",
});

export default function CreateServicePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm());
  const [creatingService, setCreatingService] = useState(false);

  async function loadCategories() {
    try {
      const data = await api.get<Category[]>("/categories", { auth: false });
      setCategories(data);
      setServiceForm((current) => ({ ...current, categoryId: current.categoryId || data[0]?.id || "" }));
    } catch {
      setCategories([]);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  function updateServiceField(field: "serviceName" | "description" | "categoryId" | "basePrice", value: string) {
    setServiceForm((current) => ({ ...current, [field]: value }));
  }

  async function handleServiceCreate(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = serviceForm.serviceName.trim();
    const trimmedDescription = serviceForm.description.trim();
    const validPrice = Number(serviceForm.basePrice);

    if (!trimmedName || !serviceForm.categoryId || !Number.isFinite(validPrice) || validPrice <= 0) {
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
      setServiceForm({ ...emptyServiceForm(), categoryId: categories[0]?.id || "" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create service";
      toast.error(message);
    } finally {
      setCreatingService(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Create Service</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Create Service</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleServiceCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Service name" value={serviceForm.serviceName} onChange={(e) => updateServiceField("serviceName", e.target.value)} placeholder="Leak Pipe Repair" />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select value={serviceForm.categoryId} onChange={(e) => updateServiceField("categoryId", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.categoryName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea value={serviceForm.description} onChange={(e) => updateServiceField("description", e.target.value)} rows={4} placeholder="Fixing leaking pipes and joints" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
            </div>

            <Input label="Base price" type="number" min="0" step="0.01" value={serviceForm.basePrice} onChange={(e) => updateServiceField("basePrice", e.target.value)} placeholder="45.00" />

            <Button type="submit" isLoading={creatingService} className="w-full">Create service</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
