'use client'

import { useFrame } from '@/app/providers/farcaster-provider'
import { SafeAreaContainer } from '@/app/providers/safe-area-container'
import { App, LoadingPage } from '@/components/ui'
import { Toaster } from 'react-hot-toast'

export default function Home() {
  const { context, isLoading, isSDKLoaded } = useFrame()

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <LoadingPage />
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
          <h1 className="text-3xl font-bold text-center">
            No farcaster SDK found, please use this miniapp in the farcaster app
          </h1>
        </div>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <div className="h-[100svh] overflow-hidden bg-background">
        <App />
        <Toaster position="top-center" />
      </div>
    </SafeAreaContainer>
  )
}
