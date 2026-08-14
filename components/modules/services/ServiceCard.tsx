import Link from "next/link";
import { Wrench, DollarSign, MapPin, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";

export default function ServiceCard({ service }: { service: Service }) {
  const technicianId = service.technician?.userId || service.technicianId;

  const renderRating = (rating: number | null | undefined) => {
    if (!rating) {
      return <span className="text-xs text-gray-400">No ratings yet</span>;
    }
    return (
      <span className="flex items-center gap-1 text-xs text-gray-600">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        {rating.toFixed(1)}
      </span>
    );
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex items-center gap-3">
        <div className="rounded-lg bg-primary-50 p-2">
          <Wrench className="h-5 w-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
          {service.category && (
            <p className="text-xs text-gray-500">
              {service.category.categoryName}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {service.description || "No description provided."}
        </p>

        {/* Technician Info */}
        <div className="space-y-2 border-t border-gray-100 pt-3">
          {service.technician?.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="truncate">{service.technician.location}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 text-primary-600" />
              {formatCurrency(service.basePrice)}
            </span>
            {renderRating(service.averageRating)}
          </div>
        </div>

        <Link
          href={"/technicians/" + technicianId}
          className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline"
        >
          View & Book
        </Link>
      </CardContent>
    </Card>
  );
}
