'use client'

interface AdminTabProps {
  fid?: number
  poolAmount: string
  claimAmount: string
  minPoints: number
  minHumanScore: number
  maxClaimsPerUser: number
  requireHumanId: boolean
  paused: boolean
  onUpdateConfig: (
    update: Partial<{
      poolAmount: string
      claimAmount: string
      minPoints: number
      minHumanScore: number
      maxClaimsPerUser: number
      requireHumanId: boolean
      paused: boolean
    }>,
  ) => void
  onSave: () => void
  isSaving?: boolean
  errorMessage?: string | null
  successMessage?: string | null
}

export function AdminTab({
  fid,
  poolAmount,
  claimAmount,
  minPoints,
  minHumanScore,
  maxClaimsPerUser,
  requireHumanId,
  paused,
  onUpdateConfig,
  onSave,
  isSaving = false,
  errorMessage,
  successMessage,
}: AdminTabProps) {
  return (
    <div className="rounded-2xl border-4 border-border bg-card p-4 text-[10px] text-primary shadow-[6px_6px_0px_#000]">
      <p className="text-xs text-secondary">ADMIN CONSOLE</p>
      <p className="mt-2">AUTHORIZED FID: {fid ?? '--'}</p>
      <p className="mt-2 text-secondary">Configure live airdrop settings.</p>

      <div className="mt-3 grid gap-3">
        <label className="grid gap-1 text-secondary">
          TOTAL POOL
          <input
            className="rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-primary"
            value={poolAmount}
            onChange={(event) =>
              onUpdateConfig({ poolAmount: event.target.value })
            }
          />
        </label>
        <label className="grid gap-1 text-secondary">
          CLAIM AMOUNT
          <input
            className="rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-primary"
            value={claimAmount}
            onChange={(event) =>
              onUpdateConfig({ claimAmount: event.target.value })
            }
          />
        </label>
        <label className="grid gap-1 text-secondary">
          MIN PTS REQUIRED
          <input
            type="number"
            className="rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-primary"
            value={minPoints}
            onChange={(event) =>
              onUpdateConfig({ minPoints: Number(event.target.value || 0) })
            }
          />
        </label>
        <label className="grid gap-1 text-secondary">
          MIN HUMAN SCORE
          <input
            type="number"
            className="rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-primary"
            value={minHumanScore}
            onChange={(event) =>
              onUpdateConfig({ minHumanScore: Number(event.target.value || 0) })
            }
          />
        </label>
        <label className="grid gap-1 text-secondary">
          MAX CLAIMS PER USER
          <input
            type="number"
            className="rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-primary"
            value={maxClaimsPerUser}
            onChange={(event) =>
              onUpdateConfig({
                maxClaimsPerUser: Number(event.target.value || 0),
              })
            }
          />
        </label>
        <div className="flex items-center justify-between rounded-md border-2 border-border bg-background px-3 py-2 text-secondary">
          HUMAN ID REQUIRED
          <button
            type="button"
            className="rounded-md border-2 border-border bg-card px-3 py-1 text-[10px] text-primary shadow-[2px_2px_0px_#000]"
            onClick={() => onUpdateConfig({ requireHumanId: !requireHumanId })}
          >
            {requireHumanId ? 'YES' : 'NO'}
          </button>
        </div>
        <div className="flex items-center justify-between rounded-md border-2 border-border bg-background px-3 py-2 text-secondary">
          AIRDROP STATUS
          <button
            type="button"
            className="rounded-md border-2 border-border bg-card px-3 py-1 text-[10px] text-primary shadow-[2px_2px_0px_#000]"
            onClick={() => onUpdateConfig({ paused: !paused })}
          >
            {paused ? 'PAUSED' : 'LIVE'}
          </button>
        </div>
        <button
          type="button"
          className="mt-2 w-full rounded-md border-2 border-border bg-card px-3 py-2 text-[10px] text-primary shadow-[4px_4px_0px_#000]"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'SAVING...' : 'UPDATE AIRDROP'}
        </button>
        {errorMessage ? (
          <p className="text-[10px] text-secondary">ERROR: {errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="text-[10px] text-secondary">STATUS: {successMessage}</p>
        ) : null}
      </div>
    </div>
  )
}
