import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export function ConnectButton() {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { address, isConnected } = useAccount()

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  if (!isConnected) {
    return (
      <button
        onClick={openConnectModal}
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--text-secondary)',
          color: 'var(--text-primary)',
          borderRadius: '8px',
          padding: '8px 24px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-primary)'
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-secondary)'
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
        }}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <button
      onClick={openAccountModal}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'linear-gradient(to bottom right, #3b82f6, #a855f7)',
      }} />
      <span style={{ fontSize: '14px' }}>{formatAddress(address!)}</span>
    </button>
  )
}
