'use client'

import { Button } from '@/components/common/Button'

const pixelButtonStyle = { boxShadow: '4px 4px 0px #000' } as const

interface OnboardingScreenProps {
  onStart: () => void
  isLoading?: boolean
  errorMessage?: string | null
}

export function OnboardingScreen({
  onStart,
  isLoading = false,
  errorMessage,
}: OnboardingScreenProps) {
  return (
    <div className="flex h-screen flex-col justify-between bg-background px-4 py-8 text-center">
      <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border-4 border-border bg-card p-8 shadow-[0_0_0_4px_#000]">
        <p className="text-lg text-primary">WELCOME HUMAN</p>
        <p className="text-xs text-secondary">
          SOLVE THE CAPTCHA TO MINT HUMAN ID
        </p>
        <div className="rounded-xl border-4 border-border bg-background p-4 text-left text-[10px] text-secondary shadow-[4px_4px_0px_#000]">
          <p className="mb-2 text-primary">QUICK GUIDE</p>
          <ul className="space-y-1">
            <li>- VERIFY CAPTCHA</li>
            <li>- SCAN YOUR PROFILE SCORE</li>
            <li>- MINT HUMAN ID ON BASE</li>
          </ul>
          <p className="mt-3 text-primary">EARN & AIRDROP</p>
          <ul className="mt-1 space-y-1">
            <li>- SOLVE CAPTCHAS → EARN PTS</li>
            <li>- USE PTS TO JOIN AIRDROPS</li>
          </ul>
        </div>
        {isLoading ? (
          <p className="text-[10px] text-secondary">FETCHING HUMAN SCORE...</p>
        ) : null}
        {errorMessage ? (
          <p className="text-[10px] text-secondary">ERROR: {errorMessage}</p>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-md">
        <Button
          className="w-full uppercase py-3 text-sm"
          style={pixelButtonStyle}
          onClick={onStart}
          disabled={isLoading}
        >
          START ONBOARD
        </Button>
      </div>
    </div>
  )
}
