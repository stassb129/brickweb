import type { Metadata } from "next";
import LabContent from "./LabContent";

export const metadata: Metadata = {
  title: "Lab · BrickWeb",
  description: "Synthesizer Wall — кирпичный синтезатор",
};

export default function LabPage() {
  return <LabContent />;
}
