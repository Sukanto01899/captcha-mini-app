"use client";

import { Button } from "@/components/common/Button";
import { HumanIdCard } from "@/components/retro/HumanIdCard";
import type { ComponentProps } from "react";

type ShareCastConfig = ComponentProps<typeof HumanIdCard>["shareCastConfig"];

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

interface ProfileTabProps {
  fid?: number;
  username?: string;
  displayName?: string;
  minted: boolean;
  mintedHumanId: string | null;
  pfp?: string;
  humanScore?: number;
  isScoreLoading?: boolean;
  scoreError?: string | null;
  scoreUpdated?: boolean;
  isMinting: boolean;
  shareCastConfig: ShareCastConfig;
  onMint: () => void;
  onRefreshScore: () => void;
}

export function ProfileTab({
  fid,
  username,
  displayName,
  minted,
  mintedHumanId,
  pfp,
  humanScore,
  isScoreLoading,
  scoreError,
  scoreUpdated,
  isMinting,
  shareCastConfig,
  onMint,
  onRefreshScore,
}: ProfileTabProps) {
  const scoreValue = humanScore ?? 0;
  return (
    <div className="space-y-4">
      <HumanIdCard
        minted={minted}
        mintedHumanId={mintedHumanId}
        displayName={displayName}
        username={username}
        pfp={pfp}
        humanScore={humanScore}
        isMinting={isMinting}
        onboardingReady={true}
        shareCastConfig={shareCastConfig}
        onMint={onMint}
      />

      <div className="space-y-2">
        <Button
          className="w-full uppercase"
          style={pixelButtonStyle}
          onClick={onRefreshScore}
          disabled={isScoreLoading}
        >
          {isScoreLoading ? "CHECKING SCORE..." : "CHECK HUMAN SCORE"}
        </Button>
        {scoreError ? (
          <p className="text-[10px] text-secondary">ERROR: {scoreError}</p>
        ) : null}
        <Button
          className="w-full uppercase"
          style={pixelButtonStyle}
          onClick={onMint}
          disabled={minted ? !scoreUpdated || isMinting : isMinting}
        >
          {isMinting ? "MINTING..." : minted ? "UPDATE HUMAN ID" : "MINT NOW"}
        </Button>
      </div>
    </div>
  );
}
