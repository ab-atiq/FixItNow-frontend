import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoleFromAccessToken } from "@/lib/auth";

export default async function DashboardPage() {
  const accessToken = (await cookies()).get("fixitnow_access_token")?.value;
  const role = getRoleFromAccessToken(accessToken);

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  }

  if (role === "TECHNICIAN") {
    redirect("/dashboard/technician");
  }

  if (role === "CUSTOMER") {
    redirect("/dashboard/customer");
  }

  redirect("/login");
}
