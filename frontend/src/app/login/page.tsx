import { LoginPanel } from "@/components/login-panel";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <LoginPanel />
      </div>
    </section>
  );
}
