import {
  AwardIcon,
  CheckCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { defineChain } from "viem";

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

export const APP_NAME = "Retro Captcha Arcade";
export const APP_DESCRIPTION =
  "Retro-styled captcha mini-app for Farcaster: verify once, mint a HumanID badge, earn XP and meme tokens on Base.";
export const APP_OG_IMAGE_URL = `${APP_URL}/feed.png`;
export const APP_BUTTON_TEXT = "Launch Captcha";
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#0d0820";
export const APP_PRIMARY_CATEGORY = "security";
export const APP_TAGS = [
  "captcha",
  "security",
  "farcaster",
  "base",
  "retro",
  "humanid",
];
export const APP_WEBHOOK_URL = `${APP_URL}/api/webhook`;
export const APP_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjMxNzI2MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5ZWUzMjNFYTFCYjY1RjY4RkE3NWRmMGM2RDQ0MWQyMGQ4M0E4Q2QifQ",
  payload: "eyJkb21haW4iOiJmYXJzdGF0ZS52ZXJjZWwuYXBwIn0",
  signature:
    "TAFouFoy5C5A5APwUo+lvqNqvNj/RuSC9DCZ2eeFAwZgbQwABnOPl9+WcoYE4Z0PvC0ycFEJxYQQdidCGZwL5hw=",
};

export const castCategories = [
  {
    id: 1,
    name: "Tech News",
    icon: Zap,
    color: "border-purple-600",
  },
  {
    id: 2,
    name: "Crypto Updates",
    icon: TrendingUp,
    color: "border-purple-600",
  },
  {
    id: 3,
    name: "Motivational",
    icon: AwardIcon,
    color: "border-purple-600",
  },
  {
    id: 4,
    name: "Community",
    icon: MessageSquare,
    color: "border-purple-600",
  },
  {
    id: 5,
    name: "Meme",
    icon: Sparkles,
    color: "border-purple-600",
  },
  {
    id: 6,
    name: "Question",
    icon: CheckCircle,
    color: "border-purple-600",
  },
];

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

export const Monad = defineChain({
  id: 143,
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz"],
      webSocket: ["wss://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://monadscan.com" },
  },
});
