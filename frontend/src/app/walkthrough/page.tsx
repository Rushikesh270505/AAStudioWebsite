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
            eyebrow="Luxury residence walkthrough"
            title="Explore a bespoke 3BHK interior in a playable first-person experience"
            description="A warm, polished residential walkthrough with layered bedrooms, living, dining, and bath spaces lets clients experience the atmosphere before execution."
          />
          <div className="mt-10">
            <WalkthroughExperience />
          </div>
        </div>
      </section>
    </>
  );
}
