import type { ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  actionSlot?: ReactNode
  children: ReactNode
}

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  actionSlot,
  children,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-fuchsia-500/30 bg-slate-900/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_rgba(59,130,246,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-slate-300">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </Button>
        </div>
        <div className="mt-4 text-slate-100">{children}</div>
        {actionSlot ? (
          <div className="mt-6 flex justify-end gap-3">{actionSlot}</div>
        ) : null}
      </div>
    </div>
  )
}
