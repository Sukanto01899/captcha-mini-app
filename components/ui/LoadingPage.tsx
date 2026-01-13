'use client'

export function LoadingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0f] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#00ff4133,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_1px,transparent_1px,transparent_3px)]" />
      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center rounded-2xl border-4 border-border bg-card px-6 py-8 text-center shadow-[0_0_0_4px_#000]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-border bg-background shadow-[4px_4px_0px_#000]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00ff41] border-t-transparent" />
        </div>
        <p className="text-lg font-semibold tracking-wide text-primary">
          BOOTING ARCADE CORE
        </p>
        <p className="mt-2 text-[11px] text-secondary">
          INITIALIZING HUMAN-ONLY CAPTCHA SYSTEM.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-secondary">
          <span>SYNCING</span>
          <span className="flex gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary/70" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary/40" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
