import pointsTokenAbi from '@/contracts/abi/PointsToken.json'
import humanIdAbi from '@/contracts/abi/HumanId.json'
import addresses from '@/contracts/addresses.json'
import dbConnect from '@/lib/db'
import { AirdropConfigModel } from '@/models/AirdropConfig'
import { UserModel } from '@/models/User'
import { type NextRequest, NextResponse } from 'next/server'
import { http, type Abi, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const CHAIN_ID = 8453
const DOMAIN_NAME = 'CaptchaAirdrop'
const DOMAIN_VERSION = '1'
const pointsTokenAbiTyped = pointsTokenAbi as Abi

export async function POST(request: NextRequest) {
  const { userAddress, fid } = (await request.json()) as {
    userAddress?: string
    fid?: number
  }
  const fidHeader = request.headers.get('x-fid')
  const headerFid = fidHeader ? Number(fidHeader) : null

  if (!userAddress || !fid) {
    return NextResponse.json(
      { eligible: false, error: 'Invalid input' },
      { status: 400 },
    )
  }

  if (!headerFid || headerFid !== fid) {
    return NextResponse.json(
      { eligible: false, error: 'FID mismatch' },
      { status: 401 },
    )
  }

  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY
  const AIRDROP_CLAIM_CONTRACT =
    process.env.AIRDROP_CLAIM_CONTRACT || addresses.base.AirdropClaim
  const POINTS_TOKEN_CONTRACT =
    process.env.POINTS_TOKEN_CONTRACT || addresses.base.PointsToken
  const AIRDROP_REWARD_AMOUNT = process.env.AIRDROP_REWARD_AMOUNT
  const AIRDROP_MIN_POINTS = process.env.AIRDROP_MIN_POINTS
  const AIRDROP_MIN_SCORE = process.env.AIRDROP_MIN_SCORE

  if (
    !SERVER_PRIVATE_KEY ||
    !AIRDROP_CLAIM_CONTRACT ||
    !POINTS_TOKEN_CONTRACT
  ) {
    return NextResponse.json({
      eligible: false,
      error: 'Airdrop not configured',
    })
  }

  await dbConnect()
  const config = await AirdropConfigModel.findOne({ key: 'active' }).lean()
  const rewardAmount = config?.claimAmount ?? AIRDROP_REWARD_AMOUNT
  const minPointsSetting =
    typeof config?.minPoints === 'number'
      ? config?.minPoints
      : AIRDROP_MIN_POINTS
  const minScoreSetting =
    typeof config?.minScore === 'number' ? config?.minScore : AIRDROP_MIN_SCORE
  const paused = Boolean(config?.paused)
  const requireHumanId = config?.requireHumanId === true

  if (
    !rewardAmount ||
    minPointsSetting === undefined ||
    minScoreSetting === undefined
  ) {
    return NextResponse.json({
      eligible: false,
      error: 'Airdrop not configured',
    })
  }

  if (paused) {
    return NextResponse.json(
      { eligible: false, error: 'Airdrop paused' },
      { status: 200 },
    )
  }

  const user = await UserModel.findOne({ fid })

  const rpcUrl = process.env.ALCHEMY_RPC_URL || 'https://mainnet.base.org'
  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  })

  let hasHumanId = false
  if (requireHumanId) {
    try {
      const humanId = await client.readContract({
        address: addresses.base.HumanId as `0x${string}`,
        abi: humanIdAbi as Abi,
        functionName: 'humanIdOf',
        args: [BigInt(fid)],
      })
      hasHumanId = typeof humanId === 'string' && humanId.length > 0
    } catch (error) {
      console.error('Eligibility humanIdOf failed:', error)
    }
  }
  if (requireHumanId && !hasHumanId) {
    return NextResponse.json(
      { eligible: false, error: 'Human ID required' },
      { status: 200 },
    )
  }

  const minPoints = Number(minPointsSetting)
  const minScore = Number(minScoreSetting)
  const score = user?.humanScore || 0

  const [balance, onchainClaimAmount, onchainMinPoints] = await Promise.all([
    client.readContract({
      address: POINTS_TOKEN_CONTRACT as `0x${string}`,
      abi: pointsTokenAbiTyped,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    }),
    client.readContract({
      address: AIRDROP_CLAIM_CONTRACT as `0x${string}`,
      abi: [
        {
          name: 'claimAmount',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ],
      functionName: 'claimAmount',
    }),
    client.readContract({
      address: AIRDROP_CLAIM_CONTRACT as `0x${string}`,
      abi: [
        {
          name: 'minPointsRequired',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ],
      functionName: 'minPointsRequired',
    }),
  ])

  const isClaimed = await client.readContract({
    address: AIRDROP_CLAIM_CONTRACT as `0x${string}`,
    abi: [
      {
        name: 'isClaimed',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'fid', type: 'uint256' }],
        outputs: [{ type: 'bool' }],
      },
    ],
    functionName: 'isClaimed',
    args: [BigInt(fid)],
  })

  if (isClaimed) {
    return NextResponse.json(
      { eligible: false, error: 'Already claimed' },
      { status: 200 },
    )
  }

  const tokenDecimals = BigInt(10) ** BigInt(18)
  const minPointsWei =
    typeof onchainMinPoints === 'bigint'
      ? onchainMinPoints
      : BigInt(minPoints) * tokenDecimals
  const balanceAmount =
    typeof balance === 'bigint' ? balance : BigInt(balance as number)
  if (balanceAmount < minPointsWei) {
    return NextResponse.json(
      { eligible: false, error: 'Not enough points' },
      { status: 200 },
    )
  }

  if (score < minScore) {
    return NextResponse.json(
      { eligible: false, error: 'Human score too low' },
      { status: 200 },
    )
  }

  const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`)
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60)
  const nonce =
    BigInt(Date.now()) * BigInt(1000000) +
    BigInt(Math.floor(Math.random() * 1000000))
  const amount = onchainClaimAmount
    ? BigInt(onchainClaimAmount as bigint)
    : BigInt(rewardAmount)
  const burnPoints = minPointsWei

  const signature = await account.signTypedData({
    domain: {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      chainId: CHAIN_ID,
      verifyingContract: AIRDROP_CLAIM_CONTRACT as `0x${string}`,
    },
    types: {
      AirdropClaim: [
        { name: 'to', type: 'address' },
        { name: 'fid', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'burnPoints', type: 'uint256' },
        { name: 'humanScore', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'AirdropClaim',
    message: {
      to: userAddress as `0x${string}`,
      fid: BigInt(fid),
      nonce,
      amount,
      burnPoints,
      humanScore: BigInt(score),
      deadline,
    },
  })

  return NextResponse.json({
    eligible: true,
    signature,
    fid,
    nonce: nonce.toString(),
    amount: amount.toString(),
    burnPoints: burnPoints.toString(),
    humanScore: score,
    deadline: deadline.toString(),
    contract: AIRDROP_CLAIM_CONTRACT,
    pointsToken: POINTS_TOKEN_CONTRACT,
  })
}
