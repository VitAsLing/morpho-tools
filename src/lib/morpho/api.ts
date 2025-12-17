import { GraphQLClient, gql } from 'graphql-request'
import type { Market, UserPosition } from '@/types'
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
        oracleAddress
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
          oracleAddress
          irmAddress
          lltv
        }
        supplyAssets
        supplyShares
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
