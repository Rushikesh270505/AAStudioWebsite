import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata = {
  title: "Sign Up / Login",
};

export default function AuthPage() {
  return (
    <section className="section-pad">
      <div className="container-shell">
        <AuthPanel />
      </div>
    </section>
  );
}
