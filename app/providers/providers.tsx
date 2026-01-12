'use client'

import { FrameProvider } from '@/app/providers/farcaster-provider'
import { WalletProvider } from '@/app/providers/wallet-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <FrameProvider>{children}</FrameProvider>
    </WalletProvider>
  )
}
