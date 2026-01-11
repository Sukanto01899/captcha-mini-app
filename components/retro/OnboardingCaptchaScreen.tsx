"use client";

import { Button } from "@/components/common/Button";

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

interface OnboardingCaptchaScreenProps {
  image?: string;
  answer: string;
  isLoading: boolean;
  onAnswerChange: (value: string) => void;
  onSolve: () => void;
  onRefresh: () => void;
}

export function OnboardingCaptchaScreen({
  image,
  answer,
  isLoading,
  onAnswerChange,
  onSolve,
  onRefresh,
}: OnboardingCaptchaScreenProps) {
  return (
    <div className="flex h-screen flex-col justify-between bg-background px-4 py-6 text-center">
      <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border-4 border-border bg-card p-6 shadow-[0_0_0_4px_#000]">
        <p className="text-sm text-primary">UNIQUE CAPTCHA</p>
        <p className="text-[10px] text-secondary">
          TYPE THE CHARACTERS SHOWN TO VERIFY HUMAN
        </p>
        <div className="rounded-xl border-4 border-border bg-background p-3 shadow-[4px_4px_0px_#000]">
          {image ? (
            <img src={image} alt="captcha" className="mx-auto w-full rounded-lg" />
          ) : (
            <div className="h-28 w-full rounded-lg border-2 border-dashed border-border text-[10px] text-secondary flex items-center justify-center">
              LOADING CAPTCHA...
            </div>
          )}
        </div>
        <input
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          className="w-full rounded-md border-2 border-border bg-background px-3 py-2 text-xs text-foreground uppercase"
          placeholder="ENTER CODE"
        />
      </div>

      <div className="mx-auto w-full max-w-md grid gap-2">
        <Button className="w-full uppercase" style={pixelButtonStyle} onClick={onSolve} disabled={isLoading}>
          VERIFY CAPTCHA
        </Button>
        <Button
          variant="ghost"
          className="w-full border-4 border-border text-secondary"
          style={pixelButtonStyle}
          onClick={onRefresh}
        >
          NEW CAPTCHA
        </Button>
      </div>
    </div>
  );
}
