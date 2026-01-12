'use client'

import { Button } from '@/components/common/Button'

const pixelButtonStyle = { boxShadow: '4px 4px 0px #000' } as const

interface OnboardingMintScreenProps {
  displayName?: string
  username?: string
  pfp?: string
  humanScore?: number
  humanIdPreview: string
  isMinting: boolean
  errorMessage?: string | null
  walletConnected?: boolean
  isCorrectNetwork?: boolean
  isConnecting?: boolean
  isSwitching?: boolean
  onConnectWallet?: () => void
  onSwitchNetwork?: () => void
  onMint: () => void
  onSkip: () => void
}

export function OnboardingMintScreen({
  displayName,
  username,
  pfp,
  humanScore,
  humanIdPreview,
  isMinting,
  errorMessage,
  walletConnected = false,
  isCorrectNetwork = true,
  isConnecting = false,
  isSwitching = false,
  onConnectWallet,
  onSwitchNetwork,
  onMint,
  onSkip,
}: OnboardingMintScreenProps) {
  const canMint = walletConnected && isCorrectNetwork

  return (
    <div className="flex h-screen flex-col justify-between bg-background px-4 py-6 text-center">
      <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border-4 border-border bg-card p-6 shadow-[0_0_0_4px_#000]">
        <p className="text-sm text-primary">HUMAN ID READY</p>
        <p className="text-[10px] text-secondary">
          MINT YOUR ONCHAIN HUMAN CARD
        </p>
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
                {displayName || 'UNKNOWN'} @{username || 'anon'}
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-md border-2 border-border bg-card p-3 text-[10px] text-secondary">
            <p className="text-primary">HUMAN SCORE: {humanScore ?? 0}</p>
          </div>
        </div>
        {errorMessage ? (
          <p className="text-[10px] text-secondary">ERROR: {errorMessage}</p>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-md grid gap-2">
        {!walletConnected ? (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onConnectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
          </Button>
        ) : null}
        {walletConnected && !isCorrectNetwork ? (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onSwitchNetwork}
            disabled={isSwitching}
          >
            {isSwitching ? 'SWITCHING...' : 'SWITCH TO BASE'}
          </Button>
        ) : null}
        <Button
          className="w-full uppercase"
          style={pixelButtonStyle}
          onClick={onMint}
          disabled={!canMint || isMinting}
        >
          {isMinting ? 'MINTING...' : 'MINT HUMAN ID NOW'}
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
  )
}
