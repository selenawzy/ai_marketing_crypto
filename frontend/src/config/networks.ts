export interface NetworkConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  tokens: {
    USDC: string;
    WETH: string;
  };
  faucetUrl?: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  'base-sepolia': {
    chainId: 84532,
    chainIdHex: '0x14a34',
    name: 'Base Sepolia',
    rpcUrl: 'https://chain-proxy.wallet.coinbase.com?targetName=base-sepolia',
    blockExplorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    tokens: {
      USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      WETH: '0x4200000000000000000000000000000000000006',
    },
    faucetUrl: 'https://www.alchemy.com/faucets/base-sepolia',
  },
  'base-mainnet': {
    chainId: 8453,
    chainIdHex: '0x2105',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    tokens: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      WETH: '0x4200000000000000000000000000000000000006',
    },
  },
};

// Environment-based configuration
export const CURRENT_NETWORK = process.env.REACT_APP_NETWORK || 'base-sepolia';
export const getNetworkConfig = (): NetworkConfig => {
  return NETWORKS[CURRENT_NETWORK];
};

export const isTestnet = (): boolean => {
  return CURRENT_NETWORK.includes('sepolia') || CURRENT_NETWORK.includes('testnet');
};