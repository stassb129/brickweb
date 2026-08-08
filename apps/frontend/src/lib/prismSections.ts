export interface PrismSection {
  label: string;
  href: string;
  angle: number;
  color: string;
  length: number;
  match: (path: string) => boolean;
  /** Short line under the title in the refracted menu. */
  description: string;
  /** Lucide-ish icon key rendered by PrismSpectrum. */
  icon: "folder" | "user" | "bulb" | "flask" | "wave" | "archive" | "send";
  /** Placeholder slot for a future section — not navigable yet. */
  mock?: boolean;
}

/**
 * Full spectrum fan — real sections + mocked slots so the rainbow
 * stays continuous with no dark gaps between colours.
 */
export const PRISM_SECTIONS: PrismSection[] = [
  {
    label: "Проекты",
    href: "/",
    angle: -40,
    color: "#ff2a2a",
    length: 250,
    description: "Кейсы и выполненные работы.",
    icon: "folder",
    match: (path) => path === "/",
  },
  {
    label: "Обо мне",
    href: "/about",
    angle: -27,
    color: "#ff8a00",
    length: 258,
    description: "Путь, опыт и подход.",
    icon: "user",
    match: (path) => path.startsWith("/about"),
  },
  {
    label: "Идеи",
    href: "#soon-ideas",
    angle: -14,
    color: "#ffd400",
    length: 262,
    description: "Мысли и будущие планы.",
    icon: "bulb",
    match: () => false,
    mock: true,
  },
  {
    label: "Lab",
    href: "/lab",
    angle: 0,
    color: "#2bd46a",
    length: 260,
    description: "Эксперименты и пет-проекты.",
    icon: "flask",
    match: (path) => path.startsWith("/lab"),
  },
  {
    label: "Звук",
    href: "#soon-sound",
    angle: 14,
    color: "#2ec5ff",
    length: 262,
    description: "Аудио проекты и наработки.",
    icon: "wave",
    match: () => false,
    mock: true,
  },
  {
    label: "Архив",
    href: "#soon-archive",
    angle: 27,
    color: "#4570ff",
    length: 256,
    description: "Старые проекты и черновики.",
    icon: "archive",
    match: () => false,
    mock: true,
  },
  {
    label: "Контакты",
    href: "/contact",
    angle: 40,
    color: "#9b4dff",
    length: 250,
    description: "Связь и сотрудничество.",
    icon: "send",
    match: (path) => path.startsWith("/contact"),
  },
];

export const PRISM_TAGLINE =
  "Каждый проект — кирпич. Наведи на призму, чтобы разложить свет на разделы.";
