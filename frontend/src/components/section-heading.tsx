type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <span className={`eyebrow ${centered ? "justify-center" : ""}`}>{eyebrow}</span>
      <h2 className="display-title mt-5 text-4xl leading-tight text-balance md:text-6xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-[#5d5d5d] md:text-lg">{description}</p>
    </div>
  );
}
