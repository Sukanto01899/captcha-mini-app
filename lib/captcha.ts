import { createHmac, randomBytes } from "node:crypto";

type Variant = "retro-grid" | "signal-noise" | "warp" | "matrix";

export interface CaptchaChallenge {
  id: string;
  variant: Variant;
  prompt: string;
  image: string;
  token: string;
  expiresAt: number;
  reward: {
    points: number;
    tokens: number;
    difficulty: "casual" | "skilled" | "elite";
  };
}

const DEFAULT_SECRET = "dev-captcha-secret";
const EXPIRATION_MS = 1000 * 60 * 5; // 5 minutes

function getSecret() {
  return process.env.CAPTCHA_SECRET || process.env.SERVER_PRIVATE_KEY || DEFAULT_SECRET;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signCaptcha(id: string, answer: string, expiresAt: number) {
  const secret = getSecret();
  const normalizedAnswer = normalizeAnswer(answer);
  const payload = `${id}:${expiresAt}:${normalizedAnswer}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return base64UrlEncode(`${id}:${expiresAt}:${signature}`);
}

function normalizeAnswer(answer: string) {
  return answer.trim().toUpperCase();
}

export function verifyCaptchaToken({
  id,
  token,
  answer,
}: {
  id: string;
  token: string;
  answer: string;
}) {
  try {
    const decoded = base64UrlDecode(token);
    const [tokenId, expiresAtString, signature] = decoded.split(":");
    const expiresAt = Number(expiresAtString);

    if (!tokenId || Number.isNaN(expiresAt) || !signature) {
      return { ok: false, reason: "invalid_token" } as const;
    }

    if (tokenId !== id) {
      return { ok: false, reason: "mismatched_challenge" } as const;
    }

    if (Date.now() > expiresAt) {
      return { ok: false, reason: "expired" } as const;
    }

    const expected = createHmac("sha256", getSecret())
      .update(`${tokenId}:${expiresAt}:${normalizeAnswer(answer)}`)
      .digest("hex");

    if (expected !== signature) {
      return { ok: false, reason: "incorrect" } as const;
    }

    return { ok: true } as const;
  } catch {
    return { ok: false, reason: "invalid_token" } as const;
  }
}

function pickReward(variant: Variant) {
  switch (variant) {
    case "retro-grid":
      return { points: 80, tokens: 3, difficulty: "casual" } as const;
    case "signal-noise":
      return { points: 110, tokens: 5, difficulty: "skilled" } as const;
    case "warp":
      return { points: 140, tokens: 8, difficulty: "elite" } as const;
    case "matrix":
      return { points: 120, tokens: 6, difficulty: "skilled" } as const;
    default:
      return { points: 60, tokens: 2, difficulty: "casual" } as const;
  }
}

function renderRetroSvg(text: string, variant: Variant) {
  const palette =
    variant === "warp"
      ? ["#FF7F11", "#FFD166", "#8A80F6", "#1B1B3A"]
      : variant === "signal-noise"
        ? ["#44FFD2", "#00BBF9", "#FFD166", "#1F2233"]
        : variant === "matrix"
          ? ["#00FF41", "#00E63A", "#00BB32", "#081B0D"]
          : ["#8EF9F3", "#F72585", "#4CC9F0", "#1A102A"];

  const noiseLines = Array.from({ length: 14 }, (_, i) => {
    const x1 = Math.floor(Math.random() * 320);
    const x2 = Math.floor(Math.random() * 320);
    const y = 18 + i * 12;
    const opacity = 0.2 + Math.random() * 0.35;
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${palette[i % palette.length]}" stroke-width="1.5" opacity="${opacity}" />`;
  }).join("");

  const scatter = Array.from({ length: 32 }, () => {
    const cx = Math.floor(Math.random() * 320);
    const cy = Math.floor(Math.random() * 120);
    const r = 1 + Math.random() * 2;
    const opacity = 0.3 + Math.random() * 0.4;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${
      palette[Math.floor(Math.random() * palette.length)]
    }" opacity="${opacity}" />`;
  }).join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="160" viewBox="0 0 340 160">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette[3]}" />
      <stop offset="100%" stop-color="${palette[2]}" />
    </linearGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0.4" />
    </filter>
  </defs>
  <rect width="340" height="160" rx="18" fill="url(#bg)" />
  <g filter="url(#noise)" opacity="0.18">
    <rect width="340" height="160" fill="url(#bg)" />
  </g>
  ${scatter}
  ${noiseLines}
  <text x="50%" y="58%" text-anchor="middle" fill="${palette[0]}" font-family="'Space Mono', 'IBM Plex Mono', monospace" font-weight="700" font-size="44" letter-spacing="6">
    ${text.split("").join(" ")}
  </text>
  <text x="50%" y="74%" text-anchor="middle" fill="${palette[1]}" font-family="'Space Grotesk', 'Inter', sans-serif" font-size="12" opacity="0.9" letter-spacing="1.8">
    RETRO HUMANITY CHECK
  </text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function randomText(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => alphabet[randomBytes(1)[0] % alphabet.length]).join("");
}

export function createCaptchaChallenge(variant: Variant = "retro-grid"): CaptchaChallenge {
  const id = randomBytes(8).toString("hex");
  const answer = randomText(6);
  const expiresAt = Date.now() + EXPIRATION_MS;
  const reward = pickReward(variant);

  return {
    id,
    variant,
    prompt: "Type the warped letters to prove you're human.",
    image: renderRetroSvg(answer, variant),
    token: signCaptcha(id, answer, expiresAt),
    expiresAt,
    reward,
  };
}
