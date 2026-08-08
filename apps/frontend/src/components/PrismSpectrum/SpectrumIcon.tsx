import type { PrismSection } from "@/lib/prismSections";

type IconName = PrismSection["icon"];

const props = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function SpectrumIcon({ name }: { name: IconName }) {
  switch (name) {
    case "folder":
      return (
        <svg {...props}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19.5c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8" />
        </svg>
      );
    case "bulb":
      return (
        <svg {...props}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3a5.5 5.5 0 0 0-3.2 9.9c.7.6 1.2 1.4 1.2 2.3h4c0-.9.5-1.7 1.2-2.3A5.5 5.5 0 0 0 12 3Z" />
        </svg>
      );
    case "flask":
      return (
        <svg {...props}>
          <path d="M9 3h6" />
          <path d="M10 3v6.2L5.4 18a2.2 2.2 0 0 0 1.9 3.3h9.4a2.2 2.2 0 0 0 1.9-3.3L14 9.2V3" />
          <path d="M8.2 14h7.6" />
        </svg>
      );
    case "wave":
      return (
        <svg {...props}>
          <path d="M3 12c1.5-4 3-6 4.5-6S10.5 12 12 12s3-6 4.5-6 3 2 4.5 6" />
        </svg>
      );
    case "archive":
      return (
        <svg {...props}>
          <path d="M4 7.5h16v11A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-11Z" />
          <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5V7H3V4.5Z" />
          <path d="M10 12h4" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="M21 3 10.5 13.5" />
          <path d="M21 3 14.5 21l-4-7.5L3 9.5 21 3Z" />
        </svg>
      );
    default:
      return null;
  }
}
