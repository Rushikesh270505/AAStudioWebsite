import { SectionHeading } from "@/components/section-heading";
import { WalkthroughExperience } from "@/components/walkthrough/walkthrough-experience";

export const metadata = {
  title: "Walkthrough",
};

export default function WalkthroughPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Interactive walkthrough"
            title="Explore the project in first person before construction begins"
            description="The walkthrough engine combines browser controls, lighting, and collision logic to give clients and teams an intuitive sense of scale and circulation."
          />
          <div className="mt-10">
            <WalkthroughExperience />
          </div>
        </div>
      </section>
    </>
  );
}
