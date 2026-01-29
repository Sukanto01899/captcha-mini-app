import dbConnect from '@/lib/db'
import { getNeynarUser } from '@/lib/neynar'
import { UserModel } from '@/models/User'
import { type NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const DAY_MS = 24 * 60 * 60 * 1000
const MONTH_DAYS = 30
const MAX_CATEGORY_SCORE = 10

type NeynarUser = {
  follower_count?: number
  followers_count?: number
  following_count?: number
  casts_count?: number
  casts?: number
  likes_count?: number
  likes?: number
  comment_count?: number
  comments_count?: number
  replies_count?: number
  neynar_score?: number
  score?: number
  spam?: boolean | number | string
  spam_label?: number | string
  pfp_url?: string
  bio?: string
  verified_addresses?:
    | {
        eth_addresses?: string[]
        sol_addresses?: string[]
        primary?: {
          eth_address?: string
          sol_address?: string
        }
      }
    | string[]
    | null
  verifications?: string[] | null
  verified_email?: boolean
  power_badge?: boolean
  registered_at?: string | number | Date
  created_at?: string | number | Date
  experimental?: {
    neynar_user_score?: number
  }
}

function toNumber(value: unknown) {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : 0
}

function computeHumanScore(details: {
  followers: number
  following: number
  casts: number
  likes: number
  comments: number
  accountAgeDays: number
  neynarScore: number
  walletBalanceEth: number
  spamLabel: number
  hasPowerBadge: boolean
}) {
  const clampScore = (value: number) =>
    Math.max(0, Math.min(MAX_CATEGORY_SCORE, value))
  const scoreFromUnit = (value: number, unit: number) =>
    unit > 0 ? clampScore(value / unit) : 0

  const followerScore = scoreFromUnit(details.followers, 100)
  const followingScore = scoreFromUnit(details.following, 100)
  const neynarScore = scoreFromUnit(details.neynarScore, 0.1)
  const castScore = scoreFromUnit(details.casts, 10)
  const likeScore = scoreFromUnit(details.likes, 100)
  const commentScore = scoreFromUnit(details.comments, 10)
  const ageScore = scoreFromUnit(details.accountAgeDays, MONTH_DAYS)
  const walletScore = scoreFromUnit(details.walletBalanceEth, 0.0005)
  const premiumBadgeScore = details.hasPowerBadge ? 10 : 0
  const spamScore =
    details.spamLabel === 0 ? 10 : details.spamLabel === 1 ? 5 : 0

  const total =
    followerScore +
    followingScore +
    neynarScore +
    castScore +
    likeScore +
    commentScore +
    premiumBadgeScore +
    ageScore +
    walletScore +
    spamScore

  return Math.max(0, Math.min(100, Math.round(total)))
}

function parseAccountAgeDays(rawDate?: string | number | Date | null) {
  if (!rawDate) return 0
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS))
}

function resolveSpamLabel(rawValue: unknown) {
  if (typeof rawValue === 'number') return rawValue
  if (typeof rawValue === 'string') {
    const parsed = Number(rawValue)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (rawValue === true) return 2
  if (rawValue === false) return 0
  return 0
}

function resolveVerifiedEthAddresses(
  verifiedAddresses: NeynarUser['verified_addresses'],
  verifications: NeynarUser['verifications'],
) {
  if (Array.isArray(verifiedAddresses)) return verifiedAddresses
  if (verifiedAddresses?.eth_addresses?.length)
    return verifiedAddresses.eth_addresses
  if (verifiedAddresses?.primary?.eth_address)
    return [verifiedAddresses.primary.eth_address]
  if (Array.isArray(verifications)) return verifications
  return []
}

async function getWalletBalanceEth(address?: string | null) {
  if (!address) return 0
  const rpcUrl = process.env.ALCHEMY_RPC_URL || 'https://mainnet.base.org'
  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  })

  try {
    const balanceWei = await client.getBalance({
      address: address as `0x${string}`,
    })
    const balanceEth = Number(balanceWei) / 1e18
    return Number.isFinite(balanceEth) ? balanceEth : 0
  } catch (error) {
    console.error('Failed to fetch wallet balance', error)
    return 0
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    fid?: number
    walletAddress?: string | null
  }
  if (!body.fid) {
    return NextResponse.json({ error: 'Missing fid' }, { status: 400 })
  }

  const fid = Number(body.fid)
  if (!fid || Number.isNaN(fid)) {
    return NextResponse.json({ error: 'Invalid fid' }, { status: 400 })
  }

  await dbConnect()

  const neynarUser = (await getNeynarUser(fid)) as NeynarUser | null
  const followers = toNumber(
    neynarUser?.follower_count ?? neynarUser?.followers_count,
  )
  const following = toNumber(neynarUser?.following_count)
  const casts = toNumber(neynarUser?.casts_count ?? neynarUser?.casts)
  const likes = toNumber(neynarUser?.likes_count ?? neynarUser?.likes)
  const comments = toNumber(
    neynarUser?.comment_count ??
      neynarUser?.comments_count ??
      neynarUser?.replies_count,
  )
  const neynarScore = toNumber(
    neynarUser?.neynar_score ??
      neynarUser?.experimental?.neynar_user_score ??
      neynarUser?.score,
  )
  const spamLabel = resolveSpamLabel(
    neynarUser?.spam_label ?? neynarUser?.spam,
  )
  const hasPowerBadge = Boolean(neynarUser?.power_badge)
  const accountAgeDays = parseAccountAgeDays(
    neynarUser?.registered_at ?? neynarUser?.created_at,
  )
  const walletBalanceEth = await getWalletBalanceEth(body.walletAddress)

  const humanDetails = {
    followers,
    following,
    casts,
    likes,
    comments,
    accountAgeDays,
    neynarScore,
    walletBalanceEth,
    spamLabel,
  }
  const humanScore = computeHumanScore({
    ...humanDetails,
    hasPowerBadge,
  })

  await UserModel.findOneAndUpdate(
    { fid },
    { humanScore, humanDetails },
    { upsert: true, new: true },
  )

  return NextResponse.json({ humanScore, humanDetails })
}
