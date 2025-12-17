import type { Address } from 'viem'
import type { ChainConfig } from '@/types'

export const MORPHO_GRAPHQL_API = 'https://blue-api.morpho.org/graphql'

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
    morphoAddress: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' as Address,
    explorerUrl: 'https://arbiscan.io',
    morphoAppUrl: 'https://app.morpho.org/arbitrum',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  },
}

export const SUPPORTED_CHAINS = Object.values(CHAIN_CONFIG)

export const DEFAULT_CHAIN_ID = 1

export function getChainConfig(chainId: number): ChainConfig {
  return CHAIN_CONFIG[chainId] ?? CHAIN_CONFIG[DEFAULT_CHAIN_ID]
}

export function getChainName(chainId: number): string {
  return getChainConfig(chainId).name.toLowerCase()
}

export function getMorphoAddress(chainId: number): Address {
  return getChainConfig(chainId).morphoAddress
}
