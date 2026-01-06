# Morpho Tools - Claude 项目指南

## ⚠️ 重要规则

**Git 操作必须二次确认**：
- 执行 `git commit` 前必须先询问用户确认
- 执行 `git push` 前必须先询问用户确认
- 执行任何破坏性 git 操作（如 `force push`、`reset`、`rebase`）前必须先询问用户确认
- 永远不要在没有用户明确同意的情况下自动提交或推送代码

## 项目概述

Morpho Tools 是一个现代化的 Web3 DeFi 应用，为 Morpho Blue 借贷协议提供用户界面。支持用户在多条区块链上浏览市场、管理供应头寸和追踪奖励。

- **网站**: https://morpho.not-today.work
- **版本**: 1.6.0
- **部署**: Cloudflare Pages

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | 19.x + 5.9.x |
| 构建工具 | Vite | 7.x |
| 样式 | Tailwind CSS | 4.x |
| UI 组件 | Radix UI | - |
| Web3 | wagmi + viem | 3.x + 2.x |
| 钱包连接 | RainbowKit | 2.x |
| 数据获取 | TanStack Query + graphql-request | 5.x |
| 路由 | React Router | 7.x |

## 目录结构

```
src/
├── App.tsx                     # 主应用，路由配置
├── main.tsx                    # 入口点
│
├── components/
│   ├── common/                 # 共享组件
│   │   ├── ChainSelector.tsx   # 链选择器下拉菜单
│   │   ├── ConnectButton.tsx   # 钱包连接按钮
│   │   └── TokenLogo.tsx       # Token 图标（支持渐变色回退）
│   │
│   ├── layout/                 # 布局组件
│   │   ├── Header.tsx          # 顶部导航（含主题切换）
│   │   ├── Footer.tsx          # 底部信息
│   │   └── Layout.tsx          # 主布局包装器
│   │
│   ├── markets/                # Markets 页面组件
│   │   ├── MarketsTable.tsx    # 市场列表表格（排序、筛选）
│   │   ├── SupplyModal.tsx     # 供应资金模态框
│   │   └── ApyDisplay.tsx      # APY 显示组件
│   │
│   ├── positions/              # Positions 页面组件
│   │   ├── PositionsTable.tsx  # 用户仓位表格
│   │   └── WithdrawModal.tsx   # 提取资金模态框
│   │
│   ├── rewards/                # Rewards 页面组件
│   │   └── RewardsTable.tsx    # 奖励表格
│   │
│   └── ui/                     # 基础 UI 组件
│       ├── button.tsx          # 按钮
│       ├── table.tsx           # 表格
│       ├── slider.tsx          # 滑块
│       ├── Toast.tsx           # 通知
│       ├── TableState.tsx      # 表格状态（加载/空/错误）
│       ├── ScrollHint.tsx      # 滚动提示
│       ├── Spinner.tsx         # 加载动画
│       └── Tooltip.tsx         # 工具提示
│
├── hooks/                      # 自定义 Hooks
│   ├── useMarkets.ts           # 获取市场数据
│   ├── useUserPositions.ts     # 获取用户仓位+利润计算
│   ├── useRewards.ts           # 获取奖励数据
│   ├── useSupply.ts            # 处理供应交易
│   ├── useWithdraw.ts          # 处理提取交易
│   ├── useTokenApproval.ts     # Token 批准处理
│   └── useTheme.ts             # 主题管理
│
├── lib/
│   ├── morpho/                 # Morpho 协议集成
│   │   ├── constants.ts        # 链配置、合约地址、RPC
│   │   ├── api.ts              # GraphQL 查询
│   │   ├── abi.ts              # 合约 ABI
│   │   └── rewards.ts          # Morpho 奖励 API
│   │
│   ├── merkl/                  # Merkl 奖励集成
│   │   └── api.ts              # Merkl API
│   │
│   ├── utils.ts                # 工具函数（格式化、计算）
│   ├── price.ts                # Token 价格获取
│   ├── toastStore.ts           # Toast 状态管理
│   ├── transactionStore.ts     # 交易记录存储
│   └── rewards.ts              # 奖励数据聚合
│
├── pages/                      # 页面组件
│   ├── Markets.tsx             # 市场浏览页
│   ├── Positions.tsx           # 用户仓位页
│   └── Rewards.tsx             # 奖励追踪页
│
├── providers/
│   └── Web3Provider.tsx        # Web3 上下文（Wagmi + RainbowKit + Query）
│
├── types/
│   └── index.ts                # TypeScript 类型定义
│
└── styles/
    └── globals.css             # 全局样式 + CSS 变量 + 主题
```

## 支持的区块链

| 网络 | 链 ID | 状态 |
|------|-------|------|
| Ethereum | 1 | ✅ |
| Base | 8453 | ✅ |
| Arbitrum | 42161 | ✅ |
| HyperEVM | 999 | ✅ |

配置文件: `src/lib/morpho/constants.ts`

## 核心功能模块

### 1. Markets（市场浏览）

**位置**: `src/pages/Markets.tsx` + `src/components/markets/`

**功能**:
- 显示所有 Morpho Blue 市场
- 实时 APY 数据
- 排序（市场、总供应、总借贷、流动性、使用率、LLTV、净APY）
- 供应筛选（最小供应量滑块）
- 搜索功能
- Supply 操作

**数据流**:
```
useMarkets() → GraphQL → Morpho API → MarketsTable
```

### 2. Positions（用户仓位）

**位置**: `src/pages/Positions.tsx` + `src/components/positions/`

**功能**:
- 显示用户在各市场的供应仓位
- 自动计算利润/亏损
- Withdraw 操作

**利润计算逻辑** (`src/lib/utils.ts:calculatePositionProfit`):
```
利润 = 当前价值 - 净存入量
净存入量 = 总供应 - 总提取
```

### 3. Rewards（奖励追踪）

**位置**: `src/pages/Rewards.tsx` + `src/components/rewards/`

**数据来源**:
- Merkl API: `https://api.merkl.xyz/v4`
- Morpho Rewards API: `https://rewards.morpho.org/v1`

**聚合逻辑**: `src/lib/rewards.ts`

## API 集成

### Morpho GraphQL API

**端点**: `https://blue-api.morpho.org/graphql`

**主要查询** (`src/lib/morpho/api.ts`):
- `GetMarkets` - 获取市场列表
- `GetUserPositions` - 用户仓位
- `GetUserTransactions` - 用户交易历史

### 价格数据

**提供商**: DefiLlama
**端点**: `https://coins.llama.fi/prices/current`
**实现**: `src/lib/price.ts`

## 核心类型

```typescript
// 市场
interface Market {
  uniqueKey: string
  lltv: bigint
  loanAsset: Token
  collateralAsset: Token | null
  state: MarketState
}

// 用户仓位
interface UserPosition {
  market: Market
  supplyAssets: bigint
  supplyShares: bigint
  profitData: PositionProfitData
}

// 奖励
interface AggregatedReward {
  tokenAddress: string
  tokenSymbol: string
  totalEarned: bigint
  claimableNow: bigint
  source: 'merkl' | 'morpho'
}
```

完整类型定义: `src/types/index.ts`

## 开发命令

```bash
bun run dev          # 开发服务器 (localhost:5173)
bun run build        # 生产构建
bun run preview      # 预览构建
bun run type-check   # 类型检查
bun run lint         # ESLint 检查
bun run lint:fix     # 自动修复
```

## 常见开发任务

### 添加新链支持

1. **更新常量** (`src/lib/morpho/constants.ts`):
   ```typescript
   // 1. 如果是自定义链，添加 Chain 定义
   export const newChain: Chain = {
     id: NEW_CHAIN_ID,
     name: 'NewChain',
     nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
     rpcUrls: { default: { http: ['https://rpc.newchain.com'] } },
     blockExplorers: { default: { name: 'NewChain Scan', url: 'https://scan.newchain.com' } },
   }

   // 2. 添加 RPC URL
   export const RPC_URLS: Record<number, string[]> = {
     // ...existing
     [NEW_CHAIN_ID]: ['https://rpc.newchain.com'],
   }

   // 3. 添加到 CHAIN_MAP
   export const CHAIN_MAP: Record<number, Chain> = {
     // ...existing
     [NEW_CHAIN_ID]: newChain,
   }

   // 4. 添加链配置
   export const CHAIN_CONFIG: Record<number, ChainConfig> = {
     // ...existing
     [NEW_CHAIN_ID]: {
       id: NEW_CHAIN_ID,
       name: 'NewChain',
       shortName: 'NewChain',
       morphoAddress: '0x...' as Address,
       explorerUrl: 'https://scan.newchain.com',
       morphoAppUrl: 'https://app.morpho.org/newchain',
       logo: '/chain/newchain.png',
     },
   }
   ```

2. **更新 Web3Provider** (`src/providers/Web3Provider.tsx`):
   - 从 constants 导入新链: `import { RPC_URLS, newChain } from '@/lib/morpho/constants'`
   - 添加到 `chains` 数组
   - transports 会自动使用 `RPC_URLS` 配置

3. **添加链图标** (`public/chain/`):
   - 添加 `newchain.png`

4. **更新 ChainSelector** (`src/components/common/ChainSelector.tsx`):
   - 从 constants 导入新链
   - 添加到 `chains` 数组和 `chainLogos` 映射

### 添加新的 UI 组件

1. 在 `src/components/ui/` 创建组件
2. 遵循现有组件模式（使用 `clsx` + `tailwind-merge`）
3. 使用 Radix UI 原语保证可访问性

### 添加新的数据 Hook

1. 在 `src/hooks/` 创建 hook 文件
2. 使用 TanStack Query 进行数据获取:
   ```typescript
   import { useQuery } from '@tanstack/react-query'

   export function useNewData(chainId: number) {
     return useQuery({
       queryKey: ['newData', chainId],
       queryFn: () => fetchNewData(chainId),
       staleTime: 30_000,
     })
   }
   ```

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/components/layout/Header.tsx` 添加导航链接

### 修改表格排序

表格排序逻辑在各自的 Table 组件中：
- `src/components/markets/MarketsTable.tsx`
- `src/components/positions/PositionsTable.tsx`
- `src/components/rewards/RewardsTable.tsx`

排序状态持久化使用 localStorage。

## 代码风格约定

### 组件结构

```typescript
// 1. 导入
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 类型定义
interface Props {
  // ...
}

// 3. 组件
export function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  const [state, setState] = useState()

  // 计算/派生状态
  const derived = useMemo(() => ..., [deps])

  // 事件处理
  const handleClick = () => {}

  // 渲染
  return <div>...</div>
}
```

### 样式约定

- 使用 Tailwind CSS 类
- 复杂类名使用 `clsx` + `tailwind-merge`
- 主题相关使用 CSS 变量 (`var(--bg-primary)`)
- 响应式优先考虑移动端

### 命名约定

- 组件: PascalCase (`MarketsTable.tsx`)
- Hooks: camelCase，use 前缀 (`useMarkets.ts`)
- 工具函数: camelCase (`formatUsd`)
- 类型: PascalCase (`Market`, `UserPosition`)
- 常量: SCREAMING_SNAKE_CASE (`CHAIN_CONFIG`)

## 构建优化

Vite 配置 (`vite.config.ts`) 包含:
- 代码分割 (react-vendor, web3-vendor, query-vendor)
- 生产环境代码混淆
- 安全头部配置
- Source maps 禁用

## 注意事项

1. **BigInt 处理**: 所有链上金额使用 BigInt，格式化时使用 `formatTokenAmount`
2. **Token 精度**: 注意不同 Token 的 decimals 差异
3. **错误处理**: 所有 API 调用需要 try-catch 和用户友好的错误提示
4. **主题兼容**: 新组件需要支持深色/浅色主题
5. **响应式**: 组件需要在移动端正常显示

## 关键文件快速索引

| 需求 | 文件 |
|------|------|
| 添加新链 | `src/lib/morpho/constants.ts`, `src/providers/Web3Provider.tsx` |
| 修改 API 查询 | `src/lib/morpho/api.ts` |
| 添加新奖励来源 | `src/lib/rewards.ts`, `src/hooks/useRewards.ts` |
| 修改样式主题 | `src/styles/globals.css` |
| 添加合约交互 | `src/lib/morpho/abi.ts`, `src/hooks/useSupply.ts` |
| 格式化工具 | `src/lib/utils.ts` |
| 类型定义 | `src/types/index.ts` |
