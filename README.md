# Morpho Tools

A modern web interface for interacting with [Morpho Blue](https://morpho.org/) lending protocol. View markets, manage positions, and track rewards across Ethereum, Base, and Arbitrum.

**Website**: [morpho.not-today.work](https://morpho.not-today.work)

## Features

- **Markets** - Browse and supply to Morpho Blue lending markets with real-time APY data
- **Positions** - View and manage your supply positions across all chains
- **Rewards** - Track and claim Merkl and Morpho rewards
- **Multi-chain** - Support for Ethereum, Base, and Arbitrum
- **Wallet Connect** - Browser extension wallets and Coinbase Wallet via RainbowKit
- **Dark/Light Theme** - Toggle between themes

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Web3**: wagmi 3 + viem
- **Wallet**: RainbowKit
- **Data Fetching**: TanStack Query + GraphQL Request
- **Routing**: React Router 7

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+

### Installation

```bash
# Clone the repository
git clone https://github.com/VitAsLing/morpho-tools.git
cd morpho-tools

# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev

# Open http://localhost:5173
```

### Build

```bash
# Type check and build for production
bun run build

# Preview production build
bun run preview
```

### Other Commands

```bash
# Type check only
bun run type-check

# Lint
bun run lint

# Lint and fix
bun run lint:fix
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (ChainSelector, ConnectButton, TokenLogo)
│   ├── layout/          # Layout components (Header, Layout)
│   ├── markets/         # Markets page components
│   ├── positions/       # Positions page components
│   └── rewards/         # Rewards page components
├── hooks/               # Custom React hooks
├── lib/
│   ├── merkl/           # Merkl API integration
│   └── morpho/          # Morpho API and contract ABIs
├── pages/               # Page components
├── providers/           # Context providers (Web3Provider)
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Deployment

This project is configured for deployment on Cloudflare Pages.

### Cloudflare Pages Settings

| Setting | Value |
|---------|-------|
| Build command | `bun run build` |
| Build output directory | `dist` |
| Node.js version | 20+ |

## API Integrations

- **Morpho GraphQL API** - Market and position data
- **Merkl API** - Rewards data
- **Public RPC Endpoints** - Blockchain interactions (LlamaRPC, Ankr)

## License

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html).

See the [LICENSE](LICENSE) file for details.
