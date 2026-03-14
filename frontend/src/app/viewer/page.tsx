import { ProjectViewer } from "@/components/viewer/project-viewer";
import { SectionHeading } from "@/components/section-heading";

export const metadata = {
  title: "3D Viewer",
};

export default function ViewerPage() {
  return (
    <>
      <section className="section-pad">
        <div className="container-shell">
          <SectionHeading
            eyebrow="3D viewer"
            title="A mobile-friendly WebGL viewer for architecture models"
            description="Use orbit controls, realistic lighting, and soft shadows to inspect building form, glazing, and key facade moments directly in the browser."
          />
          <div className="mt-10">
            <ProjectViewer />
          </div>
        </div>
      </section>
    </>
  );
}
