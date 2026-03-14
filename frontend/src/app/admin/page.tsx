import { AdminWorkspace } from "@/components/admin-workspace";

export const metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <AdminWorkspace />
      </div>
    </section>
  );
}
