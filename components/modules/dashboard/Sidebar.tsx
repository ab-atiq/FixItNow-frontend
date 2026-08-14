"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

export default function DashboardSidebar() {
  const pathname = usePathname() || "";
  const role = pathname.includes("/dashboard/admin")
    ? "admin"
    : pathname.includes("/dashboard/technician")
    ? "technician"
    : "customer";

  const items: NavItem[] =
    role === "admin"
      ? [
          { label: "Overview", href: "/dashboard/admin" },
          { label: "Users", href: "/dashboard/admin/users" },
          { label: "Categories", href: "/dashboard/admin/categories" },
          { label: "Services", href: "/dashboard/admin/services" },
        ]
      : role === "technician"
      ? [
          { label: "Overview", href: "/dashboard/technician" },
          { label: "Profile", href: "/dashboard/technician/profile" },
          { label: "Services", href: "/dashboard/technician/services" },
          { label: "Bookings", href: "/dashboard/technician/bookings" },
        ]
      : [
          { label: "Overview", href: "/dashboard/customer" },
          { label: "My Bookings", href: "/dashboard/customer/bookings" },
          { label: "Payments", href: "/dashboard/customer/payments" },
        ];

  return (
    <nav className="sticky top-24 space-y-4">
      <div className="px-3 py-2 text-sm font-semibold text-gray-900">Menu</div>
      <ul className="flex flex-col space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sky-100 text-sky-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
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
