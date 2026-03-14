import { SectionHeading } from "@/components/section-heading";
import { services } from "@/lib/site-data";

export const metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Services"
            title="Design services supported by visualization and delivery operations"
            description="The platform supports the full lifecycle of architecture work, from concept strategy through detailed coordination and client-facing digital delivery."
          />
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-6 lg:grid-cols-2">
          {services.map((service, index) => (
            <div key={service.title} className="glass-panel rounded-[36px] p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.28em] text-[#8f6532]">0{index + 1}</p>
              <h2 className="display-title mt-4 text-4xl">{service.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[#5d5d5d]">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
