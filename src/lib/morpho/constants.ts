import type { Address } from 'viem'
import type { Chain } from 'viem'
import { mainnet, base, arbitrum, hyperEvm } from 'viem/chains'
import type { ChainConfig } from '@/types'

export const MORPHO_GRAPHQL_API = 'https://blue-api.morpho.org/graphql'

// RPC URLs 配置 - 使用官方节点
export const RPC_URLS: Record<number, string[]> = {
  1: ['https://cloudflare-eth.com'],
  8453: ['https://mainnet.base.org'],
  42161: ['https://arb1.arbitrum.io/rpc'],
  999: ['https://rpc.hyperliquid.xyz/evm'],
}

// Chain 对象映射
export const CHAIN_MAP: Record<number, Chain> = {
  1: mainnet,
  8453: base,
  42161: arbitrum,
  999: hyperEvm,
}

export function getChain(chainId: number): Chain | undefined {
  return CHAIN_MAP[chainId]
}

export function getRpcUrl(chainId: number): string {
  const urls = RPC_URLS[chainId]
  return urls?.[0] ?? ''
}

export const MORPHO_LOGO_URL = 'https://cdn.morpho.org/assets/logos/morpho.svg'

// MORPHO token address on Ethereum mainnet (canonical, used for price)
export const MORPHO_TOKEN_ADDRESS = '0x58D97B57BB95320F9a05dC918Aef65434969c2B2' as Address

export const CHAIN_CONFIG: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: 'Ethereum',
    shortName: 'Ethereum',
    morphoAddress: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' as Address,
    explorerUrl: 'https://etherscan.io',
    morphoAppUrl: 'https://app.morpho.org/ethereum',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  },
  8453: {
    id: 8453,
    name: 'Base',
    shortName: 'Base',
    morphoAddress: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' as Address,
    explorerUrl: 'https://basescan.org',
    morphoAppUrl: 'https://app.morpho.org/base',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  },
  42161: {
    id: 42161,
    name: 'Arbitrum',
    shortName: 'Arbitrum',
    morphoAddress: '0x6c247b1F6182318877311737BaC0844bAa518F5e' as Address,
    explorerUrl: 'https://arbiscan.io',
    morphoAppUrl: 'https://app.morpho.org/arbitrum',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  },
  999: {
    id: 999,
    name: 'HyperEVM',
    shortName: 'HyperEVM',
    morphoAddress: '0x68e37dE8d93d3496ae143F2E900490f6280C57cD' as Address,
    explorerUrl: 'https://hyperevmscan.io',
    morphoAppUrl: 'https://app.morpho.org/hyperevm',
    logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32196.png',
  },
}

export const DEFAULT_CHAIN_ID = 1

export function getChainConfig(chainId: number): ChainConfig {
  return CHAIN_CONFIG[chainId] ?? CHAIN_CONFIG[DEFAULT_CHAIN_ID]
}

export function getMorphoAddress(chainId: number): Address {
  return getChainConfig(chainId).morphoAddress
}
