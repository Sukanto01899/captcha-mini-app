'use client'

import { motion } from 'framer-motion'

export function OnboardingScoreScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-full max-w-md space-y-4 rounded-2xl border-4 border-border bg-card p-6 shadow-[0_0_0_4px_#000]">
        <p className="text-sm text-primary">SCANNING PROFILE</p>
        <p className="text-[10px] text-secondary">CALCULATING HUMAN SCORE</p>
        <div className="relative mt-4 overflow-hidden rounded-xl border-4 border-border bg-background p-4 shadow-[4px_4px_0px_#000]">
          <div className="grid gap-2">
            <div className="h-3 rounded-sm bg-secondary/40" />
            <div className="h-3 rounded-sm bg-secondary/30" />
            <div className="h-3 rounded-sm bg-secondary/20" />
            <div className="h-3 rounded-sm bg-secondary/30" />
            <div className="h-3 rounded-sm bg-secondary/40" />
          </div>
          <motion.div
            className="absolute left-0 right-0 h-6 bg-primary/20"
            initial={{ y: -10 }}
            animate={{ y: 120 }}
            transition={{
              duration: 1.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        </div>
        <div className="flex justify-center">
          <div className="flex items-center gap-2 rounded-full border-2 border-border bg-background px-4 py-2 text-[10px] text-secondary shadow-[3px_3px_0px_#000]">
            <span>ANALYZING</span>
            <span className="flex gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary/70" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary/40" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
