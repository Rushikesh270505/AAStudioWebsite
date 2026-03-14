import { MessageCircleMore } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#111111] px-5 py-3 text-sm font-medium text-white shadow-[0_24px_60px_rgba(17,17,17,0.22)] transition-transform hover:-translate-y-1"
    >
      <MessageCircleMore size={18} className="text-[#c8a97e]" />
      WhatsApp
    </a>
  );
}
