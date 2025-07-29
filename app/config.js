const config = {
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  ETHERSCAN_API_URL: 'https://api.etherscan.io/v2/api',
  CHAINS: {
    1: {
      name: 'Ethereum',
      unit: 'ETH',
    },
    56: {
      name: 'Binance Chain',
      unit: 'BNB',
    },
    137: {
      name: 'Polygon',
      unit: 'MATIC',
    },
    42161: {
      name: 'Arbitrum',
      unit: 'ARBI',
    },
    8453: {
      name: 'Base Chain',
      unit: 'BASE',
    },
  },
};

export default config;
