import { useCallback, useEffect, useState } from 'react'

type AirdropConfig = {
  tokenName: string
  poolAmount: string
  claimAmount: string
  minPoints: number
  minHumanScore: number
  maxClaimsPerUser: number
  requireHumanId: boolean
  paused: boolean
}

export function useAirdropConfig(authFetch: typeof fetch) {
  const [config, setConfig] = useState<AirdropConfig>({
    tokenName: '',
    poolAmount: '0',
    claimAmount: '0',
    minPoints: 0,
    minHumanScore: 0,
    maxClaimsPerUser: 1,
    requireHumanId: false,
    paused: false,
  })
  const [draft, setDraft] = useState<AirdropConfig | null>(null)
  const [saveState, setSaveState] = useState<{
    isSaving: boolean
    error: string | null
    success: boolean
  }>({ isSaving: false, error: null, success: false })

  const isUintString = useCallback((value: string) => {
    const trimmed = value.trim()
    return trimmed.length > 0 && /^\d+$/.test(trimmed)
  }, [])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await authFetch('/api/airdrop/config')
      if (!res.ok) return
      const data = await res.json()
      const nextConfig: AirdropConfig = {
        tokenName: data.tokenName ?? '',
        poolAmount: data.poolAmount ?? '0',
        claimAmount: data.claimAmount ?? '0',
        minPoints: typeof data.minPoints === 'number' ? data.minPoints : 0,
        minHumanScore: data.minScore ?? 0,
        maxClaimsPerUser: data.maxClaimsPerUser ?? 1,
        requireHumanId: data.requireHumanId ?? false,
        paused: Boolean(data.paused),
      }
      setConfig(nextConfig)
      setDraft(nextConfig)
    } catch (error) {
      console.error('airdrop config fetch failed', error)
    }
  }, [authFetch])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateDraft = useCallback(
    (update: Partial<AirdropConfig>) => {
      setDraft((prev) => ({ ...(prev ?? config), ...update }))
    },
    [config],
  )

  const saveConfig = useCallback(async () => {
    if (!draft) return
    setSaveState({ isSaving: true, error: null, success: false })
    try {
      if (!isUintString(draft.poolAmount)) {
        setSaveState({
          isSaving: false,
          error: 'POOL AMOUNT MUST BE A WHOLE NUMBER',
          success: false,
        })
        return
      }
      if (!isUintString(draft.claimAmount)) {
        setSaveState({
          isSaving: false,
          error: 'CLAIM AMOUNT MUST BE A WHOLE NUMBER',
          success: false,
        })
        return
      }
      const payload = {
        tokenName: draft.tokenName,
        poolAmount: draft.poolAmount,
        claimAmount: draft.claimAmount,
        minPoints: draft.minPoints,
        minScore: draft.minHumanScore,
        maxClaimsPerUser: draft.maxClaimsPerUser,
        requireHumanId: draft.requireHumanId,
        paused: draft.paused,
      }
      const res = await authFetch('/api/airdrop/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message =
          typeof data?.error === 'string' ? data.error : 'SAVE FAILED'
        setSaveState({ isSaving: false, error: message, success: false })
        return
      }
      setConfig(draft)
      setSaveState({ isSaving: false, error: null, success: true })
    } catch (error) {
      console.error('airdrop config save failed', error)
      setSaveState({ isSaving: false, error: 'SAVE FAILED', success: false })
    }
  }, [authFetch, draft, isUintString])

  return { config, draft, updateDraft, saveConfig, saveState }
}
