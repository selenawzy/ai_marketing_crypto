import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

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

  // Check for existing demo wallet connection on mount
  useEffect(() => {
    const isDemoConnected = localStorage.getItem('demo_wallet_connected');
    const demoAddress = localStorage.getItem('demo_wallet_address');
    
    if (isDemoConnected === 'true' && demoAddress) {
      console.log('🔄 Restoring demo wallet connection:', demoAddress);
      setState({
        provider: null,
        signer: null,
        account: demoAddress,
        chainId: 84532, // Base Sepolia
        isConnected: true,
        balance: '10.0',
      });
    }
  }, []);

  const connectWallet = async () => {
    console.log('🔗 Connect wallet function called');
    console.log('Window ethereum:', !!window.ethereum);
    
    try {
      // Check if user explicitly wants CDP wallet
      const forceCDP = localStorage.getItem('force_cdp_wallet') === 'true';
      const cdpWalletData = localStorage.getItem('cdp_wallet_data');
      
      if (forceCDP && cdpWalletData) {
        console.log('🏦 Using forced CDP wallet connection...');
        const wallet = JSON.parse(cdpWalletData);
        setState({
          provider: null, // CDP wallets don't use browser provider
          signer: null,   // CDP handles signing
          account: wallet.address,
          chainId: 84532, // Base Sepolia
          isConnected: true,
          balance: wallet.balance || '0',
        });
        
        // Clear the force flag
        localStorage.removeItem('force_cdp_wallet');
        
        console.log('✅ CDP wallet connected:', wallet.address);
        return;
      }
      
      // Try MetaMask first (if no CDP forced)
      if (window.ethereum && !forceCDP) {
        console.log('📱 MetaMask detected, attempting connection...');
        const provider = new ethers.BrowserProvider(window.ethereum);
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
        console.log('✅ MetaMask connection successful');
        return;
      }

      // Try CDP wallet connection
      console.log('🏦 Attempting CDP wallet connection...');
      await connectCDPWallet();
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      // Try demo wallet as fallback
      try {
        console.log('🔄 Attempting demo wallet fallback...');
        await connectDemoWallet();
      } catch (demoError) {
        console.error('❌ Demo wallet also failed:', demoError);
        throw new Error('Unable to connect any wallet. Please install MetaMask or use demo mode.');
      }
    }
  };

  const connectCDPWallet = async () => {
    console.log('🏦 Creating CDP wallet connection...');
    
    try {
      // Call backend to create/connect CDP wallet
      const response = await fetch('/api/cdp/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'User CDP Wallet',
          network: 'base-sepolia'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect CDP wallet');
      }

      const data = await response.json();
      const { wallet } = data.data;

      setState({
        provider: null, // CDP wallets don't use browser provider
        signer: null,   // CDP handles signing
        account: wallet.address,
        chainId: 84532, // Base Sepolia
        isConnected: true,
        balance: wallet.balance || '0',
      });

      // Store CDP wallet info
      localStorage.setItem('cdp_wallet_connected', 'true');
      localStorage.setItem('cdp_wallet_address', wallet.address);

      console.log('✅ CDP wallet connected:', wallet.address);

      // Show CDP notification
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1652f0, #0052ff);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 500;
            max-width: 300px;
          `;
          notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">🏦</span>
              <strong>CDP Wallet Connected!</strong>
            </div>
            <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
              Address: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}<br>
              Network: Base Sepolia<br>
              Balance: ${wallet.balance || '0'} ETH<br>
              <br>
              <em>Ready for real transactions!</em>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 5000);
        }, 300);
      }
    } catch (error) {
      console.error('❌ CDP wallet connection failed:', error);
      throw error;
    }
  };

  const connectDemoWallet = async () => {
    console.log('🎯 Creating demo wallet...');
    
    try {
      // Use a consistent demo address for better UX
      const DEMO_ADDRESS = '0x1234567890123456789012345678901234567890';
      console.log('📝 Using demo address:', DEMO_ADDRESS);
      
      // Simulate connection to Base Sepolia testnet
      const baseSepoliaChainId = 84532;
      
      const newState = {
        provider: null, // No real provider for demo
        signer: null,   // No real signer for demo
        account: DEMO_ADDRESS,
        chainId: baseSepoliaChainId,
        isConnected: true,
        balance: '10.0', // Demo balance with more funds for testing
      };
      
      console.log('🔄 Setting new state:', newState);
      setState(newState);

      // Store demo wallet status in localStorage for persistence
      localStorage.setItem('demo_wallet_connected', 'true');
      localStorage.setItem('demo_wallet_address', DEMO_ADDRESS);

      // Show demo notification
      console.log('✅ Demo Wallet Connected:', {
        address: DEMO_ADDRESS,
        network: 'Base Sepolia Testnet',
        balance: '10.0 ETH',
        note: 'This is a demo wallet for testing purposes - safe to use!'
      });

      // Create a user-friendly notification
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 500;
            max-width: 300px;
          `;
          notification.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">🎯</span>
              <strong>Demo Wallet Connected!</strong>
            </div>
            <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
              Address: ${DEMO_ADDRESS.slice(0, 6)}...${DEMO_ADDRESS.slice(-4)}<br>
              Network: Base Sepolia<br>
              Balance: 10.0 ETH<br>
              <br>
              <em>Safe for testing - no real funds!</em>
            </div>
          `;
          document.body.appendChild(notification);
          
          // Remove notification after 5 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 5000);
        }, 300);
      }
      
      console.log('✅ Demo wallet connection completed successfully');
    } catch (error) {
      console.error('❌ Demo wallet creation failed:', error);
      throw new Error('Failed to create demo wallet. Please try again.');
    }
  };

  const disconnectWallet = () => {
    // Clear demo wallet data
    localStorage.removeItem('demo_wallet_connected');
    localStorage.removeItem('demo_wallet_address');
    
    setState({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
      balance: null,
    });
    
    console.log('✅ Wallet disconnected and demo data cleared');
  };

  const switchNetwork = async (chainId: number) => {
    if (!state.provider || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902 && window.ethereum) {
        // Chain not added, add it
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: 'Base',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            },
          ],
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