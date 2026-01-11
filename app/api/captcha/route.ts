import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import {
  CaptchaChallenge,
  createCaptchaChallenge,
  verifyCaptchaToken,
} from "@/lib/captcha";

export type CaptchaGenerationResponse = {
  challenge: CaptchaChallenge;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("status")) {
    // Placeholder status endpoint; replace with Redis-backed daily limit check.
    return NextResponse.json({
      livesRemaining: 5,
      points: 0,
      minted: false,
    });
  }
  const variantParam = searchParams.get("variant");
  const allowed = ["retro-grid", "signal-noise", "warp", "matrix"] as const;
  const variant = allowed.includes(variantParam as (typeof allowed)[number])
    ? (variantParam as (typeof allowed)[number])
    : "retro-grid";

  const challenge = createCaptchaChallenge(variant);

  return NextResponse.json({ challenge } satisfies CaptchaGenerationResponse);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, token, answer } = body as {
    id?: string;
    token?: string;
    answer?: string;
  };

  if (!id || !token || !answer) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 }
    );
  }

  const verification = verifyCaptchaToken({ id, token, answer });

  if (!verification.ok) {
    return NextResponse.json(
      { ok: false, error: verification.reason },
      { status: 400 }
    );
  }

  const mintedAt = Date.now();
  const humanId = `HUM-${id.slice(0, 4)}-${mintedAt.toString().slice(-6)}`;

  return NextResponse.json({
    ok: true,
    humanId,
    mintedAt,
  });
}
