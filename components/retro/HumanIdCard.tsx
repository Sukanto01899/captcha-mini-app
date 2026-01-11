"use client";

import { Button } from "@/components/common/Button";
import { ShareCast } from "@/components/common/ShareCast";
import { Trophy, Lock } from "lucide-react";

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

interface HumanIdCardProps {
  minted: boolean;
  mintedHumanId: string | null;
  displayName?: string;
  username?: string;
  pfp?: string;
  gameOver: boolean;
  isMinting: boolean;
  onboardingReady: boolean;
  shareCastConfig: any;
  onMint: () => void;
}

export function HumanIdCard({
  minted,
  mintedHumanId,
  displayName,
  username,
  pfp,
  gameOver,
  isMinting,
  onboardingReady,
  shareCastConfig,
  onMint,
}: HumanIdCardProps) {
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
                  <p className="text-xs text-secondary">HUMAN ID</p>
                  <p className="text-sm font-bold text-primary">
                    {mintedHumanId || "ONCHAIN CARD"}
                  </p>
                  <p className="text-[10px] text-white">
                    {displayName || "UNKNOWN"} @{username || "anon"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-secondary">
              <Lock className="h-8 w-8" />
              <span className="text-[10px]">LOCKED UNTIL MINT</span>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
          <Button
            onClick={onMint}
            disabled={minted || gameOver || isMinting || !onboardingReady}
            className="flex-1"
            style={pixelButtonStyle}
          >
            START (MINT)
          </Button>
          <Button
            variant="ghost"
            className="flex-1 border-4 border-border text-secondary"
            style={pixelButtonStyle}
          >
            SELECT (SKIP)
          </Button>
          {shareCastConfig ? (
            <ShareCast
              buttonText="SHARE"
              className="w-full border-4 border-border text-primary bg-card"
              cast={shareCastConfig}
            />
          ) : null}
        </div>
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
    >
      <path d="M18 8a3 3 0 1 0-2.83-4H12v5h3.17A3 3 0 0 0 18 8Zm0 2a4.98 4.98 0 0 1-3.584-1.5H11V21h2v-6a3 3 0 1 1 3 3h-1v2h1a5 5 0 0 0 0-10Z" />
    </svg>
  );
}
