import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/lib/constants'
import dbConnect from '@/lib/db'
import { getNeynarUser } from '@/lib/neynar'
import { UserModel } from '@/models/User'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fid: string }> },
) {
  const resolvedParams = await params
  const fid = Number(resolvedParams.fid)
  if (!fid || Number.isNaN(fid)) {
    return NextResponse.json({ error: 'Invalid fid' }, { status: 400 })
  }

  let humanId: string | null = null
  let mintedAt: string | null = null
  try {
    await dbConnect()
    const user = await UserModel.findOne({ fid })
    humanId = user?.humanId ?? null
    if (user?.humanId) {
      const updated = user?.updatedAt instanceof Date ? user.updatedAt : null
      mintedAt = updated ? updated.toISOString() : null
    }
  } catch (error) {
    console.error('Metadata DB lookup failed:', error)
  }

  let displayName = `FID ${fid}`
  try {
    const neynarUser = await getNeynarUser(fid)
    displayName =
      neynarUser?.display_name || neynarUser?.username || displayName
  } catch (error) {
    console.error('Metadata Neynar lookup failed:', error)
  }

  const image = `${APP_URL}/api/og/humanid?fid=${fid}`

  const projectName = 'Captcha'

  return NextResponse.json({
    name: `${projectName} Human ID - ${displayName} #${fid}`,
    description: APP_DESCRIPTION,
    image,
    external_url: APP_URL,
    attributes: [
      { trait_type: 'FID', value: fid },
      { trait_type: 'HumanId', value: humanId || 'UNMINTED' },
      { trait_type: 'MintedAt', value: mintedAt || 'UNMINTED' },
      { trait_type: 'Project', value: projectName },
      { trait_type: 'App', value: APP_NAME },
    ],
  })
}
