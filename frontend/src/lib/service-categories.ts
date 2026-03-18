import type { Project } from "@/lib/platform-types";

export const serviceCategories = [
  "Architectural Planning",
  "Exterior Elevation Design",
  "Interior Design",
  "Landscape Design",
  "Architectural Art & Decorative Design",
  "3D Architectural Modeling",
  "Walkthrough & Architectural Visualization",
  "Architectural Media Editing",
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

const serviceCategoryMap: Record<string, ServiceCategory> = {
  "planning residential": "Architectural Planning",
  "planning commercial": "Architectural Planning",
  "cost and estimation": "Architectural Planning",
  "exterior design": "Exterior Elevation Design",
  "elevation design": "Exterior Elevation Design",
  "interior design": "Interior Design",
  "furniture design": "Interior Design",
  "landscape design": "Landscape Design",
  "architectural art & decorative design": "Architectural Art & Decorative Design",
  "decorative design": "Architectural Art & Decorative Design",
  "3d renders": "3D Architectural Modeling",
  "3d architectural modeling": "3D Architectural Modeling",
  walkthrough: "Walkthrough & Architectural Visualization",
  "walkthrough & architectural visualization": "Walkthrough & Architectural Visualization",
  "walkthrough editing": "Architectural Media Editing",
  "architectural media editing": "Architectural Media Editing",
};

export function getServiceCategory(project: Project): ServiceCategory {
  const source = String(project.serviceType || project.category || project.projectType || "").trim().toLowerCase();
  return serviceCategoryMap[source] || "Architectural Planning";
}

export function createCategoryId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
