import { useCallback, useEffect, useState } from 'react'

type UserState = {
  onboarded: boolean
  humanId: string | null
  humanIdMinted: boolean
  points: number
  humanScore: number
}

const defaultUser: UserState = {
  onboarded: false,
  humanId: null,
  humanIdMinted: false,
  points: 0,
  humanScore: 0,
}

export function useUserData(fid?: number) {
  const [user, setUser] = useState<UserState>(defaultUser)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  const refreshUser = useCallback(async () => {
    if (!fid) {
      setUser(defaultUser)
      setOnboardingChecked(true)
      return
    }
    try {
      const res = await fetch(`/api/user?fid=${fid}`)
      const data = await res.json()
      setUser({
        onboarded: Boolean(data.onboarded),
        humanId: data.humanId ?? null,
        humanIdMinted: Boolean(data.humanIdMinted),
        points: typeof data.points === 'number' ? data.points : 0,
        humanScore: typeof data.humanScore === 'number' ? data.humanScore : 0,
      })
      setOnboardingChecked(true)
    } catch {
      setUser(defaultUser)
      setOnboardingChecked(true)
    }
  }, [fid])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const updateUser = useCallback(
    async (update: Partial<UserState>) => {
      if (!fid) return
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid, ...update }),
      })
    },
    [fid],
  )

  const setPoints = (points: number) => setUser((prev) => ({ ...prev, points }))
  const setHumanId = (humanId: string | null) =>
    setUser((prev) => ({ ...prev, humanId }))
  const setOnboarded = (onboarded: boolean) =>
    setUser((prev) => ({ ...prev, onboarded }))
  const setHumanScore = (humanScore: number) =>
    setUser((prev) => ({ ...prev, humanScore }))

  return {
    user,
    onboardingChecked,
    refreshUser,
    updateUser,
    setPoints,
    setHumanId,
    setOnboarded,
    setHumanScore,
  }
}
