import { SectionHeading } from "@/components/section-heading";
import { principles, studioStats } from "@/lib/site-data";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="About the studio"
            title="A premium architecture identity with an operating system behind it"
            description="The platform combines visual storytelling and project operations, letting architecture studios publish work with the polish of a portfolio site and the rigor of a client delivery tool."
          />
        </div>
      </section>

      <section className="section-pad section-frame">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.55fr_0.45fr]">
          <div className="glass-panel rounded-[36px] p-8 md:p-10">
            <p className="eyebrow">Approach</p>
            <div className="mt-6 grid gap-5 text-sm leading-8 text-[#4f4f4f]">
              <p>
                We design architecture platforms the same way a premium studio designs a residence: through sequence, proportion, light, and controlled moments of reveal.
              </p>
              <p>
                Every surface is tuned for architects who need portfolio impact, design review tools, and a private system for managing handovers, invoices, and client communication.
              </p>
              <p>
                The result is a single digital layer that supports lead generation, project presentation, and delivery transparency.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {principles.map((principle) => (
              <div key={principle} className="glass-panel rounded-[32px] p-6 text-sm leading-7 text-[#4b4b4b]">
                {principle}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-shell grid gap-4 md:grid-cols-4">
          {studioStats.map((stat) => (
            <div key={stat.label} className="glass-panel rounded-[32px] p-6">
              <p className="display-title text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm leading-7 text-[#5d5d5d]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
