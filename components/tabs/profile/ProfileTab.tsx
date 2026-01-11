"use client";

import { HumanIdCard } from "@/components/retro/HumanIdCard";

interface ProfileTabProps {
  fid?: number;
  username?: string;
  displayName?: string;
  points: number;
  lives: number;
  maxLives: number;
  minted: boolean;
  mintedHumanId: string | null;
  pfp?: string;
  gameOver: boolean;
  isMinting: boolean;
  shareCastConfig: any;
  onMint: () => void;
}

export function ProfileTab({
  fid,
  username,
  displayName,
  points,
  lives,
  maxLives,
  minted,
  mintedHumanId,
  pfp,
  gameOver,
  isMinting,
  shareCastConfig,
  onMint,
}: ProfileTabProps) {
  return (
    <div className="space-y-4">
      <HumanIdCard
        minted={minted}
        mintedHumanId={mintedHumanId}
        displayName={displayName}
        username={username}
        pfp={pfp}
        gameOver={gameOver}
        isMinting={isMinting}
        onboardingReady={true}
        shareCastConfig={shareCastConfig}
        onMint={onMint}
      />
    </div>
  );
}
