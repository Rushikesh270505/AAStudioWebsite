import { MessageCircleMore } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noreferrer"
      className="premium-button fixed bottom-5 right-5 z-40 px-5 py-3 text-sm font-medium"
    >
      <MessageCircleMore size={18} className="text-[#8f6532]" />
      WhatsApp
    </a>
  );
}
