export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  tags: string[];
  demoUrl: string | null;
  repoUrl: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory = "Backend" | "Frontend" | "Database" | "Tools" | string;

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  level: number;
  iconName: string;
}

export type TimelineEventType = "work" | "education" | "achievement";

export interface TimelineEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  type: TimelineEventType;
  order: number;
}

/**
 * In development leave NEXT_PUBLIC_API_URL empty so Next.js rewrites `/api/*`
 * to the local Nest server. In production set it to the backend origin
 * (e.g. https://brickweb-api.up.railway.app) — paths hit Nest routes directly.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE) return `${API_BASE}${normalized}`;
  return `/api${normalized}`;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return response.json();
}

export function fetchProjects(): Promise<Project[]> {
  return getJson("/projects");
}

export function fetchSkills(): Promise<Skill[]> {
  return getJson("/skills");
}

export function fetchTimeline(): Promise<TimelineEvent[]> {
  return getJson("/timeline");
}

export async function postContact(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const response = await fetch(apiUrl("/contact"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Contact failed: ${response.status}`);
  }
}
