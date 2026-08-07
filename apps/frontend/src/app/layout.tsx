import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Permanent_Marker } from "next/font/google";
import localFont from "next/font/local";
import AnimatedWallBackground from "@/components/AnimatedWallBackground/AnimatedWallBackground";
import ClientOverlays from "@/components/ClientOverlays/ClientOverlays";
import CustomCursor from "@/components/CustomCursor/CustomCursor";
import Logo from "@/components/Logo/Logo";
import PageTransition from "@/components/PageTransition/PageTransition";
import PrismIntro from "@/components/PrismIntro/PrismIntro";
import PrismNavigator from "@/components/PrismNavigator/PrismNavigator";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import ThemeToggle, { THEME_INIT_SCRIPT } from "@/components/ThemeToggle/ThemeToggle";
import "./globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// The sleeve scrawl. Latin only, which is all the graffiti needs.
const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const clashDisplay = localFont({
  variable: "--font-clash-display",
  display: "swap",
  src: [
    { path: "../fonts/ClashDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "BrickWeb",
  description: "Fullstack-портфолио, собранное по кирпичику",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      className={`${inter.variable} ${jetBrainsMono.variable} ${clashDisplay.variable} ${permanentMarker.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AnimatedWallBackground />
        <ClientOverlays />
        <CustomCursor />
        <Logo />
        <ThemeToggle />
        <PrismIntro />
        <PrismNavigator />
        <SmoothScroll />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
