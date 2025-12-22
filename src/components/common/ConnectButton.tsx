import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'

export function ConnectButton() {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { address, isConnected } = useAccount()

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  if (!isConnected || !address) {
    return (
      <Button variant="outline" onClick={openConnectModal} className="font-semibold">
        <span className="hidden md:inline">Connect Wallet</span>
        <span className="md:hidden text-base">Connect</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={openAccountModal}
      className="gap-2 hover:border-[var(--accent)]"
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 shrink-0" />
      <span className="text-sm">{formatAddress(address)}</span>
    </Button>
  )
}
