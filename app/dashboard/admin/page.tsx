"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Category } from "@/types";

export default function AdminDashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadCategories() {
    try {
      const data = await api.get<Category[]>("/categories", { auth: false });
      setCategories(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load categories";
      toast.error(message);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post<Category>("/categories", { name, description });
      toast.success("Category created");
      setName("");
      setDescription("");
      loadCategories();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create category";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">User Management</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Connect this table to "GET /api/admin/users" and wire Ban/Unban
            buttons to "PATCH /api/admin/users/:id" once those endpoints are
            implemented on the backend.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Service Categories</h2>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateCategory}
            className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Painting"
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
            <Button type="submit" isLoading={creating}>
              Add Category
            </Button>
          </form>

          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-900">
                  {category.categoryName}
                </span>
                {category.description && (
                  <span className="text-gray-500">
                    {" "}
                    — {category.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
