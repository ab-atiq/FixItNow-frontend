import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/dashboard/admin/user-management");
}
