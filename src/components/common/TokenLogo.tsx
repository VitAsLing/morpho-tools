import { useState } from 'react'
import { getTokenLogoUrl } from '@/lib/utils'

interface TokenLogoProps {
  address: string
  symbol: string
  logoURI?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'w-3.5 h-3.5 text-[8px]',
  sm: 'w-4 h-4 text-[9px]',
  md: 'w-5 h-5 text-[10px]',
  lg: 'w-6 h-6 text-xs',
}

// 根据地址生成渐变色
function getGradientColors(address: string): [string, string] {
  const hash = address.toLowerCase().slice(2, 10)
  const num = parseInt(hash, 16)

  const hue1 = num % 360
  const hue2 = (hue1 + 40) % 360

  return [
    `hsl(${hue1}, 70%, 50%)`,
    `hsl(${hue2}, 70%, 40%)`,
  ]
}

export function TokenLogo({ address, symbol, logoURI, size = 'md', className = '' }: TokenLogoProps) {
  const [imgError, setImgError] = useState(0)

  const sizeClass = sizeClasses[size]
  const [color1, color2] = getGradientColors(address)

  // 图片源优先级：1. Morpho logoURI -> 2. 1inch CDN -> 3. 首字母兜底
  const imgSources = [
    logoURI,
    getTokenLogoUrl(address as `0x${string}`, null),
  ].filter(Boolean) as string[]

  const currentSrc = imgSources[imgError]
  const showFallback = imgError >= imgSources.length

  if (showFallback) {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white ${className}`}
        style={{
          background: `linear-gradient(135deg, ${color1}, ${color2})`,
        }}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={symbol}
      className={`${sizeClass} rounded-full ${className}`}
      onError={() => setImgError((prev) => prev + 1)}
    />
  )
}
