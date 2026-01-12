import { airdropClaimAbi } from '@/lib/abi/airdrop-claim'
import { pointsTokenAbi } from '@/lib/abi/points-token'
import { useCallback, useState } from 'react'
import { type Abi, encodeFunctionData } from 'viem'

type AirdropConfig = {
  paused: boolean
}

export function useAirdrop({
  fid,
  address,
  actions,
  authFetch,
  config,
  writeContractAsync,
}: {
  fid?: number
  address?: `0x${string}`
  actions?: unknown
  authFetch: typeof fetch
  config: AirdropConfig
  writeContractAsync?: (args: {
    address: `0x${string}`
    abi: Abi
    functionName: string
    args?: readonly unknown[]
    value?: bigint
  }) => Promise<unknown>
}) {
  const wallet = (
    actions as
      | {
          wallet?: {
            sendTransaction?: (args: {
              to: `0x${string}`
              data: `0x${string}`
              value?: `0x${string}`
            }) => Promise<unknown>
          }
        }
      | undefined
  )?.wallet
  const [eligibility, setEligibility] = useState<{
    eligible: boolean | null
    message?: string
  }>({ eligible: null })
  const [approveError, setApproveError] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimPayload, setClaimPayload] = useState<{
    contract: string
    pointsToken: string
    fid: number
    nonce: string
    amount: string
    burnPoints: string
    humanScore: number
    deadline: string
    signature: string
  } | null>(null)

  const claim = useCallback(
    async (payload?: typeof claimPayload) => {
      const dataPayload = payload ?? claimPayload
      if (!dataPayload) {
        setEligibility({ eligible: false, message: 'CHECK ELIGIBILITY FIRST.' })
        return
      }
      if (BigInt(dataPayload.burnPoints) > 0n && !dataPayload.pointsToken) {
        setEligibility({ eligible: false, message: 'POINTS TOKEN MISSING.' })
        return
      }
      setClaimError(null)
      setIsClaiming(true)
      try {
        if (writeContractAsync) {
          await writeContractAsync({
            address: dataPayload.contract as `0x${string}`,
            abi: airdropClaimAbi,
            functionName: 'claim',
            args: [
              BigInt(dataPayload.fid),
              BigInt(dataPayload.nonce),
              BigInt(dataPayload.amount),
              BigInt(dataPayload.burnPoints),
              BigInt(dataPayload.humanScore),
              BigInt(dataPayload.deadline),
              dataPayload.signature,
            ],
          })
        } else if (wallet?.sendTransaction) {
          const calldata = encodeFunctionData({
            abi: airdropClaimAbi,
            functionName: 'claim',
            args: [
              BigInt(dataPayload.fid),
              BigInt(dataPayload.nonce),
              BigInt(dataPayload.amount),
              BigInt(dataPayload.burnPoints),
              BigInt(dataPayload.humanScore),
              BigInt(dataPayload.deadline),
              dataPayload.signature,
            ],
          })
          await wallet.sendTransaction({
            to: dataPayload.contract as `0x${string}`,
            data: calldata,
            value: '0x0',
          })
        } else {
          setEligibility({ eligible: false, message: 'WALLET NOT READY.' })
          return
        }
        setEligibility({ eligible: false, message: 'CLAIM SENT.' })
      } catch (error) {
        console.error('airdrop claim failed', error)
        setClaimError('CLAIM FAILED.')
      } finally {
        setIsClaiming(false)
      }
    },
    [claimPayload, writeContractAsync, wallet],
  )

  const approve = useCallback(
    async (payload?: typeof claimPayload) => {
      const dataPayload = payload ?? claimPayload
      if (!dataPayload) {
        setEligibility({ eligible: false, message: 'CHECK ELIGIBILITY FIRST.' })
        return
      }
      if (BigInt(dataPayload.burnPoints) <= 0n) {
        return
      }
      setApproveError(null)
      setIsApproving(true)
      try {
        const maxApprove = BigInt(
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        )
        if (writeContractAsync) {
          await writeContractAsync({
            address: dataPayload.pointsToken as `0x${string}`,
            abi: pointsTokenAbi,
            functionName: 'approve',
            args: [dataPayload.contract as `0x${string}`, maxApprove],
          })
        } else if (wallet?.sendTransaction) {
          const approveData = encodeFunctionData({
            abi: pointsTokenAbi,
            functionName: 'approve',
            args: [dataPayload.contract as `0x${string}`, maxApprove],
          })
          await wallet.sendTransaction({
            to: dataPayload.pointsToken as `0x${string}`,
            data: approveData,
            value: '0x0',
          })
        } else {
          setEligibility({ eligible: false, message: 'WALLET NOT READY.' })
          return
        }
      } catch (error) {
        console.error('airdrop approve failed', error)
        setApproveError('APPROVAL FAILED.')
      } finally {
        setIsApproving(false)
      }
    },
    [claimPayload, writeContractAsync, wallet],
  )

  const checkEligibility = useCallback(async () => {
    setIsChecking(true)
    setEligibility({ eligible: null, message: 'CHECKING...' })
    setClaimPayload(null)
    try {
      if (config.paused) {
        setEligibility({ eligible: false, message: 'AIRDROP PAUSED.' })
        return
      }
      if (!address) {
        setEligibility({ eligible: false, message: 'CONNECT WALLET.' })
        return
      }
      if (!fid) {
        setEligibility({ eligible: false, message: 'FID MISSING.' })
        return
      }
      const res = await authFetch('/api/airdrop/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, fid }),
      })
      const data = await res.json()
      if (!res.ok || !data.eligible) {
        setEligibility({
          eligible: false,
          message: data?.error
            ? String(data.error).toUpperCase()
            : 'NOT ELIGIBLE.',
        })
        return
      }
      setClaimPayload(data)
      setEligibility({ eligible: true, message: 'ELIGIBLE.' })
    } finally {
      setIsChecking(false)
    }
  }, [address, authFetch, config.paused, fid])

  return {
    eligibility,
    isChecking,
    isApproving,
    isClaiming,
    claimPayload,
    approveError,
    claimError,
    checkEligibility,
    approve,
    claim,
  }
}
