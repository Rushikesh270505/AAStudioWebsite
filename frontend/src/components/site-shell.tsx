import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      <div className="absolute inset-x-0 top-[-10rem] -z-10 h-[26rem] bg-[radial-gradient(circle_at_center,rgba(200,169,126,0.26),transparent_60%)]" />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
