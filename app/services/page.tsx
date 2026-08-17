"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import ServiceCard from "@/components/modules/services/ServiceCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Category, Service } from "@/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("0");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Available locations and categories
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load all services once to get unique locations
  useEffect(() => {
    api
      .get<Service[]>("/services", { auth: false })
      .then((data) => {
        const uniqueLocations = Array.from(
          new Set(
            data
              .map((s) => s.technician?.location)
              .filter((l): l is string => !!l),
          ),
        );
        setLocations(uniqueLocations.sort());
      })
      .catch((err) => {
        console.error("Failed to load locations:", err);
      });

    api
      .get<Category[]>("/categories", { auth: false })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setCategories([]);
      });
  }, []);

  // Build query string with filters
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.append("search", search.trim());
    }

    if (category.trim()) {
      params.append("type", category.trim());
    }

    if (location.trim()) {
      params.append("location", location.trim());
    }

    if (rating && rating !== "0") {
      params.append("rating", rating);
    }

    if (minPrice.trim()) {
      params.append("minPrice", minPrice.trim());
    }

    if (maxPrice.trim()) {
      params.append("maxPrice", maxPrice.trim());
    }

    const queryString = params.toString();
    return queryString ? "/services?" + queryString : "/services";
  }, [search, category, location, rating, minPrice, maxPrice]);

  // Fetch services when filters change
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const endpoint = buildQuery();
        const data = await api.get<Service[]>(endpoint, { auth: false });
        setServices(data);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to load services";
        toast.error(message);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [buildQuery]);

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setRating("0");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="mx-auto max-w-8xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Browse Services</h1>

      {/* Filters Section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Service Name Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Service Name
            </label>
            <Input
              placeholder="e.g., Floor Cleaning"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Service Category Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All categories</option>
              {categories.map((categoryOption) => (
                <option
                  key={categoryOption.id}
                  value={categoryOption.categoryName}
                >
                  {categoryOption.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Min Rating
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="0">All ratings</option>
              <option value="1">★ 1+</option>
              <option value="2">★★ 2+</option>
              <option value="3">★★★ 3+</option>
              <option value="4">★★★★ 4+</option>
              <option value="5">★★★★★ 5</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Min Price ($)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Max Price ($)
            </label>
            <Input
              type="number"
              placeholder="999"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading services...</p>
      ) : services.length === 0 ? (
        <p className="text-center text-gray-500">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
