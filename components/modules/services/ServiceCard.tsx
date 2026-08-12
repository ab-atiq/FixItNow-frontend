import Link from "next/link";
import { Wrench, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types";

export default function ServiceCard({ service }: { service: Service }) {
  const technicianId = service.technician?.userId || service.technicianId;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex items-center gap-3">
        <div className="rounded-lg bg-primary-50 p-2">
          <Wrench className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{service.name}</h3>
          {service.category && <p className="text-xs text-gray-500">{service.category.name}</p>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {service.description || "No description provided."}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold text-gray-900">
            <DollarSign className="h-4 w-4 text-primary-600" />
            {formatCurrency(service.basePrice)}
          </span>
          <Link
            href={"/technicians/" + technicianId}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            View & Book
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
