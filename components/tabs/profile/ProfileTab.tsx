'use client'

import { Button } from '@/components/common/Button'
import { HumanIdCard } from '@/components/retro/HumanIdCard'
import type { ComponentProps } from 'react'

type ShareCastConfig = ComponentProps<typeof HumanIdCard>['shareCastConfig']

const pixelButtonStyle = { boxShadow: '4px 4px 0px #000' } as const

interface ProfileTabProps {
  fid?: number
  username?: string
  displayName?: string
  minted: boolean
  mintedHumanId: string | null
  pfp?: string
  humanScore?: number
  isScoreLoading?: boolean
  scoreError?: string | null
  scoreUpdated?: boolean
  isMinting: boolean
  shareCastConfig: ShareCastConfig
  onMint: () => void
  onRefreshScore: () => void
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
  const scoreValue = humanScore ?? 0
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
      <div className="rounded-xl border-4 border-border bg-card p-3 text-[10px] text-primary shadow-[4px_4px_0px_#000]">
        <p className="text-secondary">HUMAN SCORE</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{scoreValue}</span>
          <span className="text-[10px] text-secondary">/ 100</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full border-2 border-border bg-background">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700"
            style={{ width: `${Math.max(0, Math.min(100, scoreValue))}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Button
          className="w-full uppercase"
          style={pixelButtonStyle}
          onClick={onRefreshScore}
          disabled={isScoreLoading}
        >
          {isScoreLoading ? 'CHECKING SCORE...' : 'CHECK HUMAN SCORE'}
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
          {isMinting ? 'MINTING...' : minted ? 'UPDATE MINTED ID' : 'MINT NOW'}
        </Button>
      </div>
    </div>
  )
}
