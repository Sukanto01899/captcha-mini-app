"use client";

import { ShareCast } from "@/components/common/ShareCast";
import { Lock, Trophy } from "lucide-react";
import type { ComponentProps } from "react";

type ShareCastConfig = ComponentProps<typeof ShareCast>["cast"];

interface HumanIdCardProps {
  minted: boolean;
  mintedHumanId: string | null;
  displayName?: string;
  username?: string;
  pfp?: string;
  humanScore?: number;
  isMinting: boolean;
  onboardingReady: boolean;
  shareCastConfig: ShareCastConfig | null;
  onMint: () => void;
}

export function HumanIdCard({
  minted,
  mintedHumanId,
  displayName,
  username,
  pfp,
  humanScore,
  isMinting,
  onboardingReady,
  shareCastConfig,
  onMint,
}: HumanIdCardProps) {
  const scoreValue = humanScore ?? 0;
  const scoreTier =
    scoreValue >= 85
      ? { label: "ELITE", tone: "text-[#00ff41]", bg: "bg-[#00ff41]/15" }
      : scoreValue >= 60
        ? { label: "TRUSTED", tone: "text-[#f5d547]", bg: "bg-[#f5d547]/15" }
        : scoreValue >= 40
          ? { label: "VERIFIED", tone: "text-[#ff9f0a]", bg: "bg-[#ff9f0a]/15" }
          : { label: "RISK", tone: "text-[#ff004d]", bg: "bg-[#ff004d]/15" };
  const scorePercent = Math.max(0, Math.min(100, scoreValue));
  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border-4 border-border bg-card p-4 shadow-[4px_4px_0px_#000]">
        <div className="mb-2 flex items-center justify-between text-[10px]">
          <span>CENTRAL CARD</span>
          <Trophy className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-4 border-border bg-background p-4 shadow-[4px_4px_0px_#000]">
          {minted ? (
            <div className="w-full text-primary">
              <div className="flex items-center gap-3 rounded-md border-2 border-border bg-card p-3">
                {pfp ? (
                  <img
                    src={pfp}
                    alt="pfp"
                    className="h-12 w-12 rounded-sm border-2 border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-border bg-black text-xs text-secondary">
                    PFP
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">
                    {mintedHumanId || "HUMAN ID"}
                  </p>
                  <p className="text-[10px] text-white">
                    {displayName || "UNKNOWN"}
                  </p>
                  <p className="text-[8px] text-secondary">
                    @{username || "anon"}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-md border-2 border-border bg-background p-3 text-[10px] text-secondary">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">HUMAN SCORE</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] uppercase ${scoreTier.bg} ${scoreTier.tone}`}
                  >
                    {scoreTier.label}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary animate-pulse">
                    {scoreValue}
                  </span>
                  <span className="text-[10px] text-secondary">/ 100</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full border-2 border-border bg-card">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-2 text-secondary">
              <Lock className="h-8 w-8" />
              <span className="text-[10px]">LOCKED UNTIL MINT</span>

              <div className="w-full rounded-xl border-4 border-border bg-card p-3 text-[10px] text-primary shadow-[4px_4px_0px_#000]">
                <p className="text-secondary">HUMAN SCORE</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    {scoreValue}
                  </span>
                  <span className="text-[10px] text-secondary">/ 100</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full border-2 border-border bg-background">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{
                      width: `${Math.max(0, Math.min(100, scoreValue))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {shareCastConfig ? (
          <div className="mt-2 text-[10px]">
            <ShareCast
              buttonText="SHARE"
              className="w-full border-4 border-border text-primary bg-card"
              cast={shareCastConfig}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ShareCastIcon() {
  return (
    <svg
      className="h-4 w-4 text-[#ff004d]"
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label="Share cast"
    >
      <title>Share cast</title>
      <path d="M18 8a3 3 0 1 0-2.83-4H12v5h3.17A3 3 0 0 0 18 8Zm0 2a4.98 4.98 0 0 1-3.584-1.5H11V21h2v-6a3 3 0 1 1 3 3h-1v2h1a5 5 0 0 0 0-10Z" />
    </svg>
  );
}
