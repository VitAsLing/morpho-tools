import { GraphQLClient, gql } from 'graphql-request'
import type { Market, UserPosition, UserTransaction } from '@/types'
import { MORPHO_GRAPHQL_API } from './constants'

const client = new GraphQLClient(MORPHO_GRAPHQL_API)

const GET_MARKETS_QUERY = gql`
  query GetMarkets($chainId: Int!) {
    markets(
      where: { chainId_in: [$chainId], whitelisted: true }
      orderBy: SupplyAssetsUsd
      orderDirection: Desc
      first: 100
    ) {
      items {
        uniqueKey
        lltv
        whitelisted
        loanAsset {
          address
          symbol
          decimals
          priceUsd
          logoURI
        }
        collateralAsset {
          address
          symbol
          decimals
          priceUsd
          logoURI
        }
        state {
          supplyAssets
          borrowAssets
          supplyApy
          borrowApy
          netSupplyApy
          utilization
          rewards {
            supplyApr
            borrowApr
            asset {
              symbol
              address
              logoURI
            }
          }
        }
        oracle {
          address
        }
        irmAddress
      }
    }
  }
`

const GET_USER_POSITIONS_QUERY = gql`
  query GetUserPositions($address: String!, $chainId: Int!) {
    marketPositions(
      where: {
        userAddress_in: [$address]
        chainId_in: [$chainId]
        supplyShares_gte: 1
      }
    ) {
      items {
        market {
          uniqueKey
          loanAsset {
            address
            symbol
            decimals
            priceUsd
            logoURI
          }
          collateralAsset {
            address
            symbol
            decimals
            priceUsd
            logoURI
          }
          state {
            supplyApy
            netSupplyApy
            utilization
            rewards {
              supplyApr
              asset {
                symbol
                address
                logoURI
              }
            }
          }
          oracle {
            address
          }
          irmAddress
          lltv
        }
        state {
          supplyAssets
          supplyShares
        }
      }
    }
  }
`

const GET_USER_TRANSACTIONS_QUERY = gql`
  query GetUserTransactions($address: String!, $chainId: Int!) {
    transactions(
      where: {
        userAddress_in: [$address]
        chainId_in: [$chainId]
        type_in: [MarketSupply, MarketWithdraw]
      }
      orderBy: Timestamp
      orderDirection: Desc
      first: 500
    ) {
      items {
        type
        timestamp
        data {
          ... on MarketTransferTransactionData {
            shares
            assets
            assetsUsd
            market {
              uniqueKey
              loanAsset {
                address
                symbol
                decimals
              }
            }
          }
        }
      }
    }
  }
`

interface MarketsResponse {
  markets: {
    items: Market[]
  }
}

interface UserPositionsResponse {
  marketPositions: {
    items: UserPosition[]
  }
}

interface UserTransactionsResponse {
  transactions: {
    items: UserTransaction[]
  }
}

export async function fetchMarkets(chainId: number): Promise<Market[]> {
  const data = await client.request<MarketsResponse>(GET_MARKETS_QUERY, {
    chainId,
  })
  return data.markets.items
}

export async function fetchUserPositions(
  address: string,
  chainId: number
): Promise<UserPosition[]> {
  const data = await client.request<UserPositionsResponse>(
    GET_USER_POSITIONS_QUERY,
    { address: address.toLowerCase(), chainId }
  )
  return data.marketPositions.items
}

export async function fetchUserTransactions(
  address: string,
  chainId: number
): Promise<UserTransaction[]> {
  const data = await client.request<UserTransactionsResponse>(
    GET_USER_TRANSACTIONS_QUERY,
    { address: address.toLowerCase(), chainId }
  )
  return data.transactions.items
}
