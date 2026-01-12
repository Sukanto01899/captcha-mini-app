import { useCallback, useEffect, useState } from 'react'

type CaptchaChallenge = {
  id: string
  prompt: string
  token: string
  image: string
}

const COOLDOWN_HOURS = 6

export function useCaptcha({
  fid,
  userAddress,
  isOnboarding,
  cooldownSeconds,
  authFetch,
  onOnboardingSolved,
  onSolved,
  onSuccess,
  onVerified,
}: {
  fid?: number
  userAddress?: `0x${string}`
  isOnboarding: boolean
  cooldownSeconds: number
  authFetch?: typeof fetch
  onOnboardingSolved: () => void | Promise<void>
  onSolved?: () => void
  onSuccess?: (claimToken?: string | null) => void
  onVerified?: (claimToken?: string | null) => Promise<string | null>
}) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null)
  const [answer, setAnswer] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [captchaError, setCaptchaError] = useState<string | null>(null)

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/captcha')
      const json = await res.json()
      setChallenge(json.challenge)
    } catch (err) {
      console.error('captcha fetch failed', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  const handleSolve = useCallback(async () => {
    if (!challenge) return
    if (!answer.trim()) {
      setCaptchaError('ENTER THE CODE FIRST.')
      return
    }
    if (!isOnboarding && cooldownSeconds > 0) {
      setCaptchaError('COOLDOWN ACTIVE.')
      return
    }
    setCaptchaError(null)
    setIsVerifying(true)

    try {
      const fetcher = authFetch ?? fetch
      const res = await fetcher('/api/captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challenge.id,
          token: challenge.token,
          answer,
          fid,
          userAddress,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setCaptchaError('CAPTCHA FAILED. TRY AGAIN.')
        setIsVerifying(false)
        return
      }

      if (isOnboarding) {
        await onOnboardingSolved()
      }
      onSuccess?.(json?.claimToken ?? null)
      if (onVerified) {
        const claimError = await onVerified(json?.claimToken ?? null)
        if (claimError) {
          setCaptchaError(claimError)
        }
      }
      onSolved?.()

      setAnswer('')
    } catch (err) {
      console.error(err)
      setCaptchaError('NETWORK ERROR. TRY AGAIN.')
    } finally {
      setIsVerifying(false)
    }
  }, [
    answer,
    challenge,
    fid,
    isOnboarding,
    cooldownSeconds,
    authFetch,
    onOnboardingSolved,
    onSolved,
    onSuccess,
    userAddress,
    onVerified,
  ])

  return {
    challenge,
    answer,
    setAnswer,
    isLoading,
    isVerifying,
    captchaError,
    setCaptchaError,
    fetchChallenge,
    handleSolve,
  }
}
