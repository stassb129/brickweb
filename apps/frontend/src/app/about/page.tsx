import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "О себе · BrickWeb",
  description: "Стена навыков и временная кладка BrickWeb",
};

export default function AboutPage() {
  return <AboutContent />;
}
