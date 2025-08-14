# Block Tracker

## What This App Does

Block Tracker is a blockchain wallet explorer application that allows users to search and analyze cryptocurrency wallets across multiple blockchain networks. The app provides:

- **Multi-Chain Wallet Search**: Search for wallet addresses across Ethereum, Binance Chain, Polygon, Arbitrum, and Base Chain networks
- **Real-Time Balance Display**: View current wallet balances in native currencies (ETH, BNB, MATIC, ARBI, BASE)
- **Transaction History**: Browse recent transaction history for any wallet address
- **Chain Selection**: Easy dropdown selection to switch between different blockchain networks
- **Live Data**: Real-time blockchain data fetched through the Etherscan and Alchemy APIs
- **Search History**: Recent searches are saved in localStorage, offering better UX
- **Responsive Interface**: Clean, user-friendly interface, including dark mode toggle


Users simply enter a wallet address, select their desired blockchain network, and then hit the submit button to view wallet information including current balance and transaction history.

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
- **Alchemy API**

### Architecture
- **Component-Based Architecture** - Modular React components
- **Service Layer Pattern** - Separation of concerns for external API integration
- **RESTful API Design** - Clean API structure for data fetching
- **Type-Safe Development** - Full TypeScript implementation for reliability
- **Security** - No hard-coded credentials. API keys are retrieved from secrets and added to environment variable during deploy.
- **Performance** - Cache API fetches for 2 minutes for better performance

## Getting Started

First, add your Etherscan and Alchemy API keys to `.env.local` like this:

```
ETHERSCAN_API_KEY=YOUR_API_KEY_GOES_HERE
ALCHEMY_API_KEY=YOUR_API_KEY_GOES_HERE
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

