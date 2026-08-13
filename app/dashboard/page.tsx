import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const role = (await cookies()).get("fixitnow_role")?.value;

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
