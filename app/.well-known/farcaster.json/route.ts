import { NextResponse } from 'next/server'
import { getFarcasterDomainManifest } from '../../../lib/utils'

export async function GET() {
  const farcasterConfig = await getFarcasterDomainManifest()

  return NextResponse.json(farcasterConfig)
}
