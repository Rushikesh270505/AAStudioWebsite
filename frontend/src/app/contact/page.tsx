import { ContactForm } from "@/components/contact-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.42fr_0.58fr]">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Start a conversation about a new commission"
              description="Tell us about the site, the scale of the project, and the kind of digital delivery you need. The platform is ready for residential, hospitality, commercial, and interior studio workflows."
            />
            <div className="mt-8 glass-panel rounded-[32px] p-6 text-sm leading-8 text-[#4d4d4d]">
              <p>Studio email: architectakhilstudios@gmail.com</p>
              <p>Phone / WhatsApp: +91 93903 89909</p>
              <p>Consultation window: Monday to Saturday, 10:00 AM to 6:00 PM IST</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
