import { redirect } from "next/navigation";

export const metadata = {
  title: "Staff Login",
};

export default function StaffLoginPage() {
  redirect("/auth");
}
