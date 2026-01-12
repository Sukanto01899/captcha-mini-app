import pointsClaimAbi from '@/contracts/abi/PointsClaim.json'
import addresses from '@/contracts/addresses.json'
import { redis } from '@/lib/upstash'
import { type NextRequest, NextResponse } from 'next/server'
import { http, type Abi, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const CHAIN_ID = 8453
const DOMAIN_NAME = 'CaptchaPoints'
const DOMAIN_VERSION = '1'
const pointsClaimAbiTyped = pointsClaimAbi as Abi

export async function POST(request: NextRequest) {
  const { userAddress, claimToken } = await request.json()
  const fidHeader = request.headers.get('x-fid')

  if (!userAddress || !fidHeader || !claimToken) {
    return NextResponse.json(
      { error: 'Invalid input', isSuccess: false },
      { status: 400 },
    )
  }

  const fid = Number(fidHeader)
  if (!fid || Number.isNaN(fid)) {
    return NextResponse.json(
      { error: 'Invalid fid', isSuccess: false },
      { status: 400 },
    )
  }

  const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY
  const POINTS_CLAIM_CONTRACT =
    process.env.POINTS_CLAIM_CONTRACT || addresses.base.PointsClaim
  const POINTS_AMOUNT = process.env.POINTS_AMOUNT

  if (!SERVER_PRIVATE_KEY || !POINTS_CLAIM_CONTRACT) {
    return NextResponse.json(
      { error: 'Server configuration error', isSuccess: false },
      { status: 500 },
    )
  }

  try {
    const claimKey = `captcha:claim:${fid}`
    const stored = await redis.get<
      string | { token?: string; address?: string }
    >(claimKey)
    if (!stored) {
      return NextResponse.json(
        { error: 'Captcha verification required', isSuccess: false },
        { status: 401 },
      )
    }
    const parsed =
      typeof stored === 'string'
        ? (JSON.parse(stored) as { token?: string; address?: string })
        : stored
    if (
      parsed?.token !== claimToken ||
      parsed?.address?.toLowerCase() !== String(userAddress).toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Captcha verification required', isSuccess: false },
        { status: 401 },
      )
    }
    const rpcUrl = process.env.ALCHEMY_RPC_URL || 'https://mainnet.base.org'
    const client = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    })
    const [lastClaimAt, cooldown, latestBlock] = await Promise.all([
      client.readContract({
        address: POINTS_CLAIM_CONTRACT as `0x${string}`,
        abi: pointsClaimAbiTyped,
        functionName: 'lastClaimAtByFid',
        args: [BigInt(fid)],
      }),
      client.readContract({
        address: POINTS_CLAIM_CONTRACT as `0x${string}`,
        abi: pointsClaimAbiTyped,
        functionName: 'claimCooldown',
      }),
      client.getBlock({ blockTag: 'latest' }),
    ])
    const now = Number(latestBlock.timestamp)
    if (now < Number(lastClaimAt) + Number(cooldown)) {
      return NextResponse.json(
        { error: 'Cooldown active', isSuccess: false },
        { status: 429 },
      )
    }

    const account = privateKeyToAccount(SERVER_PRIVATE_KEY as `0x${string}`)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60)
    const nonce =
      BigInt(Date.now()) * BigInt(1000000) +
      BigInt(Math.floor(Math.random() * 1000000))
    const amount = POINTS_AMOUNT ? BigInt(POINTS_AMOUNT) : 100n * 10n ** 18n

    const signature = await account.signTypedData({
      domain: {
        name: DOMAIN_NAME,
        version: DOMAIN_VERSION,
        chainId: CHAIN_ID,
        verifyingContract: POINTS_CLAIM_CONTRACT as `0x${string}`,
      },
      types: {
        PointsClaim: [
          { name: 'to', type: 'address' },
          { name: 'fid', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'PointsClaim',
      message: {
        to: userAddress as `0x${string}`,
        fid: BigInt(fid),
        nonce,
        amount,
        deadline,
      },
    })

    await redis.del(claimKey)
    return NextResponse.json(
      {
        signature,
        fid,
        nonce: nonce.toString(),
        amount: amount.toString(),
        deadline: deadline.toString(),
        isSuccess: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Points claim signature error:', error)
    return NextResponse.json(
      { error: 'Unauthorized', isSuccess: false },
      { status: 401 },
    )
  }
}
