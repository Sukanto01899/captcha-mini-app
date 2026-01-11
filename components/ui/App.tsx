"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useFrame } from "@/app/providers/farcaster-provider";
import { APP_URL } from "@/lib/constants";
import { truncateAddress } from "@/lib/utils";
import { OnboardingCaptchaScreen } from "@/components/retro/OnboardingCaptchaScreen";
import { OnboardingMintScreen } from "@/components/retro/OnboardingMintScreen";
import { OnboardingScreen } from "@/components/retro/OnboardingScreen";
import { StatsHeader } from "@/components/retro/StatsHeader";
import { AirdropTab, CaptchaTab, ProfileTab } from "@/components/tabs";

type CaptchaChallenge = { id: string; prompt: string; token: string; image: string };
type TabKey = "captcha" | "profile" | "airdrop";

const DAILY_CAPTCHAS = 4;
const COOLDOWN_HOURS = 6;

export function App() {
  const { context, actions, isEthProviderAvailable } = useFrame();
  const fid = context?.user?.fid;
  const username = context?.user?.username;
  const displayName = context?.user?.displayName;
  const pfp = context?.user?.pfpUrl;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [lives, setLives] = useState<number>(DAILY_CAPTCHAS);
  const [points, setPoints] = useState<number>(0);
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [minted, setMinted] = useState(false);
  const [mintedHumanId, setMintedHumanId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"intro" | "captcha" | "mint">(
    "intro"
  );
  const [tab, setTab] = useState<TabKey>("captcha");
  const [selectedVariant, setSelectedVariant] = useState<string>("retro-grid");
  const [nextCaptchaAt, setNextCaptchaAt] = useState<string | null>(null);

  const fetchUserStatus = useCallback(async () => {
    if (!fid) {
      setIsOnboarding(true);
      setOnboardingStep("intro");
      setOnboardingChecked(true);
      return;
    }
    try {
      const res = await fetch(`/api/user?fid=${fid}`);
      const data = await res.json();
      setPoints(typeof data.points === "number" ? data.points : 0);
      setMinted(Boolean(data.humanId));
      setMintedHumanId(data.humanId || null);
      setIsOnboarding(!data.onboarded);
      if (!data.onboarded) {
        setOnboardingStep("intro");
      }
      setLives(
        typeof data.livesRemaining === "number" ? data.livesRemaining : DAILY_CAPTCHAS
      );
      setNextCaptchaAt(data.nextCaptchaAt ?? null);
      setOnboardingChecked(true);
    } catch {
      setIsOnboarding(true);
      setOnboardingStep("intro");
      setOnboardingChecked(true);
    }
  }, [fid]);

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/captcha?variant=${selectedVariant}`);
      const json = await res.json();
      setChallenge(json.challenge);
    } catch (err) {
      console.error("captcha fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVariant]);

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  const handleSolve = async () => {
    if (!challenge) return;
    if (nextCaptchaAt && new Date(nextCaptchaAt).getTime() > Date.now()) return;
    if (lives <= 0) return;

    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: challenge.id,
          token: challenge.token,
          answer,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setLives((prev) => Math.max(0, prev - 1));
        return;
      }

      const newPoints = points + 100;
      const newLives = Math.max(0, lives - 1);
      const cooldownUntil = new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000);
      setPoints(newPoints);
      setLives(newLives);
      setNextCaptchaAt(cooldownUntil.toISOString());
      setLevelUp(true);
      setTimeout(() => setLevelUp(false), 1200);
      if (isOnboarding) {
        setOnboardingStep("mint");
      }
      if (fid) {
        await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fid,
            points: newPoints,
            onboarded: false,
            livesRemaining: newLives,
            lastCaptchaAt: new Date().toISOString(),
            nextCaptchaAt: cooldownUntil.toISOString(),
          }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMint = async () => {
    if (!fid) return;
    setIsMinting(true);
    try {
      await (actions as any)?.wallet?.sendTransaction?.({
        to: "0x0000000000000000000000000000000000000000",
        value: "0x0",
      });
      const humanId =
        mintedHumanId ||
        `HUM-${fid.toString().padStart(4, "0")}-${Date.now().toString().slice(-4)}`;
      setMintedHumanId(humanId);
      setMinted(true);
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid, onboarded: true, humanId, points }),
      });
      setIsOnboarding(false);
      setTab("captcha");
    } catch (err) {
      console.error("mint failed", err);
    } finally {
      setIsMinting(false);
    }
  };

  const handleSkipOnboarding = async () => {
    if (fid) {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid, onboarded: true, points }),
      });
    }
    setIsOnboarding(false);
    setTab("captcha");
  };

  const shareCastConfig = useMemo(() => {
    if (!fid || !mintedHumanId) return null;
    return {
      text: `HUMAN ID ${mintedHumanId}. SOLVED RETRO CAPTCHA. FID ${fid}.`,
      embeds: [
        {
          path: "/api/og",
          imageUrl: async () =>
            `${APP_URL}/api/og?image=${encodeURIComponent(`${APP_URL}/icon.png`)}&fid=${fid}&humanId=${encodeURIComponent(
              mintedHumanId
            )}`,
        },
      ],
    };
  }, [fid, mintedHumanId]);

  const crtOverlay = (
    <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen">
      <div className="h-full w-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.4)_0px,rgba(0,0,0,0.4)_1px,transparent_1px,transparent_3px)]" />
    </div>
  );

  const gameOver = lives <= 0;
  const isCorrectNetwork = chainId === 8453;
  const cooldownMs = nextCaptchaAt
    ? new Date(nextCaptchaAt).getTime() - Date.now()
    : 0;
  const cooldownMinutes = Math.max(0, Math.ceil(cooldownMs / 60000));

  const tabs: { key: TabKey; label: string }[] = [
    { key: "captcha", label: "CAPTCHA" },
    { key: "airdrop", label: "AIRDROP" },
    { key: "profile", label: "PROFILE" },
  ];

  if (onboardingChecked && isOnboarding) {
    if (onboardingStep === "intro") {
      return <OnboardingScreen onStart={() => setOnboardingStep("captcha")} />;
    }
    if (onboardingStep === "captcha") {
      return (
        <OnboardingCaptchaScreen
          image={challenge?.image}
          answer={answer}
          isLoading={isLoading}
          onAnswerChange={(value) => setAnswer(value)}
          onSolve={handleSolve}
          onRefresh={fetchChallenge}
        />
      );
    }
    return (
      <OnboardingMintScreen
        displayName={displayName}
        username={username}
        pfp={pfp}
        humanIdPreview={
          mintedHumanId ||
          `HUM-${(fid ?? 0).toString().padStart(4, "0")}-${Date.now()
            .toString()
            .slice(-4)}`
        }
        isMinting={isMinting}
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
              points={points}
              lives={lives}
              maxLives={DAILY_CAPTCHAS}
              walletConnected={isConnected && Boolean(isEthProviderAvailable)}
              walletAddress={address ? truncateAddress(address) : undefined}
              isCorrectNetwork={isCorrectNetwork}
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
                lives={lives}
                cooldownMinutes={cooldownMinutes}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
                onAnswerChange={setAnswer}
                onVerify={handleSolve}
                onRefresh={fetchChallenge}
              />
            ) : null}
            {tab === "profile" ? (
              <ProfileTab
                fid={fid}
                username={username}
                displayName={displayName}
                points={points}
                lives={lives}
                maxLives={DAILY_CAPTCHAS}
                minted={minted}
                mintedHumanId={mintedHumanId}
                pfp={pfp}
                gameOver={gameOver}
                isMinting={isMinting}
                shareCastConfig={shareCastConfig}
                onMint={handleMint}
              />
            ) : null}
            {tab === "airdrop" ? <AirdropTab /> : null}
          </div>
        </div>

        <div className="border-t-4 border-border bg-background px-4 py-3 shadow-[0_-4px_0_#000]">
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
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
              LEVEL UP!
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
