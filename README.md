# Block Tracker

## What This App Does

Block Tracker is a blockchain wallet explorer application that allows users to search and analyze cryptocurrency wallets across multiple blockchain networks. The app provides:

- **Multi-Chain Wallet Search**: Search for wallet addresses across Ethereum, Binance Chain, Polygon, Arbitrum, and Base Chain networks
- **Real-Time Balance Display**: View current wallet balances in native currencies (ETH, BNB, MATIC, ARBI, BASE)
- **Transaction History**: Browse complete transaction history for any wallet address
- **Chain Selection**: Easy dropdown selection to switch between different blockchain networks
- **Live Data**: Real-time blockchain data fetched through the Etherscan API
- **Responsive Interface**: Clean, user-friendly interface built with modern web technologies

Users simply enter a wallet address, select their desired blockchain network, and instantly view comprehensive wallet information including current balance and transaction history.

## Technology Stack

### Frontend
- **Next.js 15.4.4**
- **React 19.1.0**
- **TypeScript 5**
- **Tailwind CSS 4.1.11**
- **DaisyUI 5.0**

### Backend & API
- **Next.js API Routes**
- **Etherscan API**

### Architecture
- **Component-Based Architecture** - Modular React components
- **Service Layer Pattern** - Separation of concerns for external API integration
- **RESTful API Design** - Clean API structure for data fetching
- **Type-Safe Development** - Full TypeScript implementation for reliability

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
