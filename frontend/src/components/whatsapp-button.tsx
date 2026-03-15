import { MessageCircleMore } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919390389909"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[#c8a97e]/38 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(200,169,126,0.24))] px-5 py-3 text-sm font-medium text-[#111111] shadow-[0_16px_36px_rgba(200,169,126,0.2)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8a97e]/56 hover:shadow-[0_20px_42px_rgba(200,169,126,0.24)]"
    >
      <MessageCircleMore size={18} className="text-[#8f6532]" />
      WhatsApp
    </a>
  );
}
