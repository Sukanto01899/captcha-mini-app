import dbConnect from '@/lib/db'
import { AirdropConfigModel } from '@/models/AirdropConfig'
import { type NextRequest, NextResponse } from 'next/server'

const ADMIN_FID = 317261

export async function GET() {
  await dbConnect()
  const config = (await AirdropConfigModel.findOne({
    key: 'active',
  }).lean()) || {
    poolAmount: '0',
    claimAmount: '0',
    minPoints: 0,
    minScore: 0,
    maxClaimsPerUser: 1,
    requireHumanId: false,
    paused: false,
  }

  return NextResponse.json(config)
}

export async function POST(request: NextRequest) {
  const fidHeader = request.headers.get('x-fid')
  if (!fidHeader || Number(fidHeader) !== ADMIN_FID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as Partial<{
    poolAmount: string
    claimAmount: string
    minPoints: number
    burnPoints: string
    minScore: number
    maxClaimsPerUser: number
    requireHumanId: boolean
    paused: boolean
  }>

  await dbConnect()
  const update: Record<string, unknown> = {}
  if (typeof body.poolAmount === 'string') update.poolAmount = body.poolAmount
  if (typeof body.claimAmount === 'string')
    update.claimAmount = body.claimAmount
  if (typeof body.minPoints === 'number') update.minPoints = body.minPoints
  if (typeof body.minScore === 'number') update.minScore = body.minScore
  if (typeof body.maxClaimsPerUser === 'number')
    update.maxClaimsPerUser = body.maxClaimsPerUser
  if (typeof body.requireHumanId === 'boolean')
    update.requireHumanId = body.requireHumanId
  if (typeof body.paused === 'boolean') update.paused = body.paused
  update.updatedBy = Number(fidHeader)

  const config = await AirdropConfigModel.findOneAndUpdate(
    { key: 'active' },
    { $set: update },
    { upsert: true, new: true },
  )

  return NextResponse.json(config)
}
