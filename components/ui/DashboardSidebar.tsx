"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type Role = "ADMIN" | "TECHNICIAN" | "CUSTOMER" | null | undefined;

const itemsByRole: Record<string, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "User Management", href: "/dashboard/admin/user-management" },
    {
      label: "Service Categories",
      href: "/dashboard/admin/service-categories",
    },
  ],
  TECHNICIAN: [
    {
      label: "Technician Profile",
      href: "/dashboard/technician/technician-profile",
    },
    { label: "Create Service", href: "/dashboard/technician/create-service" },
    {
      label: "Incoming Bookings",
      href: "/dashboard/technician/incoming-bookings",
    },
  ],
  CUSTOMER: [
    { label: "My Bookings", href: "/dashboard/customer/my-bookings" },
    { label: "Payments History", href: "/dashboard/customer/payment-history" },
  ],
};

export default function DashboardSidebar({ role }: { role?: Role }) {
  const pathname = usePathname();
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    // keep track of the hash for active link highlighting
    const update = () =>
      setHash(typeof window !== "undefined" ? window.location.hash : "");
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const items = role ? itemsByRole[role] || [] : [];

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 h-[calc(100vh-6rem)] overflow-auto rounded-md border border-gray-100 bg-white p-3">
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          // Active if pathname matches base path OR hash matches
          const [basePath] = item.href.split("#");
          const isActive =
            basePath === pathname || (hash && item.href.endsWith(hash));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
                  (isActive
                    ? "bg-primary-50 font-medium text-primary-700"
                    : "text-gray-700 hover:bg-gray-50")
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
