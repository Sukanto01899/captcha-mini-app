import { APP_NAME } from "@/lib/constants";
import humanIdAbi from "@/contracts/abi/HumanId.json";
import addresses from "@/contracts/addresses.json";
import dbConnect from "@/lib/db";
import { getNeynarUser } from "@/lib/neynar";
import { UserModel } from "@/models/User";
import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import { type Abi, createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CARD_WIDTH = 600;
const CARD_HEIGHT = 400;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get("fid");

    const fid =
      fidParam && fidParam !== "undefined" && fidParam !== "null"
        ? Number(fidParam)
        : null;
    const hasValidFid = Boolean(fid && !Number.isNaN(fid));

    let isMinted = false;
    let humanScore: number | null = null;
    if (hasValidFid) {
      try {
        const rpcUrl =
          process.env.ALCHEMY_RPC_URL || "https://mainnet.base.org";
        const client = createPublicClient({
          chain: base,
          transport: http(rpcUrl),
        });
        const humanId = await client.readContract({
          address: addresses.base.HumanId as `0x${string}`,
          abi: humanIdAbi as Abi,
          functionName: "humanIdOf",
          args: [BigInt(fid as number)],
        });
        isMinted = typeof humanId === "string" && humanId.length > 0;
      } catch (error) {
        console.error("HumanID OG onchain read failed:", error);
      }
    }

    if (hasValidFid) {
      try {
        await dbConnect();
        const user = await UserModel.findOne({ fid }).lean();
        humanScore =
          typeof user?.humanScore === "number" ? user.humanScore : null;
      } catch (error) {
        console.error("HumanID OG score lookup failed:", error);
      }
    }

    let neynarUser = null;
    if (hasValidFid) {
      try {
        neynarUser = await getNeynarUser(fid as number);
      } catch (error) {
        console.error("HumanID OG neynar fetch failed:", error);
      }
    }
    const displayName =
      neynarUser?.display_name ||
      neynarUser?.username ||
      searchParams.get("name") ||
      "FARCASTER USER";
    const pfpUrl = neynarUser?.pfp_url || searchParams.get("image") || "";

    const fontUrl = new URL("/Inter.ttf", request.nextUrl.origin);
    if (
      fontUrl.protocol === "https:" &&
      (fontUrl.hostname === "localhost" || fontUrl.hostname === "127.0.0.1")
    ) {
      fontUrl.protocol = "http:";
    }

    let interFontData: ArrayBuffer | null = null;
    try {
      interFontData = await fetch(fontUrl.toString()).then((res) =>
        res.arrayBuffer(),
      );
    } catch (err) {
      console.error("HumanID OG font fetch failed:", err);
    }

    if (!isMinted) {
      return new ImageResponse(
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at top left, rgba(0,255,65,0.25), rgba(0,0,0,0.95))",
            color: "#00ff41",
            fontFamily: "Inter, system-ui, sans-serif",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "24px",
              border: "2px dashed rgba(0,255,65,0.35)",
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "6px solid #00ff41",
              padding: "36px 48px",
              textAlign: "center",
              boxShadow: "12px 12px 0px #000",
              background: "rgba(11,11,11,0.92)",
            }}
          >
            <p
              style={{
                fontSize: "20px",
                letterSpacing: "2px",
                margin: "0 0 12px 0",
              }}
            >
              {APP_NAME.toUpperCase()}
            </p>
            <p
              style={{
                fontSize: "40px",
                margin: "0 0 16px 0",
                fontWeight: 800,
              }}
            >
              MINT YOUR HUMAN ID
            </p>
            <p
              style={{
                fontSize: "16px",
                margin: 0,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              VERIFY YOURSELF IN THE RETRO CAPTCHA ARCADE
            </p>
          </div>
        </div>,
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          fonts: interFontData
            ? [{ name: "Inter", data: interFontData, style: "normal" }]
            : [],
        },
      );
    }

    const fidLabel = hasValidFid ? `#${fid}` : "#----";
    const scoreValue = Math.max(0, Math.min(100, humanScore ?? 0));
    const scoreLabel =
      scoreValue >= 85
        ? "ELITE"
        : scoreValue >= 60
          ? "TRUSTED"
          : scoreValue >= 40
            ? "VERIFIED"
            : "RISK";

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(4,10,8,0.98), rgba(0,0,0,0.95))",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "32px",
          position: "relative",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "18px",
            border: "2px solid rgba(0,255,65,0.25)",
            display: "flex",
          }}
        />
        <div
          style={{
            width: "100%",
            maxWidth: "980px",
            border: "6px solid #00ff41",
            background: "rgba(11,11,11,0.9)",
            boxShadow: "14px 14px 0px #000",
            display: "flex",
            gap: "28px",
            padding: "28px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "180px",
              height: "220px",
              border: "4px solid #00ff41",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0f0f0f",
              position: "relative",
            }}
          >
            {pfpUrl ? (
              <img
                src={pfpUrl}
                alt="profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ fontSize: "16px", color: "#00ff41" }}>NO PFP</div>
            )}
            <div
              style={{
                position: "absolute",
                right: "-14px",
                top: "-14px",
                background: "#ff004d",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                padding: "6px 10px",
                border: "2px solid #000",
              }}
            >
              MINTED
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  letterSpacing: "3px",
                  color: "#00ff41",
                  margin: 0,
                }}
              >
                HUMAN ID CARD
              </p>
              <div
                style={{
                  fontSize: "12px",
                  color: "#00ff41",
                  border: "1px solid rgba(0,255,65,0.5)",
                  padding: "4px 10px",
                }}
              >
                {fidLabel}
              </div>
            </div>
            <p
              style={{
                fontSize: "36px",
                margin: 0,
                color: "#ffffff",
                fontWeight: 800,
              }}
            >
              {displayName.toUpperCase()}
            </p>

            <div
              style={{
                marginTop: "6px",
                padding: "12px 14px",
                border: "2px solid #00ff41",
                background: "rgba(0,255,65,0.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "#c9ffd8" }}>
                  HUMAN SCORE
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#0b0b0b",
                    background: "#00ff41",
                    padding: "2px 8px",
                    fontWeight: 700,
                  }}
                >
                  {scoreLabel}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  marginTop: "6px",
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: 800 }}>
                  {scoreValue}
                </span>
                <span style={{ fontSize: "12px", color: "#c9ffd8" }}>
                  / 100
                </span>
              </div>
              <div
                style={{
                  marginTop: "8px",
                  height: "8px",
                  border: "1px solid #00ff41",
                  background: "#0b0b0b",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${scoreValue}%`,
                    background: "#00ff41",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>,
      {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        fonts: interFontData
          ? [{ name: "Inter", data: interFontData, style: "normal" }]
          : [],
      },
    );
  } catch (error) {
    console.error("HumanID OG error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
