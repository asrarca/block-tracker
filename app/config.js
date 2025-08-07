const config = {
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  ETHERSCAN_API_URL: 'https://api.etherscan.io/v2/api',
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
  ALCHEMY_API_URL_V1: 'https://api.g.alchemy.com/data/v1/' + process.env.ALCHEMY_API_KEY,
  ALCHEMY_API_URL_V2: 'https://eth-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY,
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
