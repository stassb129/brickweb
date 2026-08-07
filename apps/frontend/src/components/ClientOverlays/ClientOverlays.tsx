"use client";

import dynamic from "next/dynamic";

const ComfortablyNumbOverlay = dynamic(
  () => import("@/components/ComfortablyNumbOverlay/ComfortablyNumbOverlay"),
  { ssr: false },
);

export default function ClientOverlays() {
  return <ComfortablyNumbOverlay />;
}
