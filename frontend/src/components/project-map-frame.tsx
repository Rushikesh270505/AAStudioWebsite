"use client";

import dynamic from "next/dynamic";

type ProjectMapFrameProps = {
  center: [number, number];
  title: string;
  location: string;
};

const DynamicProjectMap = dynamic(
  () => import("@/components/project-map").then((module) => module.ProjectMap),
  {
    ssr: false,
    loading: () => <div className="glass-panel h-[360px] rounded-[28px]" />,
  },
);

export function ProjectMapFrame(props: ProjectMapFrameProps) {
  return <DynamicProjectMap {...props} />;
}
