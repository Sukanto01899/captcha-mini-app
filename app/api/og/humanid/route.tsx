import { APP_NAME } from "@/lib/constants";
import humanIdAbi from "@/contracts/abi/HumanId.json";
import addresses from "@/contracts/addresses.json";
import { getNeynarUser } from "@/lib/neynar";
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

    console.log(fidParam);
    const fid =
      fidParam && fidParam !== "undefined" && fidParam !== "null"
        ? Number(fidParam)
        : null;
    const hasValidFid = Boolean(fid && !Number.isNaN(fid));

    let isMinted = false;
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
              "linear-gradient(135deg, rgba(0,0,0,0.96), rgba(8,16,12,0.98))",
            color: "#00ff41",
            fontFamily: "Inter, system-ui, sans-serif",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "6px solid #00ff41",
              padding: "36px 48px",
              textAlign: "center",
              boxShadow: "10px 10px 0px #000",
              background: "#0b0b0b",
            }}
          >
            <p
              style={{
                fontSize: "22px",
                letterSpacing: "2px",
                margin: "0 0 12px 0",
              }}
            >
              {APP_NAME.toUpperCase()}
            </p>
            <p
              style={{
                fontSize: "42px",
                margin: "0 0 16px 0",
                fontWeight: 800,
              }}
            >
              MINT YOUR HUMAN ID
            </p>
            <p
              style={{
                fontSize: "18px",
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

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top left, rgba(0,255,65,0.2), rgba(0,0,0,0.95))",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "980px",
            border: "6px solid #00ff41",
            background: "#0b0b0b",
            boxShadow: "12px 12px 0px #000",
            display: "flex",
            gap: "32px",
            padding: "36px",
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
              background: "#111",
            }}
          >
            {pfpUrl ? (
              <img
                src={pfpUrl}
                alt="profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ fontSize: "18px", color: "#00ff41" }}>NO PFP</div>
            )}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <p
              style={{
                fontSize: "18px",
                letterSpacing: "3px",
                color: "#00ff41",
              }}
            >
              HUMAN ID CARD
            </p>
            <p
              style={{
                fontSize: "46px",
                margin: 0,
                color: "#ffffff",
                fontWeight: 800,
              }}
            >
              {displayName.toUpperCase()}
            </p>
            <p
              style={{
                fontSize: "28px",
                margin: 0,
                color: "#ff004d",
                fontWeight: 700,
              }}
            >
              {displayName.toUpperCase()} {fidLabel}
            </p>
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                gap: "12px",
                alignItems: "center",
                color: "rgba(255,255,255,0.7)",
                fontSize: "18px",
              }}
            >
              <span>FID {fidLabel}</span>
              <span>-</span>
              <span>VERIFIED HUMAN</span>
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
