'use client'

import { Button } from '@/components/common/Button'
import { Clock } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const pixelButtonStyle = { boxShadow: '4px 4px 0px #000' } as const

interface CaptchaTabProps {
  challengeImage?: string
  answer: string
  isLoading: boolean
  isVerifying?: boolean
  errorMessage?: string | null
  claimReady?: boolean
  claimError?: string | null
  isClaiming?: boolean
  cooldownSeconds: number
  onAnswerChange: (value: string) => void
  onVerify: () => void
  onRefresh: () => void
  onClaim?: () => void
  onGoAirdrop?: () => void
}

export function CaptchaTab({
  challengeImage,
  answer,
  isLoading,
  isVerifying = false,
  errorMessage,
  claimReady = false,
  claimError,
  isClaiming = false,
  cooldownSeconds,
  onAnswerChange,
  onVerify,
  onRefresh,
  onClaim,
  onGoAirdrop,
}: CaptchaTabProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(cooldownSeconds)
  const isCoolingDown = remainingSeconds > 0

  useEffect(() => {
    setRemainingSeconds(cooldownSeconds)
  }, [cooldownSeconds])

  useEffect(() => {
    if (!isCoolingDown) return
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [isCoolingDown])

  const formattedCountdown = useMemo(() => {
    const total = Math.max(0, remainingSeconds)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }, [remainingSeconds])

  if (isCoolingDown) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border-4 border-border bg-card p-4 shadow-[4px_4px_0px_#000]">
          <p className="text-xs text-secondary">CAPTCHA COOLDOWN</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-4 border-border bg-background p-6 shadow-[4px_4px_0px_#000]">
            <Clock className="h-8 w-8 text-primary" />
            <p className="text-2xl font-black text-primary">
              {formattedCountdown}
            </p>
            <p className="text-[10px] text-secondary">
              COME BACK FOR THE NEXT CHALLENGE
            </p>
          </div>
          <Button
            className="mt-4 w-full uppercase"
            style={pixelButtonStyle}
            onClick={onGoAirdrop}
          >
            CHECK AIRDROP
          </Button>
        </div>
      </section>
    )
  }

  if (claimReady) {
    return (
      <section className="space-y-4">
        <div className="rounded-xl border-4 border-border bg-card p-4 text-center shadow-[4px_4px_0px_#000]">
          <p className="text-xs text-secondary">VERIFIED HUMAN</p>
          <div className="mt-4 rounded-xl border-4 border-border bg-background p-6 shadow-[4px_4px_0px_#000]">
            <p className="text-lg font-black text-primary">CLAIM 100 PTS</p>
            <p className="mt-2 text-[10px] text-secondary">
              YOUR CAPTCHA CHECK IS COMPLETE.
            </p>
          </div>
          {claimError ? (
            <p className="mt-3 text-[10px] text-secondary">
              ERROR: {claimError}
            </p>
          ) : null}
          <Button
            className="mt-4 w-full uppercase"
            style={pixelButtonStyle}
            onClick={onClaim}
            disabled={isClaiming}
          >
            {isClaiming ? 'CLAIMING...' : 'CLAIM PTS NOW'}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border-4 border-border bg-card p-4 shadow-[4px_4px_0px_#000]">
        <p className="text-xs text-secondary">CAPTCHA CHALLENGE</p>
        <p className="mt-2 text-[10px] text-primary">
          SECURE UNIQUE CAPTCHA. TYPE THE CODE TO VERIFY.
        </p>
        <div className="mt-3 rounded-xl border-4 border-border bg-background p-3 shadow-[4px_4px_0px_#000]">
          {challengeImage ? (
            <img
              src={challengeImage}
              alt="captcha"
              className="mx-auto w-full rounded-lg"
            />
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-border text-[10px] text-secondary">
              LOADING CAPTCHA...
            </div>
          )}
        </div>
        <input
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          className="mt-3 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-foreground uppercase"
          placeholder="ENTER CODE"
        />
        {errorMessage ? (
          <p className="mt-2 text-[10px] text-secondary">
            ERROR: {errorMessage}
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-end text-[10px] text-secondary">
          <span>READY</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onVerify}
            disabled={isLoading || isVerifying || isCoolingDown}
          >
            {isVerifying ? 'VERIFYING...' : 'VERIFY'}
          </Button>
          <Button
            variant="ghost"
            className="w-full border-4 border-border text-secondary"
            style={pixelButtonStyle}
            onClick={onRefresh}
          >
            REFRESH
          </Button>
        </div>
      </div>
    </section>
  )
}
