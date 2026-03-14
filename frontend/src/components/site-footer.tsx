import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="section-pad pb-10">
      <div className="container-shell glass-panel rounded-[36px] p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div className="space-y-6">
            <BrandMark />
            <p className="max-w-xl text-sm leading-7 text-[#5d5d5d]">
              A premium architecture studio platform for portfolio storytelling, immersive 3D
              experiences, and client delivery operations.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-[#3c3c3c]">
              <span className="pill">
                <MapPin size={16} className="text-[#8f6532]" />
                Bengaluru, Goa, Jaipur
              </span>
              <span className="pill">
                <Phone size={16} className="text-[#8f6532]" />
                +91 98765 43210
              </span>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#8f6532]">Navigation</p>
            <div className="grid gap-3 text-sm text-[#3a3a3a]">
              <Link href="/projects">Projects</Link>
              <Link href="/viewer">3D Viewer</Link>
              <Link href="/walkthrough">Walkthrough</Link>
              <Link href="/dashboard">Client Dashboard</Link>
              <Link href="/admin">Architect Admin</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#8f6532]">Contact</p>
            <div className="grid gap-3 text-sm text-[#3a3a3a]">
              <a href="mailto:studio@aa-studios.com" className="inline-flex items-center gap-2">
                <Mail size={16} />
                studio@aa-studios.com
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Instagram size={16} />
                Instagram
              </a>
              <Link href="/contact" className="inline-flex items-center gap-2">
                Book a consultation
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
