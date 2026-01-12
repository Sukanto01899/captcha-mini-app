export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

const defaultUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL &&
        `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      "http://localhost:3000";

export const APP_URL = defaultUrl;

export const APP_NAME = "Captcha";
export const APP_DESCRIPTION =
  "Verify once, mint a HumanID badge, earn PTS and meme tokens on Base.";
export const APP_OG_IMAGE_URL = `${APP_URL}/feed.png`;
export const APP_BUTTON_TEXT = "Get Human ID";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#0d0820";
export const APP_PRIMARY_CATEGORY = "games";
export const APP_TAGS = ["captcha", "security", "farcaster", "base", "humanid"];
export const APP_WEBHOOK_URL = `${APP_URL}/api/webhook`;
export const APP_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMxNzI2MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5ZWUzMjNFYTFCYjY1RjY4RkE3NWRmMGM2RDQ0MWQyMGQ4M0E4Q2QifQ",
  payload: "eyJkb21haW4iOiJodHRwczovL2NhcHRjaGFpZC52ZXJjZWwuYXBwLyJ9",
  signature:
    "8u6ldsgtbK+RDZDohNI1Q7OtF1KaX0I8J9sxKBsp8Jl8aYEPU6KOAQo05dLXNQjlPTGEUt6j7mqBZAhgQsBWGRs=",
};

export const notificationsBtn = [
  {
    id: 1,
    name: "Score Check",
    title: "Check your security score today.",
    body: "Open Retro Captcha Arcade and clear a challenge for rewards.",
  },
  {
    id: 2,
    name: "Daily Cast",
    title: "Daily captcha drop",
    body: "Clear a fresh captcha and mint a new HumanID badge.",
  },
  {
    id: 3,
    name: "Increase score?",
    title: "Boost your streak",
    body: "Keep your streak alive and climb the level ladder.",
  },
  {
    id: 4,
    name: "Rewards",
    title: "Claim meme tokens",
    body: "Captcha complete = fresh $CAP on Base for you.",
  },
  {
    id: 5,
    name: "Rewards",
    title: "Mint a badge",
    body: "Mint another HumanID card and share it anywhere.",
  },
];
