import { redirect } from "next/navigation";

export default function CustomerIndex() {
  redirect("/dashboard/customer/my-bookings");
}
