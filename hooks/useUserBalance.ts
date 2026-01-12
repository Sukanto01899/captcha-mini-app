import pointsTokenAbi from '@/contracts/abi/PointsToken.json'
import addresses from '@/contracts/addresses.json'
import { type Abi } from 'viem'
import { useReadContract } from 'wagmi'

const pointsTokenAbiTyped = pointsTokenAbi as Abi

export function useUserBalance(address?: `0x${string}`) {
  const pointsTokenAddress = addresses.base.PointsToken as `0x${string}`
  const { data, refetch, isLoading } = useReadContract({
    address: pointsTokenAddress,
    abi: pointsTokenAbiTyped,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  })

  const points =
    typeof data === 'bigint' ? Number(data / 10n ** 18n) : 0

  return { points, refetch, isLoading }
}
