// Walrus configuration for different networks
// Based on https://docs.wal.app/usage/web-api.html

export interface WalrusEndpoints {
  publisher: string;
  aggregator: string;
}

// Testnet endpoints (default)
export const WALRUS_TESTNET: WalrusEndpoints = {
  publisher: 'https://publisher.walrus-testnet.walrus.space',
  aggregator: 'https://aggregator.walrus-testnet.walrus.space'
};

// Mainnet endpoints
export const WALRUS_MAINNET: WalrusEndpoints = {
  publisher: 'https://publisher.walrus-mainnet.walrus.space',
  aggregator: 'https://aggregator.walrus-mainnet.walrus.space'
};

// Alternative testnet endpoints (backup options)
export const WALRUS_TESTNET_ALTERNATIVES: WalrusEndpoints[] = [
  {
    publisher: 'https://publisher.testnet.walrus.atalma.io',
    aggregator: 'https://aggregator.testnet.walrus.atalma.io'
  },
  {
    publisher: 'https://publisher.walrus-01.tududes.com',
    aggregator: 'https://aggregator.walrus-01.tududes.com'
  },
  {
    publisher: 'https://publisher.walrus.banansen.dev',
    aggregator: 'https://aggregator.walrus.banansen.dev'
  }
];

// Get current environment configuration
export const getWalrusConfig = (): WalrusEndpoints => {
  const env = import.meta.env.VITE_WALRUS_NETWORK || 'testnet';
  
  switch (env) {
    case 'mainnet':
      return WALRUS_MAINNET;
    case 'testnet':
    default:
      return WALRUS_TESTNET;
  }
};

// Get alternative endpoints for fallback
export const getWalrusFallbackConfig = (): WalrusEndpoints => {
  const alternatives = WALRUS_TESTNET_ALTERNATIVES;
  const randomIndex = Math.floor(Math.random() * alternatives.length);
  return alternatives[randomIndex];
};

// Environment variables for configuration
export const WALRUS_CONFIG = {
  network: import.meta.env.VITE_WALRUS_NETWORK || 'testnet',
  epochs: parseInt(import.meta.env.VITE_WALRUS_EPOCHS || '1'),
  deletable: import.meta.env.VITE_WALRUS_DELETABLE === 'true',
  maxFileSize: parseInt(import.meta.env.VITE_WALRUS_MAX_FILE_SIZE || '10485760') // 10MB default
}; 