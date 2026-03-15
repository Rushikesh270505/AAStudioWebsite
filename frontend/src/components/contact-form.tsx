"use client";

import { FormEvent, useState } from "react";
import { submitContactLead } from "@/lib/api";

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setStatus("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await submitContactLead({
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        projectType: String(formData.get("projectType") || ""),
        budget: String(formData.get("budget") || ""),
        message: String(formData.get("message") || ""),
      });

      setStatus(response.message);
      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to capture your inquiry right now.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[#3c3c3c]">
          Full name
          <input
            required
            name="fullName"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 text-sm text-[#3c3c3c]">
          Email
          <input
            required
            type="email"
            name="email"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            placeholder="name@studio.com"
          />
        </label>
        <label className="grid gap-2 text-sm text-[#3c3c3c]">
          Phone / WhatsApp
          <input
            name="phone"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
            placeholder="+91 93903 89909"
          />
        </label>
        <label className="grid gap-2 text-sm text-[#3c3c3c]">
          Project type
          <select
            name="projectType"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
          >
            <option>Private residence</option>
            <option>Hospitality</option>
            <option>Commercial / studio</option>
            <option>Interior renovation</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-[#3c3c3c]">
          Budget range
          <select
            name="budget"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
          >
            <option>$100k - $250k</option>
            <option>$250k - $500k</option>
            <option>$500k - $1M</option>
            <option>$1M+</option>
          </select>
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm text-[#3c3c3c]">
        Brief
        <textarea
          required
          name="message"
          rows={5}
          className="rounded-[24px] border border-black/10 bg-white px-4 py-3 outline-none transition-colors focus:border-[#c8a97e]"
          placeholder="Tell us about the site, vision, scale, and timeline."
        />
      </label>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#5d5d5d]">
          {status || "Responses are stored in the studio CRM pipeline and surfaced inside the admin workspace for follow-up."}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="premium-button px-6 py-3 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
