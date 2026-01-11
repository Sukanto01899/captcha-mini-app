"use client";

import { Button } from "@/components/common/Button";

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

interface OnboardingMintScreenProps {
  displayName?: string;
  username?: string;
  pfp?: string;
  humanIdPreview: string;
  isMinting: boolean;
  onMint: () => void;
  onSkip: () => void;
}

export function OnboardingMintScreen({
  displayName,
  username,
  pfp,
  humanIdPreview,
  isMinting,
  onMint,
  onSkip,
}: OnboardingMintScreenProps) {
  return (
    <div className="flex h-screen flex-col justify-between bg-background px-4 py-6 text-center">
      <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border-4 border-border bg-card p-6 shadow-[0_0_0_4px_#000]">
        <p className="text-sm text-primary">HUMAN ID READY</p>
        <p className="text-[10px] text-secondary">MINT YOUR ONCHAIN HUMAN CARD</p>
        <div className="rounded-xl border-4 border-border bg-background p-4 shadow-[4px_4px_0px_#000] text-left">
          <div className="flex items-center gap-3">
            {pfp ? (
              <img
                src={pfp}
                alt="pfp"
                className="h-14 w-14 rounded-md border-2 border-border object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-border bg-card text-xs text-secondary">
                NO PFP
              </div>
            )}
            <div>
              <p className="text-[10px] text-secondary">HUMAN ID</p>
              <p className="text-sm text-primary">{humanIdPreview}</p>
              <p className="text-[10px] text-secondary">
                {displayName || "UNKNOWN"} @{username || "anon"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md grid gap-2">
        <Button className="w-full uppercase" style={pixelButtonStyle} onClick={onMint} disabled={isMinting}>
          MINT HUMAN ID
        </Button>
        <Button
          variant="ghost"
          className="w-full border-4 border-border text-secondary"
          style={pixelButtonStyle}
          onClick={onSkip}
        >
          SKIP FOR LATER
        </Button>
      </div>
    </div>
  );
}
