import { MORPHO_TOKEN_ADDRESS } from '@/lib/morpho/constants'

const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current'

// DefiLlama price API response type
interface DefiLlamaPriceResponse {
  coins: Record<
    string,
    {
      decimals: number
      symbol: string
      price: number
      timestamp: number
      confidence: number
    }
  >
}

// Price cache (1 hour TTL)
let morphoPriceCache: { price: number; timestamp: number } | null = null
const PRICE_CACHE_TTL = 60 * 60 * 1000 // 1 hour in ms

// Fetch MORPHO token price from DefiLlama (with 1 hour cache)
export async function fetchMorphoPrice(): Promise<number> {
  const now = Date.now()

  // Return cached price if still valid
  if (morphoPriceCache && now - morphoPriceCache.timestamp < PRICE_CACHE_TTL) {
    return morphoPriceCache.price
  }

  try {
    const tokenId = `ethereum:${MORPHO_TOKEN_ADDRESS}`
    const response = await fetch(`${DEFILLAMA_PRICE_API}/${tokenId}`)

    if (!response.ok) {
      console.warn(`DefiLlama price API returned ${response.status}`)
      return morphoPriceCache?.price ?? 0
    }

    const data: DefiLlamaPriceResponse = await response.json()
    const price = data.coins?.[tokenId]?.price ?? 0

    // Update cache
    morphoPriceCache = { price, timestamp: now }

    return price
  } catch (err) {
    console.warn('Failed to fetch MORPHO price:', err)
    return morphoPriceCache?.price ?? 0
  }
}
