import dbConnect from "@/lib/db";
import { UserModel } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = Number(searchParams.get("fid") || "0");
  if (!fid) {
    return NextResponse.json(
      { onboarded: false, humanId: null, points: 0 },
      { status: 200 }
    );
  }

  await dbConnect();
  const user = await UserModel.findOne({ fid }).lean();
  if (!user) {
    return NextResponse.json(
      {
        onboarded: false,
        humanId: null,
        points: 0,
        livesRemaining: 4,
        nextCaptchaAt: null,
      },
      { status: 200 }
    );
  }
  const now = new Date();
  const lastCaptchaAt = user.lastCaptchaAt ? new Date(user.lastCaptchaAt) : null;
  let livesRemaining = user.livesRemaining ?? 4;
  let nextCaptchaAt = user.nextCaptchaAt ?? null;

  if (lastCaptchaAt && lastCaptchaAt.toDateString() !== now.toDateString()) {
    livesRemaining = 4;
    nextCaptchaAt = null;
    await UserModel.findOneAndUpdate(
      { fid },
      { livesRemaining, nextCaptchaAt: null },
      { new: true }
    );
  }

  return NextResponse.json({
    onboarded: Boolean(user.onboarded),
    humanId: user.humanId,
    points: user.points || 0,
    livesRemaining,
    nextCaptchaAt,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    fid?: number;
    onboarded?: boolean;
    humanId?: string | null;
    points?: number;
    livesRemaining?: number;
    lastCaptchaAt?: string | null;
    nextCaptchaAt?: string | null;
  };
  if (!body.fid) {
    return NextResponse.json({ error: "Missing fid" }, { status: 400 });
  }
  await dbConnect();
  const update: Record<string, unknown> = {};
  if (typeof body.onboarded === "boolean") update.onboarded = body.onboarded;
  if (typeof body.humanId !== "undefined") update.humanId = body.humanId ?? null;
  if (typeof body.points === "number") update.points = body.points;
  if (typeof body.livesRemaining === "number")
    update.livesRemaining = body.livesRemaining;
  if (typeof body.lastCaptchaAt !== "undefined")
    update.lastCaptchaAt = body.lastCaptchaAt ?? null;
  if (typeof body.nextCaptchaAt !== "undefined")
    update.nextCaptchaAt = body.nextCaptchaAt ?? null;
  await UserModel.findOneAndUpdate({ fid: body.fid }, update, {
    upsert: true,
    new: true,
  });
  return NextResponse.json({ success: true });
}
