import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';

const WalletConnect: React.FC = () => {
  const web3State = useWeb3();
  const { isAuthenticated } = useAuth();
  const [connecting, setConnecting] = useState(false);

  // Safely destructure with defaults
  const {
    account = null,
    isConnected = false,
    connectWallet,
    disconnectWallet,
    chainId = null,
    balance = null
  } = web3State || {};

  const handleConnect = async () => {
    console.log('🚀 Connect button clicked!');
    
    // Require authentication first
    if (!isAuthenticated) {
      // Create a prettier notification instead of alert
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 8px;">🔐</span>
          <strong>Authentication Required</strong>
        </div>
        <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
          Please sign in first before connecting your wallet for security reasons.
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
      return;
    }
    
    console.log('Connect function available:', !!connectWallet);
    
    if (!connectWallet) {
      console.error('❌ Connect wallet function not available!');
      return;
    }
    
    setConnecting(true);
    console.log('⏳ Setting connecting state to true');
    
    try {
      console.log('🔄 Calling connectWallet function...');
      await connectWallet();
      console.log('✅ Connect wallet function completed');
      
      // After connecting, try to switch to Base Sepolia if needed
      if (window.ethereum && web3State?.switchNetwork && chainId !== 84532) {
        console.log('🔄 Attempting to switch to Base Sepolia testnet...');
        try {
          await web3State.switchNetwork(84532);
          console.log('✅ Successfully switched to Base Sepolia');
        } catch (switchError) {
          console.warn('⚠️ Could not switch to Base Sepolia automatically:', switchError);
        }
      }
    } catch (error) {
      console.error('❌ Connect wallet failed:', error);
    } finally {
      setConnecting(false);
      console.log('✅ Setting connecting state to false');
    }
  };

  const handleSwitchToBaseSepolia = async () => {
    if (web3State?.switchNetwork) {
      try {
        await web3State.switchNetwork(84532);
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
    }
  };

  const handleDisconnect = async () => {
    if (disconnectWallet) {
      disconnectWallet();
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    const networkName = chainId === 84532 ? 'Base Sepolia' : chainId === 8453 ? 'Base' : chainId ? `Chain ${chainId}` : 'Unknown';
    
    return (
      <div className="flex items-center space-x-3">
        {/* Connected Status */}
        <div className="border rounded-lg px-4 py-2 flex items-center bg-green-500/10 border-green-500/30 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full mr-2 animate-pulse bg-green-400"></div>
          <span className="text-sm font-medium text-green-300">
            {formatAddress(account)}
          </span>
        </div>

        {/* Network Badge with Switch Button */}
        <div className="flex items-center space-x-2">
          <div className={`border rounded-lg px-3 py-1 backdrop-blur-sm ${
            chainId === 84532 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <span className={`text-xs font-medium ${
              chainId === 84532 ? 'text-blue-300' : 'text-orange-300'
            }`}>
              {networkName}
            </span>
          </div>
          
          {/* Switch to Base Sepolia button if not on testnet */}
          {chainId !== 84532 && (
            <button
              onClick={handleSwitchToBaseSepolia}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-lg font-medium transition-colors shadow-lg"
              title="Switch to Base Sepolia Testnet"
            >
              Switch to Base Sepolia
            </button>
          )}
        </div>

        {/* Balance */}
        {balance && (
          <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 backdrop-blur-sm">
            <span className="text-xs font-medium text-white/90">
              {parseFloat(balance).toFixed(3)} ETH
            </span>
          </div>
        )}

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
          title="Disconnect Wallet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleConnect}
        disabled={connecting || !connectWallet}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center"
      >
        {connecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            👛 Connect Wallet
          </>
        )}
      </button>
    </div>
  );
};

export default WalletConnect;