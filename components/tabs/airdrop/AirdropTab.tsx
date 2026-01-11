"use client";

import { Button } from "@/components/common/Button";

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

export function AirdropTab() {
  return (
    <div className="space-y-2 rounded-xl border-4 border-border bg-card p-4 text-[10px] text-primary shadow-[4px_4px_0px_#000]">
      <p className="text-xs text-secondary">AIRDROP</p>
      <p>Complete captchas to qualify for the retro drop.</p>
      <Button className="w-full" style={pixelButtonStyle}>
        CHECK STATUS
      </Button>
    </div>
  );
}
