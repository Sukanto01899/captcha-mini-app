import { getNeynarUser } from '@/lib/neynar'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fid = searchParams.get('fid')

  const user = fid ? await getNeynarUser(Number(fid)) : null

  return new ImageResponse(
    <div tw="flex h-full w-full flex-col justify-center items-center relative bg-slate-950">
      {user?.pfp_url && (
        <div tw="flex w-80 h-80 rounded-full overflow-hidden mb-8 border-8 border-purple-400">
          <img
            src={user.pfp_url}
            alt="Profile"
            tw="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 tw="text-7xl mt-4 text-white opacity-90">HumanID Minted</h1>
      <p tw="text-5xl mt-3 text-fuchsia-300 opacity-90">
        {user ? `FID ${user.fid}` : 'Retro Captcha Arcade'}
      </p>
      <p tw="text-3xl mt-3 text-white opacity-80">Bots not allowed.</p>
    </div>,
    {
      width: 1200,
      height: 800,
    },
  )
}
