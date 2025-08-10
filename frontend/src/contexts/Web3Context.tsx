import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getNetworkConfig } from '../config/networks';

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  balance: string | null;
}

interface Web3ContextType extends Web3State {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    isConnected: false,
    balance: null,
  });

  // Disabled auto-connect - user must manually connect wallet
  useEffect(() => {
    console.log('Web3 provider initialized - wallet connection disabled until user action');
    // Auto-connect disabled for better UX - users will manually connect
  }, []);

  const connectWallet = async () => {
    console.log('🔗 Connect wallet function called');
    console.log('Window ethereum:', !!window.ethereum);
    
    if (!window.ethereum) {
      throw new Error('🔌 No wallet detected! Please install Coinbase Wallet or MetaMask to connect and manage your crypto transactions.');
    }

    // Check for multiple wallets and give priority to Coinbase Wallet
    let selectedProvider = window.ethereum;
    
    // If window.ethereum.providers exists (injected by multiple wallets)
    if ((window.ethereum as any).providers && Array.isArray((window.ethereum as any).providers)) {
      console.log('🔄 Multiple wallets detected, showing wallet selection...');
      const providers = (window.ethereum as any).providers;
      
      // Look for available wallets
      const coinbaseProvider = providers.find((p: any) => p.isCoinbaseWallet);
      const metamaskProvider = providers.find((p: any) => p.isMetaMask);
      
      if (coinbaseProvider && metamaskProvider) {
        // Show wallet selection dialog
        const walletChoice = window.confirm(
          '🔵 Coinbase Wallet or 🦊 MetaMask?\n\n' +
          '✅ Click OK to use Coinbase Wallet\n' +
          '❌ Click Cancel to use MetaMask\n\n' +
          'Note: Your payment transactions will use the selected wallet.'
        );
        
        if (walletChoice) {
          selectedProvider = coinbaseProvider;
          console.log('🔵 User selected Coinbase Wallet');
        } else {
          selectedProvider = metamaskProvider;
          console.log('🦊 User selected MetaMask');
        }
      } else if (coinbaseProvider) {
        selectedProvider = coinbaseProvider;
        console.log('🔵 Using Coinbase Wallet');
      } else if (metamaskProvider) {
        selectedProvider = metamaskProvider;
        console.log('🦊 Using MetaMask');
      }
    } else {
      // Single wallet detected
      if (window.ethereum.isCoinbaseWallet) {
        console.log('🔵 Using Coinbase Wallet');
      } else if (window.ethereum.isMetaMask) {
        console.log('🦊 Using MetaMask');  
      } else {
        console.log('👛 Using detected wallet');
      }
    }
    
    try {
      console.log('📱 Wallet detected, attempting connection...');
      const provider = new ethers.BrowserProvider(selectedProvider);
      const accounts = await provider.send('eth_requestAccounts', []);
      console.log('✅ Accounts received:', accounts);
      
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);
      console.log('✅ Network and balance retrieved');

      setState({
        provider,
        signer,
        account: accounts[0],
        chainId: Number(network.chainId),
        isConnected: true,
        balance: ethers.formatEther(balance),
      });
      
      // Automatically switch to configured network if not already on it
      const networkConfig = getNetworkConfig();
      if (Number(network.chainId) !== networkConfig.chainId) {
        console.log(`🔄 Switching to ${networkConfig.name}...`);
        try {
          await switchNetwork(networkConfig.chainId);
          console.log(`✅ Successfully switched to ${networkConfig.name}`);
        } catch (switchError) {
          console.warn(`⚠️ Could not switch to ${networkConfig.name} automatically:`, switchError);
        }
      }
      
      console.log('✅ Wallet connection successful');
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      let errorMessage = '🔗 Unable to connect wallet. ';
      
      if (error.message?.includes('rejected')) {
        errorMessage += 'Connection was rejected. Please try again and approve the connection request.';
      } else if (error.message?.includes('already pending')) {
        errorMessage += 'A connection request is already pending. Please check your wallet.';
      } else if (error.message?.includes('unauthorized')) {
        errorMessage += 'Wallet access denied. Please unlock your wallet and try again.';
      } else {
        errorMessage += 'Please check your wallet is unlocked and try again.';
      }
      
      throw new Error(errorMessage);
    }
  };


  const disconnectWallet = () => {
    setState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
      balance: null,
    });
    
    console.log('✅ Wallet disconnected');
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      throw new Error('🔌 Wallet not connected. Please connect your wallet first.');
    }

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902 && window.ethereum) {
        // Chain not added, add it from config
        const networkConfig = getNetworkConfig();
        if (chainId !== networkConfig.chainId) {
          throw new Error(`Unsupported chain ID: ${chainId}`);
        }

        const walletNetworkConfig = {
          chainId: networkConfig.chainIdHex,
          chainName: networkConfig.name,
          nativeCurrency: networkConfig.nativeCurrency,
          rpcUrls: [networkConfig.rpcUrl],
          blockExplorerUrls: [networkConfig.blockExplorerUrl],
        };

        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [walletNetworkConfig],
        });
      } else {
        throw error;
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setState(prev => ({ ...prev, account: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum!.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const value: Web3ContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}; 