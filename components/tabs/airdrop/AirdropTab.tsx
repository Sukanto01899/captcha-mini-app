"use client";

import { Button } from "@/components/common/Button";

const pixelButtonStyle = { boxShadow: "4px 4px 0px #000" } as const;

interface AirdropTabProps {
  poolAmount?: string;
  claimAmount?: string;
  claimedAmount?: string;
  minPoints?: number;
  minHumanScore?: number;
  hasHumanId?: boolean;
  requireHumanId?: boolean;
  isEligible?: boolean | null;
  eligibilityMessage?: string;
  isChecking?: boolean;
  isApproving?: boolean;
  isClaiming?: boolean;
  needsApproval?: boolean;
  alreadyClaimed?: boolean;
  fullyClaimed?: boolean;
  paused?: boolean;
  isMiniAppAdded?: boolean;
  isAddingMiniApp?: boolean;
  onAddMiniApp?: () => void;
  onCheckEligibility: () => void;
  onApprove?: () => void;
  onClaim: () => void;
}

export function AirdropTab({
  poolAmount = "0",
  claimAmount = "0",
  claimedAmount = "0",
  minPoints = 0,
  minHumanScore = 0,
  hasHumanId = false,
  requireHumanId = false,
  isEligible,
  eligibilityMessage,
  isChecking = false,
  isApproving = false,
  isClaiming = false,
  needsApproval = false,
  alreadyClaimed = false,
  fullyClaimed = false,
  paused = false,
  isMiniAppAdded = true,
  isAddingMiniApp = false,
  onAddMiniApp,
  onCheckEligibility,
  onApprove,
  onClaim,
}: AirdropTabProps) {
  if (paused) {
    return (
      <div className="rounded-2xl border-4 border-border bg-card p-4 text-center text-[10px] text-primary shadow-[6px_6px_0px_#000]">
        <p className="text-xs text-secondary">AIRDROP TERMINAL</p>
        <div className="mt-4 rounded-xl border-4 border-border bg-background p-6 shadow-[4px_4px_0px_#000]">
          <p className="text-lg font-black text-primary">NEW AIRDROP SOON</p>
          <p className="mt-2 text-[10px] text-secondary">
            STAY TUNED FOR THE NEXT DROP.
          </p>
        </div>
        {!isMiniAppAdded ? (
          <Button
            className="mt-4 w-full uppercase"
            style={pixelButtonStyle}
            onClick={onAddMiniApp}
            disabled={isAddingMiniApp}
          >
            {isAddingMiniApp ? "ADDING..." : "ADD MINI APP FOR UPDATES"}
          </Button>
        ) : null}
      </div>
    );
  }

  if (fullyClaimed) {
    return (
      <div className="rounded-2xl border-4 border-border bg-card p-4 text-center text-[10px] text-primary shadow-[6px_6px_0px_#000]">
        <p className="text-xs text-secondary">AIRDROP TERMINAL</p>
        <div className="mt-4 rounded-xl border-4 border-border bg-background p-6 shadow-[4px_4px_0px_#000]">
          <p className="text-lg font-black text-primary">
            AIRDROP FULLY CLAIMED
          </p>
          <p className="mt-2 text-[10px] text-secondary">
            WAIT FOR THE NEXT AIRDROP.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-4 border-border bg-card p-4 text-[10px] text-primary shadow-[6px_6px_0px_#000]">
      <div className="flex items-center justify-between">
        <p className="text-xs text-primary">AIRDROP TERMINAL</p>
        <span className="rounded-full border-2 border-border px-2 py-1 text-[9px] text-secondary">
          LIVE
        </span>
      </div>

      <div className="mt-3 rounded-xl border-4 border-border bg-background p-4 shadow-[4px_4px_0px_#000]">
        <div className="flex items-center justify-between text-[10px] text-secondary">
          <span>TOTAL POOL</span>
          <span className="text-primary">{poolAmount}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-secondary">
          <span>CLAIM PER</span>
          <span className="text-primary">{claimAmount}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-secondary">
          <span>CLAIMED</span>
          <span className="text-primary">{claimedAmount}</span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-[10px]">
        <div className="rounded-lg border-2 border-border bg-background px-3 py-2 text-primary">
          REQUIREMENTS
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-3 py-2 text-secondary">
            <span>PTS REQUIRED</span>
            <span className="text-primary">{minPoints}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-3 py-2 text-secondary">
            <span>MIN HUMAN SCORE</span>
            <span className="text-primary">{minHumanScore}</span>
          </div>
          {requireHumanId ? (
            <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-3 py-2 text-secondary">
              <span>HUMAN ID</span>
              <span className={hasHumanId ? "text-primary" : "text-muted"}>
                {hasHumanId ? "READY" : "MINT REQUIRED"}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card px-3 py-2 text-secondary">
              <span>HUMAN ID</span>
              <span className="text-primary">OPTIONAL</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {alreadyClaimed ? (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            disabled
          >
            ALREADY CLAIMED
          </Button>
        ) : isEligible === null ? (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onCheckEligibility}
            disabled={isChecking}
          >
            {isChecking ? "CHECKING..." : "CHECK ELIGIBILITY"}
          </Button>
        ) : isEligible && needsApproval ? (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onApprove}
            disabled={isApproving}
          >
            {isApproving ? "APPROVING..." : "APPROVE PTS"}
          </Button>
        ) : isEligible ? (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            onClick={onClaim}
            disabled={isClaiming}
          >
            {isClaiming ? "CLAIMING..." : "CLAIM AIRDROP"}
          </Button>
        ) : (
          <Button
            className="w-full uppercase"
            style={pixelButtonStyle}
            disabled
          >
            NOT ELIGIBLE
          </Button>
        )}
        {eligibilityMessage && isEligible !== null ? (
          <p className="text-center text-[10px] text-primary">
            {eligibilityMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
