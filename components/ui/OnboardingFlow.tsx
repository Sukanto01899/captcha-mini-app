'use client'

import { OnboardingCaptchaScreen } from '@/components/retro/OnboardingCaptchaScreen'
import { OnboardingMintScreen } from '@/components/retro/OnboardingMintScreen'
import { OnboardingScoreScreen } from '@/components/retro/OnboardingScoreScreen'
import { OnboardingScreen } from '@/components/retro/OnboardingScreen'

interface OnboardingFlowProps {
  onboardingChecked: boolean
  isOnboarding: boolean
  onboardingStep: 'intro' | 'captcha' | 'scoring' | 'mint'
  onStart: () => void
  scoreLoading: boolean
  scoreError: string | null
  challengeImage?: string
  answer: string
  isLoading: boolean
  isVerifying: boolean
  captchaError: string | null
  onAnswerChange: (value: string) => void
  onSolve: () => void
  onRefresh: () => void
  displayName?: string
  username?: string
  pfp?: string
  humanScore?: number
  humanIdPreview: string
  isMinting: boolean
  mintError: string | null
  walletConnected: boolean
  isCorrectNetwork: boolean
  isConnecting: boolean
  isSwitching: boolean
  onConnectWallet: () => void
  onSwitchNetwork?: () => void
  onMint: () => void
  onSkip: () => void
}

export function OnboardingFlow({
  onboardingChecked,
  isOnboarding,
  onboardingStep,
  onStart,
  scoreLoading,
  scoreError,
  challengeImage,
  answer,
  isLoading,
  isVerifying,
  captchaError,
  onAnswerChange,
  onSolve,
  onRefresh,
  displayName,
  username,
  pfp,
  humanScore,
  humanIdPreview,
  isMinting,
  mintError,
  walletConnected,
  isCorrectNetwork,
  isConnecting,
  isSwitching,
  onConnectWallet,
  onSwitchNetwork,
  onMint,
  onSkip,
}: OnboardingFlowProps) {
  if (!onboardingChecked || !isOnboarding) {
    return null
  }

  if (onboardingStep === 'intro') {
    return (
      <OnboardingScreen
        onStart={onStart}
        isLoading={scoreLoading}
        errorMessage={scoreError}
      />
    )
  }

  if (onboardingStep === 'captcha') {
    return (
      <OnboardingCaptchaScreen
        image={challengeImage}
        answer={answer}
        isLoading={isLoading}
        isVerifying={isVerifying}
        errorMessage={captchaError}
        onAnswerChange={onAnswerChange}
        onSolve={onSolve}
        onRefresh={onRefresh}
      />
    )
  }

  if (onboardingStep === 'scoring') {
    return <OnboardingScoreScreen />
  }

  return (
    <OnboardingMintScreen
      displayName={displayName}
      username={username}
      pfp={pfp}
      humanScore={humanScore}
      humanIdPreview={humanIdPreview}
      isMinting={isMinting}
      errorMessage={mintError}
      walletConnected={walletConnected}
      isCorrectNetwork={isCorrectNetwork}
      isConnecting={isConnecting}
      isSwitching={isSwitching}
      onConnectWallet={onConnectWallet}
      onSwitchNetwork={onSwitchNetwork}
      onMint={onMint}
      onSkip={onSkip}
    />
  )
}
