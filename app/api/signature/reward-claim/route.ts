import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";

const CHAIN_ID = 8453;
const DOMAIN_NAME = "CaptchaReward";
const DOMAIN_VERSION = "1";

export async function POST(request: NextRequest) {
  const { userAddress } = await request.json();
  const fidHeader = request.headers.get("x-fid");

  if (!userAddress || !fidHeader) {
    return NextResponse.json(
      { error: "Invalid input", isSuccess: false },
      { status: 400 }
    );
  }

  const fid = Number(fidHeader);
  if (!fid || Number.isNaN(fid)) {
    return NextResponse.json(
      { error: "Invalid fid", isSuccess: false },
      { status: 400 }
    );
  }

  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
  const REWARD_CLAIM_CONTRACT = process.env.REWARD_CLAIM_CONTRACT;
  const REWARD_AMOUNT = process.env.REWARD_AMOUNT;

  if (!SERVER_PRIVATE_KEY || !REWARD_CLAIM_CONTRACT || !REWARD_AMOUNT) {
    return NextResponse.json(
      { error: "Server configuration error", isSuccess: false },
      { status: 500 }
    );
  }

  try {
    const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);
    const nonce = BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000));
    const amount = BigInt(REWARD_AMOUNT);

    const signature = await account.signTypedData({
      domain: {
        name: DOMAIN_NAME,
        version: DOMAIN_VERSION,
        chainId: CHAIN_ID,
        verifyingContract: REWARD_CLAIM_CONTRACT as `0x${string}`,
      },
      types: {
        Claim: [
          { name: "to", type: "address" },
          { name: "fid", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "amount", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Claim",
      message: {
        to: userAddress as `0x${string}`,
        fid: BigInt(fid),
        nonce,
        amount,
        deadline,
      },
    });

    return NextResponse.json(
      {
        signature,
        fid,
        nonce: nonce.toString(),
        amount: amount.toString(),
        deadline: deadline.toString(),
        isSuccess: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reward claim signature error:", error);
    return NextResponse.json(
      { error: "Unauthorized", isSuccess: false },
      { status: 401 }
    );
  }
}
