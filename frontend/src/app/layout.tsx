import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aa-architecture-platform.vercel.app"),
  title: {
    default: "Art and Architecture Studios",
    template: "%s | Art and Architecture Studios",
  },
  description:
    "A premium architecture studio website and SaaS platform for portfolios, 3D models, walkthroughs, and client project management.",
  keywords: [
    "architecture studio",
    "3D architectural walkthrough",
    "architect dashboard",
    "project management",
    "architecture portfolio",
  ],
  openGraph: {
    title: "Art and Architecture Studios",
    description:
      "Showcase projects, host 3D models, guide immersive walkthroughs, and manage client delivery in one architecture platform.",
    siteName: "Art and Architecture Studios",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
