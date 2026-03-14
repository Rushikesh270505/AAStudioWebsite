import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata = {
  title: "Staff Login",
};

export default function StaffLoginPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <AuthPanel staffMode />
      </div>
    </section>
  );
}
