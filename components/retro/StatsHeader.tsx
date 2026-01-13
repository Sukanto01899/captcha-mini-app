'use client'

import { Sparkles, Zap } from 'lucide-react'

interface StatsHeaderProps {
  fid?: number
  displayName?: string
  pfp?: string
  points: number
  walletConnected: boolean
  walletAddress?: string
  isCorrectNetwork: boolean
  onSwitchChain?: () => void
  onConnectWallet?: () => void
  isConnecting?: boolean
}

export function StatsHeader({
  fid,
  displayName,
  pfp,
  points,
  walletConnected,
  walletAddress,
  isCorrectNetwork,
  onSwitchChain,
  onConnectWallet,
  isConnecting = false,
}: StatsHeaderProps) {
  return (
    <header className="rounded-xl border-4 border-border bg-card p-4 shadow-[4px_4px_0px_#000]">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-3 flex-1">
          {pfp ? (
            <img
              src={pfp}
              alt="profile"
              className="h-12 w-12 rounded-md border-2 border-border object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-border bg-background text-[10px] text-secondary">
              NO PFP
            </div>
          )}
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] text-secondary truncate max-w-[140px]">
              {displayName || 'UNKNOWN'}
            </p>
            <p className="text-sm text-primary">{fid ?? '--'}</p>
            <p className="text-[10px] text-secondary max-w-[100px] truncate">
              {walletConnected
                ? walletAddress || 'WALLET CONNECTED'
                : 'WALLET DISCONNECTED'}
            </p>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2 shrink-0">
          <div className="rounded-md border-2 border-border bg-background px-2 py-1 text-[10px] text-primary">
            PTS {points}
          </div>
          {!walletConnected ? (
            <button
              type="button"
              className="rounded-full border-2 border-border bg-card px-3 py-1 text-[10px] text-primary shadow-[2px_2px_0px_#000]"
              onClick={onConnectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          ) : null}
          {!isCorrectNetwork && walletConnected ? (
            <button
              type="button"
              className="rounded-md border-2 border-border bg-secondary text-secondary-foreground px-2 py-1 text-[10px] shadow-md hover:shadow-none transition hover:translate-y-1 active:translate-y-2 active:translate-x-1"
              onClick={onSwitchChain}
            >
              SWITCH TO BASE
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
