"use client";

import { useFrame } from "@/app/providers/farcaster-provider";
import { StatsHeader } from "@/components/retro/StatsHeader";
import {
  AdminTab,
  AirdropTab,
  CaptchaTab,
  ProfileTab,
} from "@/components/tabs";
import { OnboardingFlow } from "@/components/ui/OnboardingFlow";
import { LoadingPage } from "@/components/ui/LoadingPage";
import airdropClaimContractAbi from "@/contracts/abi/AirdropClaim.json";
import humanIdAbi from "@/contracts/abi/HumanId.json";
import pointsClaimAbi from "@/contracts/abi/PointsClaim.json";
import addresses from "@/contracts/addresses.json";
import { useAirdrop } from "@/hooks/useAirdrop";
import { useAirdropConfig } from "@/hooks/useAirdropConfig";
import { useCaptcha } from "@/hooks/useCaptcha";
import { useHumanScore } from "@/hooks/useHumanScore";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserData } from "@/hooks/useUserData";
import { APP_OG_IMAGE_URL, APP_URL } from "@/lib/constants";
import { notificationsBtn } from "@/lib/constants";
import { truncateAddress } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Abi } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type TabKey = "captcha" | "profile" | "airdrop" | "admin";

const toSafeBigInt = (value?: string) => {
  if (typeof value !== "string") return BigInt(0);
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return BigInt(0);
  try {
    return BigInt(trimmed);
  } catch {
    return BigInt(0);
  }
};

export function App() {
  const { context, actions, isEthProviderAvailable, quickAuth } = useFrame();
  const fid = context?.user?.fid;
  const username = context?.user?.username;
  const displayName = context?.user?.displayName;
  const pfp = context?.user?.pfpUrl;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [tab, setTab] = useState<TabKey>("captcha");
  const [levelUp, setLevelUp] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [isClaimingPoints, setIsClaimingPoints] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<`0x${string}` | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [isAddingMiniApp, setIsAddingMiniApp] = useState(false);
  const [isMiniAppAdded, setIsMiniAppAdded] = useState(() =>
    Boolean(context?.client?.added),
  );
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null,
  );
  const [onboardingStep, setOnboardingStep] = useState<
    "intro" | "captcha" | "scoring" | "mint"
  >("intro");
  const [scoreUpdated, setScoreUpdated] = useState(false);

  const authFetch = useCallback(
    (...args: Parameters<typeof fetch>) =>
      quickAuth?.fetch ? quickAuth.fetch(...args) : fetch(...args),
    [quickAuth],
  );
  const isAdmin = fid === 317261;
  const humanIdAddress = addresses.base.HumanId as `0x${string}`;
  const pointsClaimAddress = addresses.base.PointsClaim as `0x${string}`;
  const airdropClaimAddress = addresses.base.AirdropClaim as `0x${string}`;
  const humanIdAbiTyped = humanIdAbi as Abi;
  const pointsClaimAbiTyped = pointsClaimAbi as Abi;
  const airdropClaimAbiTyped = airdropClaimContractAbi as Abi;
  const { data: mintPrice } = useReadContract({
    address: humanIdAddress,
    abi: humanIdAbiTyped,
    functionName: "mintPrice",
  });
  const { data: humanIdOnchain } = useReadContract({
    address: humanIdAddress,
    abi: humanIdAbiTyped,
    functionName: "humanIdOf",
    args: fid ? [BigInt(fid)] : undefined,
    chainId: 8453,
    query: { enabled: Boolean(fid) },
  });
  const { data: claimCooldown } = useReadContract({
    address: pointsClaimAddress,
    abi: pointsClaimAbiTyped,
    functionName: "claimCooldown",
  });
  const { data: lastClaimAt, refetch: refetchLastClaimAt } = useReadContract({
    address: pointsClaimAddress,
    abi: pointsClaimAbiTyped,
    functionName: "lastClaimAtByFid",
    args: fid ? [BigInt(fid)] : undefined,
    query: { enabled: Boolean(fid) },
  });
  const { data: airdropRewardPool, isLoading: isAirdropPoolLoading } =
    useReadContract({
      address: airdropClaimAddress,
      abi: airdropClaimAbiTyped,
      functionName: "rewardPool",
    });
  const { points: pointsDisplay, refetch: refetchPointsBalance } =
    useUserBalance(address);
  const { data: airdropClaimed, refetch: refetchAirdropClaimed } =
    useReadContract({
      address: airdropClaimAddress,
      abi: airdropClaimAbiTyped,
      functionName: "isClaimed",
      args: fid ? [BigInt(fid)] : undefined,
      query: { enabled: Boolean(fid) },
    });
  const {
    isLoading: isClaimPending,
    isSuccess: isClaimConfirmed,
    isError: isClaimFailed,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash ?? undefined,
    chainId: 8453,
    query: { enabled: Boolean(claimTxHash) },
  });

  const {
    user,
    onboardingChecked,
    updateUser,
    setHumanId,
    setOnboarded,
    setHumanScore,
  } = useUserData(fid);

  const isOnboarding = !user.onboarded;
  const onchainHumanId =
    typeof humanIdOnchain === "string" && humanIdOnchain.length > 0
      ? humanIdOnchain
      : null;
  const minted = Boolean(onchainHumanId || user.humanIdMinted || user.humanId);
  const mintedHumanId = onchainHumanId || user.humanId;

  const { scoreLoading, scoreError, refreshScore } = useHumanScore(
    fid,
    address,
    (score) => {
      setHumanScore(score);
      setScoreUpdated(true);
    },
  );

  const handleLevelUp = useCallback(() => {
    if (isOnboarding) return;
    setLevelUp(true);
    setTimeout(() => setLevelUp(false), 1200);
  }, [isOnboarding]);

  const {
    config: airdropConfig,
    draft,
    updateDraft,
    saveConfig,
    saveState,
  } = useAirdropConfig(authFetch);

  const {
    eligibility,
    isChecking,
    isApproving,
    isClaiming,
    claimPayload,
    approveError,
    claimError: airdropClaimError,
    checkEligibility,
    approve,
    claim,
  } = useAirdrop({
    fid,
    address,
    actions,
    authFetch,
    config: airdropConfig,
    writeContractAsync,
  });

  const handleOnboardingStart = useCallback(() => {
    setOnboardingStep("captcha");
  }, []);

  const handleSkipOnboarding = useCallback(async () => {
    if (fid) {
      await updateUser({ onboarded: true });
    }
    setOnboarded(true);
    setTab("captcha");
  }, [fid, setOnboarded, updateUser]);

  const buildHumanId = useCallback((fidValue: number) => {
    return `HUM-${fidValue}`;
  }, []);

  const handleMint = useCallback(async () => {
    if (!fid) return;
    if (!isConnected || !address || chainId !== 8453) {
      return;
    }
    setIsMinting(true);
    setMintError(null);
    try {
      const humanId = buildHumanId(fid);
      const price =
        typeof mintPrice === "bigint" ? mintPrice : BigInt(100000000000000);
      const hash = await writeContractAsync({
        address: humanIdAddress,
        abi: humanIdAbiTyped,
        functionName: "mintSelf",
        args: [BigInt(fid), humanId],
        value: price,
      });
      await publicClient?.waitForTransactionReceipt({ hash });
      const owner = await publicClient?.readContract({
        address: humanIdAddress,
        abi: humanIdAbiTyped,
        functionName: "ownerOf",
        args: [BigInt(fid)],
      });
      if (String(owner).toLowerCase() !== address.toLowerCase()) {
        throw new Error("Owner mismatch");
      }
      setHumanId(humanId);
      setOnboarded(true);
      await updateUser({ onboarded: true, humanId, humanIdMinted: true });
      if (actions?.composeCast) {
        try {
          await actions.composeCast({
            text: `I minted my Human ID. My Human Score: ${user.humanScore}.\n\n Check your score and mint your Human ID.`,
            embeds: [`${APP_URL}/share/${fid}`],
          });
        } catch (error) {
          console.error("compose cast failed", error);
        }
      }
      setIsMinting(false);
      setScoreUpdated(false);
      setTab("captcha");
    } catch (error) {
      console.error("mint failed", error);
      setMintError("MINT FAILED. TRY AGAIN.");
    } finally {
      setIsMinting(false);
    }
  }, [
    buildHumanId,
    chainId,
    fid,
    isConnected,
    address,
    mintPrice,
    setHumanId,
    setOnboarded,
    humanIdAbiTyped,
    humanIdAddress,
    publicClient,
    updateUser,
    writeContractAsync,
  ]);

  const handleAddMiniApp = useCallback(async () => {
    if (!actions?.addMiniApp) return;
    setIsAddingMiniApp(true);
    try {
      await actions.addMiniApp();
      setIsMiniAppAdded(true);
    } catch (error) {
      console.error("add miniapp failed", error);
    } finally {
      setIsAddingMiniApp(false);
    }
  }, [actions]);

  const handleSendNotification = useCallback(
    async (notification: {
      id: number;
      name: string;
      title: string;
      body: string;
    }) => {
      if (!isAdmin) return;
      setIsSendingNotification(true);
      setNotificationStatus(null);
      try {
        const res = await authFetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: notification.title,
            body: notification.body,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          const message = data?.errors
            ? "NOTIFICATION FAILED."
            : "SEND FAILED.";
          setNotificationStatus(message);
          return;
        }
        setNotificationStatus("NOTIFICATION SENT.");
      } catch (error) {
        console.error("send notification failed", error);
        setNotificationStatus("NOTIFICATION ERROR.");
      } finally {
        setIsSendingNotification(false);
      }
    },
    [authFetch, isAdmin],
  );

  const burnPointsAmount = claimPayload?.burnPoints
    ? BigInt(claimPayload.burnPoints)
    : BigInt(0);
  const { data: pointsAllowance, refetch: refetchPointsAllowance } =
    useReadContract({
      address: claimPayload?.pointsToken as `0x${string}` | undefined,
      abi: [
        {
          name: "allowance",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
          ],
          outputs: [{ type: "uint256" }],
        },
      ],
      functionName: "allowance",
      args:
        address && claimPayload?.contract
          ? [address, claimPayload.contract as `0x${string}`]
          : undefined,
      query: { enabled: Boolean(address && claimPayload?.contract) },
    });
  const needsApproval =
    burnPointsAmount > BigInt(0) &&
    (typeof pointsAllowance === "bigint" ? pointsAllowance : BigInt(0)) <
      burnPointsAmount;
  const claimAmountOnchain = toSafeBigInt(airdropConfig.claimAmount);
  const claimAmountDisplay = airdropConfig.claimAmount;
  const claimedAmountDisplay = airdropClaimed ? claimAmountDisplay : "0";
  const poolDisplay = airdropConfig.poolAmount;
  const airdropLoading = isAirdropPoolLoading;
  const fullyClaimed =
    typeof airdropRewardPool === "bigint" &&
    claimAmountOnchain > BigInt(0) &&
    airdropRewardPool < claimAmountOnchain;

  // Compose cast config for sharing Human ID
  const shareCastConfig = useMemo(() => {
    const fidValue =
      typeof fid === "number" && Number.isFinite(fid) && fid > 0 ? fid : null;
    if (!fidValue || !mintedHumanId) return null;
    return {
      text: `Just minted my Human ID: ${mintedHumanId}. ✅\n\nCheck your Human Score and mint yours now`,
      bestFriends: true,
      embeds: [`${APP_URL}/share/${fidValue}`],
    };
  }, [fid, mintedHumanId]);

  const isCorrectNetwork = chainId === 8453;
  const lastClaimAtSeconds =
    typeof lastClaimAt === "bigint" ? Number(lastClaimAt) : 0;
  const cooldownSecondsValue =
    typeof claimCooldown === "bigint" ? Number(claimCooldown) : 0;
  const cooldownSeconds = Math.max(
    0,
    lastClaimAtSeconds + cooldownSecondsValue - Math.floor(nowTick / 1000),
  );

  const {
    challenge,
    answer,
    setAnswer,
    isLoading,
    isVerifying,
    captchaError,
    setCaptchaError,
    fetchChallenge,
    handleSolve,
  } = useCaptcha({
    fid,
    userAddress: address,
    isOnboarding,
    cooldownSeconds,
    authFetch,
    onOnboardingSolved: async () => {
      setOnboardingStep("scoring");
      const ok = await refreshScore();
      if (ok === false) {
        setOnboardingStep("intro");
        return;
      }
      setOnboardingStep("mint");
    },
    onSuccess: (token) => {
      if (isOnboarding) return;
      setClaimToken(token ?? null);
      setClaimError(null);
    },
    onSolved: handleLevelUp,
  });

  const handleClaimPoints = useCallback(async () => {
    if (!claimToken) return;
    if (claimTxHash) return;
    if (!address) {
      setClaimError("CONNECT WALLET.");
      return;
    }
    if (chainId !== 8453) {
      setClaimError("SWITCH TO BASE MAINNET.");
      return;
    }
    setIsClaimingPoints(true);
    setClaimError(null);
    try {
      const res = await authFetch("/api/signature/points-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress: address, claimToken }),
      });
      const data = await res.json();
      if (!res.ok || !data?.isSuccess) {
        const message = data?.error
          ? String(data.error).toUpperCase()
          : "CLAIM UNAVAILABLE.";
        setClaimError(message);
        setClaimToken(null);
        setCaptchaError(message);
        return;
      }
      const hash = await writeContractAsync({
        address: pointsClaimAddress,
        abi: pointsClaimAbiTyped,
        functionName: "claim",
        args: [
          BigInt(data.fid),
          BigInt(data.nonce),
          BigInt(data.amount),
          BigInt(data.deadline),
          data.signature,
        ],
      });
      setClaimTxHash(hash);
    } catch (error) {
      console.error("points claim failed", error);
      setClaimError("CLAIM FAILED.");
      setClaimToken(null);
      setCaptchaError("CLAIM FAILED.");
    } finally {
      setIsClaimingPoints(false);
    }
  }, [
    address,
    authFetch,
    chainId,
    claimTxHash,
    claimToken,
    pointsClaimAbiTyped,
    pointsClaimAddress,
    setCaptchaError,
    writeContractAsync,
  ]);

  useEffect(() => {
    if (!claimTxHash) return;
    if (isClaimConfirmed) {
      refetchPointsBalance();
      refetchLastClaimAt();
      setClaimToken(null);
      setClaimTxHash(null);
      return;
    }
    if (isClaimFailed) {
      setClaimError("CLAIM FAILED.");
      setCaptchaError("CLAIM FAILED.");
      setClaimTxHash(null);
    }
  }, [
    claimTxHash,
    isClaimConfirmed,
    isClaimFailed,
    refetchLastClaimAt,
    refetchPointsBalance,
    setCaptchaError,
  ]);

  useEffect(() => {
    if (!mintError) return;
    if (isConnected && isCorrectNetwork) {
      setMintError(null);
    }
  }, [isConnected, isCorrectNetwork, mintError]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (context?.client?.added) {
      setIsMiniAppAdded(true);
    }
  }, [context?.client?.added]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "captcha", label: "EARN PTS" },
    { key: "airdrop", label: "AIRDROP" },
    { key: "profile", label: "PROFILE" },
  ];

  const visibleTabs = isAdmin
    ? [...tabs, { key: "admin" as const, label: "ADMIN" }]
    : tabs;

  const crtOverlay = (
    <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen">
      <div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.4)_0px,rgba(0,0,0,0.4)_1px,transparent_1px,transparent_3px)]" />
    </div>
  );

  const humanIdPreview = mintedHumanId || buildHumanId(fid ?? 0);

  const handleOnboardingAnswerChange = useCallback(
    (value: string) => {
      setAnswer(value);
      if (captchaError) {
        setCaptchaError(null);
      }
    },
    [captchaError, setCaptchaError, setAnswer],
  );

  if (!onboardingChecked) {
    return <LoadingPage />;
  }

  if (isOnboarding) {
    return (
      <OnboardingFlow
        onboardingChecked={onboardingChecked}
        isOnboarding={isOnboarding}
        onboardingStep={onboardingStep}
        onStart={handleOnboardingStart}
        scoreLoading={scoreLoading}
        scoreError={scoreError}
        challengeImage={challenge?.image}
        answer={answer}
        isLoading={isLoading}
        isVerifying={isVerifying}
        captchaError={captchaError}
        onAnswerChange={handleOnboardingAnswerChange}
        onSolve={handleSolve}
        onRefresh={fetchChallenge}
        displayName={displayName}
        username={username}
        pfp={pfp}
        humanScore={user.humanScore}
        humanIdPreview={humanIdPreview}
        isMinting={isMinting}
        mintError={mintError}
        walletConnected={isConnected && Boolean(isEthProviderAvailable)}
        isCorrectNetwork={isCorrectNetwork}
        isConnecting={isConnecting}
        isSwitching={isSwitching}
        onConnectWallet={() => {
          const connector = connectors[0];
          if (connector) {
            connect({ connector });
          }
        }}
        onSwitchNetwork={
          switchChain
            ? () =>
                switchChain({
                  chainId: 8453,
                })
            : undefined
        }
        onMint={handleMint}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <div className="relative h-[100svh] overflow-hidden bg-background px-3 py-4">
      {crtOverlay}
      <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border-4 border-border bg-background shadow-[0_0_0_4px_#000]">
        <div className="flex-1 overflow-y-auto overscroll-none px-4 py-4 scrollbar-hide">
          <div className="flex flex-col gap-4 pb-4">
            <StatsHeader
              fid={fid}
              displayName={displayName}
              pfp={pfp}
              points={pointsDisplay}
              walletConnected={isConnected && Boolean(isEthProviderAvailable)}
              walletAddress={address ? truncateAddress(address) : undefined}
              isCorrectNetwork={isCorrectNetwork}
              onConnectWallet={() => {
                const connector = connectors[0];
                if (connector) {
                  connect({ connector });
                }
              }}
              isConnecting={isConnecting}
              onSwitchChain={
                switchChain
                  ? () =>
                      switchChain({
                        chainId: 8453,
                      })
                  : undefined
              }
            />

            {tab === "captcha" ? (
              <CaptchaTab
                challengeImage={challenge?.image}
                answer={answer}
                isLoading={isLoading}
                isVerifying={isVerifying}
                errorMessage={captchaError}
                claimReady={Boolean(claimToken)}
                claimError={claimError}
                isClaiming={isClaimingPoints || isClaimPending}
                cooldownSeconds={cooldownSeconds}
                onAnswerChange={setAnswer}
                onVerify={handleSolve}
                onRefresh={() => {
                  setClaimToken(null);
                  setClaimError(null);
                  fetchChallenge();
                }}
                onClaim={handleClaimPoints}
                onGoAirdrop={() => setTab("airdrop")}
              />
            ) : null}
            {tab === "profile" ? (
              <ProfileTab
                fid={fid}
                username={username}
                displayName={displayName}
                minted={minted}
                mintedHumanId={mintedHumanId}
                pfp={pfp}
                humanScore={user.humanScore}
                isScoreLoading={scoreLoading}
                scoreError={scoreError}
                scoreUpdated={scoreUpdated}
                isMinting={isMinting}
                shareCastConfig={shareCastConfig}
                onMint={handleMint}
                onRefreshScore={refreshScore}
              />
            ) : null}
            {tab === "airdrop" ? (
              <AirdropTab
                tokenName={airdropConfig.tokenName}
                poolAmount={airdropLoading ? "LOADING..." : poolDisplay}
                claimAmount={claimAmountDisplay ?? airdropConfig.claimAmount}
                claimedAmount={claimedAmountDisplay}
                minPoints={airdropConfig.minPoints}
                minHumanScore={airdropConfig.minHumanScore}
                hasHumanId={minted}
                requireHumanId={airdropConfig.requireHumanId}
                isEligible={eligibility.eligible}
                isChecking={isChecking}
                isApproving={isApproving}
                isClaiming={isClaiming}
                needsApproval={needsApproval}
                alreadyClaimed={Boolean(airdropClaimed)}
                fullyClaimed={fullyClaimed}
                paused={airdropConfig.paused}
                eligibilityMessage={
                  approveError || airdropClaimError || eligibility.message
                }
                isMiniAppAdded={isMiniAppAdded}
                isAddingMiniApp={isAddingMiniApp}
                onAddMiniApp={handleAddMiniApp}
                onCheckEligibility={checkEligibility}
                onApprove={async () => {
                  await approve();
                  await refetchPointsAllowance();
                }}
                onClaim={async () => {
                  await claim();
                  await refetchAirdropClaimed();
                  if (actions?.composeCast && fid) {
                    try {
                      await actions.composeCast({
                        text: "Airdrop claimed on Captcha. Check your eligibility and claim yours.",
                        embeds: [`${APP_URL}/share/${fid}`],
                      });
                    } catch (error) {
                      console.error("compose cast failed", error);
                    }
                  }
                }}
              />
            ) : null}
            {tab === "admin" && isAdmin ? (
              <AdminTab
                fid={fid}
                tokenName={draft?.tokenName ?? airdropConfig.tokenName}
                poolAmount={draft?.poolAmount ?? airdropConfig.poolAmount}
                claimAmount={draft?.claimAmount ?? airdropConfig.claimAmount}
                minPoints={draft?.minPoints ?? airdropConfig.minPoints}
                minHumanScore={
                  draft?.minHumanScore ?? airdropConfig.minHumanScore
                }
                maxClaimsPerUser={
                  draft?.maxClaimsPerUser ?? airdropConfig.maxClaimsPerUser
                }
                requireHumanId={
                  draft?.requireHumanId ?? airdropConfig.requireHumanId
                }
                paused={draft?.paused ?? airdropConfig.paused}
                notifications={notificationsBtn}
                onUpdateConfig={updateDraft}
                onSave={saveConfig}
                onSendNotification={handleSendNotification}
                isSaving={saveState.isSaving}
                isSendingNotification={isSendingNotification}
                notificationStatus={notificationStatus}
                errorMessage={saveState.error}
                successMessage={saveState.success ? "UPDATED" : null}
              />
            ) : null}
          </div>
        </div>

        <div className="border-t-4 border-border bg-background px-4 py-3 shadow-[0_-4px_0_#000]">
          <div
            className={`grid gap-2 text-[10px] ${
              visibleTabs.length === 4 ? "grid-cols-4" : "grid-cols-3"
            }`}
          >
            {visibleTabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`rounded-md border-2 ${
                    active
                      ? "border-border bg-card text-primary"
                      : "border-border bg-background text-secondary"
                  } px-2 py-2 font-bold`}
                  style={{ boxShadow: "4px 4px 0px #000" }}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {levelUp ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl font-black text-primary"
            >
              SUCCESS!
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
