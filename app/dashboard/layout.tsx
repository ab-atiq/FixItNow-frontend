import React from "react";
import { cookies } from "next/headers";
import DashboardSidebar from "@/components/ui/DashboardSidebar";
import { getRoleFromAccessToken } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component: await cookies() (it returns a Promise in this runtime)
  let accessToken: string | null = null;
  try {
    const cookieStore = await cookies();
    accessToken = cookieStore.get("fixitnow_access_token")?.value ?? null;
  } catch (err) {
    accessToken = null;
  }

  const role = getRoleFromAccessToken(accessToken);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-12">
        <aside className="hidden w-64 lg:block">
          <DashboardSidebar role={role} />
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
