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
export const APP_BUTTON_TEXT = "Check Human Score";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#0d0820";
export const APP_PRIMARY_CATEGORY = "social";
export const APP_TAGS = ["captcha", "security", "farcaster", "base", "humanid"];
export const APP_WEBHOOK_URL = `${APP_URL}/api/webhook`;
export const APP_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMxNzI2MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5ZWUzMjNFYTFCYjY1RjY4RkE3NWRmMGM2RDQ0MWQyMGQ4M0E4Q2QifQ",
  payload: "eyJkb21haW4iOiJjYXB0Y2hhaWQudmVyY2VsLmFwcCJ9",
  signature:
    "Innlw+wA1SR2E0SrHGDZczAd0dtMPsW99/79xS9zy18G6w/0sU8xWwpr5ieEIuLm2MI6NTcDtYPAEieMlZZNyxs=",
};

export const notificationsBtn = [
  {
    id: 1,
    name: "Check-in Points",
    title: "Daily check-in points",
    body: "Open Captcha, clear a challenge, and claim your check-in points.",
  },
  {
    id: 2,
    name: "New Airdrop",
    title: "New airdrop launched",
    body: "A fresh airdrop is live. Check eligibility and claim on Captcha.",
  },
  {
    id: 3,
    name: "Score Update",
    title: "Score update ready",
    body: "Your Human Score may have changed. Open Captcha to refresh it.",
  },
];
