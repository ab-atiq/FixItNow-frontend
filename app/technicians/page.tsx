import Link from "next/link";

type TechnicianApiItem = {
  id: string;
  userId?: string;
  skills?: string;
  experience?: number;
  hourlyRate?: number;
  location?: string;
  isAvailable?: boolean;
  averageRating?: number | null;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  services?: Array<{
    id?: string;
    serviceName?: string;
    description?: string | null;
    basePrice?: number;
  }>;
};

function getInitials(name?: string) {
  if (!name) return "T";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "T"
  );
}

export default async function TechniciansPage() {
  const response = await fetch(
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/technicians",
    { cache: "no-store" },
  );

  const techniciansResponse = await response.json();
  const technicians: TechnicianApiItem[] = Array.isArray(
    techniciansResponse?.data,
  )
    ? techniciansResponse.data
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Technicians</h1>
        <p className="mt-2 text-gray-600">
          Browse verified professionals and choose the right fit for your home
          service needs.
        </p>
      </div>

      {technicians.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
          No technicians are available right now.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {technicians.map((technician) => {
            const name = technician.user?.name || "Technician";
            const skills = technician.skills || "General services";
            const location = technician.location || "Location not specified";
            const hourlyRate = technician.hourlyRate ?? 0;
            const availability = technician.isAvailable ? "Available" : "Busy";
            const services = technician.services || [];

            return (
              <Link
                key={technician.id}
                href={`/technicians/${technician.id}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                    {getInitials(name)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-gray-900">
                      {name}
                    </h2>
                    <p className="text-sm text-gray-500">{location}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {availability}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {technician.averageRating
                      ? `★ ${technician.averageRating.toFixed(1)}`
                      : "New profile"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Skills:</span>{" "}
                    {skills}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">
                      Experience:
                    </span>{" "}
                    {technician.experience ?? 0} years
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Rate:</span> $
                    {hourlyRate}/hr
                  </p>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services.length > 0 ? (
                      services.slice(0, 3).map((service) => (
                        <span
                          key={service.id || service.serviceName}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                        >
                          {service.serviceName || "Service"}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">
                        No services added yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 text-sm font-medium text-primary-600 group-hover:text-primary-700">
                  View profile →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
