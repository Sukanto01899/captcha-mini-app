import dbConnect from '@/lib/db'
import { UserModel } from '@/models/User'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fid = Number(searchParams.get('fid') || '0')
  if (!fid) {
    return NextResponse.json(
      {
        onboarded: false,
        humanId: null,
        humanScore: 0,
        humanDetails: null,
        points: 0,
      },
      { status: 200 },
    )
  }

  await dbConnect()
  const user = await UserModel.findOne({ fid }).lean()
  if (!user) {
    return NextResponse.json(
      {
        onboarded: false,
        humanId: null,
        humanScore: 0,
        humanDetails: null,
        points: 0,
      },
      { status: 200 },
    )
  }

  return NextResponse.json({
    onboarded: Boolean(user.onboarded),
    humanId: user.humanId,
    humanIdMinted: user.humanIdMinted ?? false,
    humanScore: user.humanScore ?? 0,
    humanDetails: user.humanDetails ?? null,
    points: user.points || 0,
  })
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    fid?: number
    onboarded?: boolean
    humanId?: string | null
    humanIdMinted?: boolean
    humanScore?: number
    humanDetails?: {
      followers: number
      following: number
      casts: number
      likes: number
      accountAgeDays: number
      neynarScore: number
    }
    points?: number
  }
  if (!body.fid) {
    return NextResponse.json({ error: 'Missing fid' }, { status: 400 })
  }
  await dbConnect()
  const update: Record<string, unknown> = {}
  if (typeof body.onboarded === 'boolean') update.onboarded = body.onboarded
  if (typeof body.humanId !== 'undefined') update.humanId = body.humanId ?? null
  if (typeof body.humanIdMinted === 'boolean')
    update.humanIdMinted = body.humanIdMinted
  if (typeof body.humanScore === 'number') update.humanScore = body.humanScore
  if (typeof body.humanDetails !== 'undefined')
    update.humanDetails = body.humanDetails ?? null
  if (typeof body.points === 'number') update.points = body.points
  await UserModel.findOneAndUpdate({ fid: body.fid }, update, {
    upsert: true,
    new: true,
  })
  return NextResponse.json({ success: true })
}
