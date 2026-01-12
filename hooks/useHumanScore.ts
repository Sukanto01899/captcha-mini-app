import { useCallback, useState } from 'react'

export function useHumanScore(fid?: number, onScore?: (score: number) => void) {
  const [scoreLoading, setScoreLoading] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)

  const refreshScore = useCallback(async () => {
    setScoreLoading(true)
    setScoreError(null)
    if (!fid) {
      setScoreLoading(false)
      return false
    }
    try {
      const res = await fetch('/api/user/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid }),
      })
      if (!res.ok) {
        throw new Error('Failed to load score')
      }
      const data = await res.json()
      const score = typeof data.humanScore === 'number' ? data.humanScore : 0
      onScore?.(score)
      setScoreLoading(false)
      return true
    } catch (error) {
      console.error('human score fetch failed', error)
      setScoreError('SCORE UNAVAILABLE. TRY AGAIN.')
      setScoreLoading(false)
      return false
    }
  }, [fid, onScore])

  return { scoreLoading, scoreError, refreshScore, setScoreError }
}
