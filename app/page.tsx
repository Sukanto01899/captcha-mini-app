import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { APP_BUTTON_TEXT, APP_DESCRIPTION, APP_NAME, APP_URL } from "@/lib/constants";
import AppShell from "@/components/app";

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
});

const frame = {
  version: "next",
  imageUrl: `${APP_URL}/feed.png`,
  button: {
    title: APP_BUTTON_TEXT,
    action: {
      type: "launch_frame",
      name: APP_NAME,
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#1a1a1a",
    },
  },
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function Home() {
  return (
    <main
      className={`${pressStart.className} h-[100svh] overflow-hidden bg-[#1a1a1a] text-[#00ff41] uppercase`}
    >
      <AppShell />
    </main>
  );
}
