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
