import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ServiceCard from "@/components/modules/services/ServiceCard";
import type { ApiResponse, Service } from "@/types";

async function getFeaturedServices(): Promise<Service[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api";
  try {
    const res = await fetch(API_URL + "/services", { cache: "no-store" });
    if (!res.ok) return [];
    const json: ApiResponse<Service[]> = await res.json();
    return (json.data || []).slice(0, 6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getFeaturedServices();

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
          <h1 className="max-w-2xl text-4xl font-bold text-gray-900 md:text-5xl">
            Your Trusted Home Service Platform
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-600">
            Book qualified technicians for plumbing, electrical, cleaning, painting and more —
            all in one place.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/services">
              <Button>
                Browse Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Join as Technician</Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary-600" />
              <p className="text-sm text-gray-600">Verified technicians</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 text-primary-600" />
              <p className="text-sm text-gray-600">Flexible scheduling</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-6 w-6 text-primary-600" />
              <p className="text-sm text-gray-600">Rated & reviewed</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Services</h2>
          <Link href="/services" className="text-sm font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {services.length === 0 ? (
          <p className="text-gray-500">
            No services available yet, or the backend at NEXT_PUBLIC_API_URL is not running.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
