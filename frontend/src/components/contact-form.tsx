"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setStatus("");

    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus("Inquiry captured. Connect this form to your backend or CRM inbox for live submissions.");
    setIsPending(false);
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={onSubmit} className="glass-panel rounded-[32px] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[#3c3c3c]">
          Full name
          <input
            required
            name="name"
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
        <p className="text-sm text-[#5d5d5d]">{status || "Responses are framed around strategy, design scope, and delivery timing."}</p>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#111111] px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
