"use client";

import { Button } from "@/components/common/Button";

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

interface CaptchaTabProps {
  challengeImage?: string;
  answer: string;
  isLoading: boolean;
  lives: number;
  cooldownMinutes: number;
  selectedVariant: string;
  onSelectVariant: (variant: string) => void;
  onAnswerChange: (value: string) => void;
  onVerify: () => void;
  onRefresh: () => void;
}

const CAPTCHA_VARIANTS = [
  { key: "retro-grid", label: "RETRO GRID" },
  { key: "signal-noise", label: "SIGNAL NOISE" },
  { key: "warp", label: "HYPER WARP" },
  { key: "matrix", label: "MATRIX" },
] as const;

export function CaptchaTab({
  challengeImage,
  answer,
  isLoading,
  lives,
  cooldownMinutes,
  selectedVariant,
  onSelectVariant,
  onAnswerChange,
  onVerify,
  onRefresh,
}: CaptchaTabProps) {
  const isCoolingDown = cooldownMinutes > 0;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border-4 border-border bg-card p-4 shadow-[4px_4px_0px_#000]">
        <p className="text-xs text-secondary">CAPTCHA CHALLENGE</p>
        <p className="mt-2 text-[10px] text-primary">
          SECURE UNIQUE CAPTCHA. TYPE THE CODE TO VERIFY.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
          {CAPTCHA_VARIANTS.map((variant) => (
            <button
              key={variant.key}
              className={`rounded-md border-2 px-2 py-2 font-bold ${
                selectedVariant === variant.key
                  ? "border-border bg-card text-primary"
                  : "border-border bg-background text-secondary"
              }`}
              style={pixelButtonStyle}
              onClick={() => onSelectVariant(variant.key)}
            >
              {variant.label}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-xl border-4 border-border bg-background p-3 shadow-[4px_4px_0px_#000]">
          {challengeImage ? (
            <img src={challengeImage} alt="captcha" className="mx-auto w-full rounded-lg" />
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-border text-[10px] text-secondary">
              LOADING CAPTCHA...
            </div>
          )}
        </div>
        <input
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          className="mt-3 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-foreground uppercase"
          placeholder="ENTER CODE"
        />
        <div className="mt-2 flex items-center justify-end text-[10px] text-secondary">
          {isCoolingDown ? <span>COOLDOWN: {cooldownMinutes} MIN</span> : <span>READY</span>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onVerify}
            disabled={isLoading || isCoolingDown || lives <= 0}
          >
            VERIFY
          </Button>
          <Button
            variant="ghost"
            className="w-full border-4 border-border text-secondary"
            style={pixelButtonStyle}
            onClick={onRefresh}
          >
            REFRESH
          </Button>
        </div>
      </div>
    </section>
  );
}
