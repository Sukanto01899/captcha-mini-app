import dbConnect from '@/lib/db'
import { getNeynarUser } from '@/lib/neynar'
import { UserModel } from '@/models/User'
import { type NextRequest, NextResponse } from 'next/server'

const DAY_MS = 24 * 60 * 60 * 1000

type NeynarUser = {
  follower_count?: number
  followers_count?: number
  following_count?: number
  casts_count?: number
  casts?: number
  likes_count?: number
  likes?: number
  neynar_score?: number
  score?: number
  spam?: boolean
  pfp_url?: string
  bio?: string
  verified_addresses?: string[] | null
  verifications?: string[] | null
  verified_email?: boolean
  power_badge?: boolean
  registered_at?: string | number | Date
  created_at?: string | number | Date
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
  accountAgeDays: number
  neynarScore: number
  isSpam: boolean
  hasProfile: boolean
  hasVerifiedAddress: boolean
  hasVerifiedEmail: boolean
  hasPowerBadge: boolean
}) {
  const followerScore = Math.min(details.followers, 10000) / 200
  const followingScore = Math.min(details.following, 5000) / 400
  const castScore = Math.min(details.casts, 2000) / 20
  const likeScore = Math.min(details.likes, 2000) / 40
  const ageScore = Math.min(details.accountAgeDays, 365) / 5
  const neynarScore = details.neynarScore > 0 ? details.neynarScore * 20 : 0
  const profileScore = details.hasProfile ? 5 : 0
  const walletScore = details.hasVerifiedAddress ? 10 : 0
  const emailScore = details.hasVerifiedEmail ? 5 : 0
  const powerBadgeScore = details.hasPowerBadge ? 10 : 0

  let score =
    20 +
    followerScore +
    followingScore +
    castScore +
    likeScore +
    ageScore +
    neynarScore +
    profileScore +
    walletScore +
    emailScore +
    powerBadgeScore

  if (details.isSpam) {
    score = Math.min(score, 15)
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

function parseAccountAgeDays(rawDate?: string | number | Date | null) {
  if (!rawDate) return 0
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS))
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { fid?: number }
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
  const neynarScore = toNumber(neynarUser?.neynar_score ?? neynarUser?.score)
  const isSpam = Boolean(neynarUser?.spam)
  const hasProfile = Boolean(neynarUser?.pfp_url || neynarUser?.bio)
  const verifiedAddresses =
    neynarUser?.verified_addresses || neynarUser?.verifications || []
  const hasVerifiedAddress = Array.isArray(verifiedAddresses)
    ? verifiedAddresses.length > 0
    : Boolean(verifiedAddresses)
  const hasVerifiedEmail = Boolean(neynarUser?.verified_email)
  const hasPowerBadge = Boolean(neynarUser?.power_badge)
  const accountAgeDays = parseAccountAgeDays(
    neynarUser?.registered_at ?? neynarUser?.created_at,
  )

  const humanDetails = {
    followers,
    following,
    casts,
    likes,
    accountAgeDays,
    neynarScore,
  }
  const humanScore = computeHumanScore({
    ...humanDetails,
    isSpam,
    hasProfile,
    hasVerifiedAddress,
    hasVerifiedEmail,
    hasPowerBadge,
  })

  await UserModel.findOneAndUpdate(
    { fid },
    { humanScore, humanDetails },
    { upsert: true, new: true },
  )

  return NextResponse.json({ humanScore, humanDetails })
}
