import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

const WalletConnect: React.FC = () => {
  const web3State = useWeb3();
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
    } catch (error) {
      console.error('❌ Connect wallet failed:', error);
    } finally {
      setConnecting(false);
      console.log('✅ Setting connecting state to false');
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
    const isDemoMode = !window.ethereum;
    const networkName = chainId === 84532 ? 'Base Sepolia' : chainId === 8453 ? 'Base' : chainId ? `Chain ${chainId}` : 'Unknown';
    
    return (
      <div className="flex items-center space-x-3">
        {/* Connected Status */}
        <div className={`border rounded-lg px-4 py-2 flex items-center ${
          isDemoMode 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
            isDemoMode ? 'bg-yellow-500' : 'bg-green-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            isDemoMode ? 'text-yellow-800' : 'text-green-800'
          }`}>
            {formatAddress(account)}
          </span>
        </div>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
            <span className="text-xs font-medium text-yellow-800">Demo Mode</span>
          </div>
        )}

        {/* Network Badge */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
          <span className="text-xs font-medium text-blue-800">{networkName}</span>
        </div>

        {/* Balance */}
        {balance && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1">
            <span className="text-xs font-medium text-gray-700">
              {parseFloat(balance).toFixed(3)} ETH
            </span>
          </div>
        )}

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Disconnect Wallet"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  const hasMetaMask = window.ethereum?.isMetaMask;

  const handleConnectCDP = async () => {
    console.log('🏦 CDP Connect button clicked!');
    if (!connectWallet) return;
    setConnecting(true);
    try {
      // Force CDP wallet connection through backend
      const response = await fetch('/api/cdp/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'CDP Testnet Wallet', network: 'base-sepolia' })
      });
      const data = await response.json();
      if (data.success) {
        console.log('✅ CDP wallet created:', data.data.wallet.address);
        // Manually trigger wallet connection with CDP wallet
        window.localStorage.setItem('force_cdp_wallet', 'true');
        window.localStorage.setItem('cdp_wallet_data', JSON.stringify(data.data.wallet));
        await connectWallet();
      } else {
        console.error('❌ CDP connection failed:', data.message);
      }
    } catch (error) {
      console.error('❌ CDP Connect failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectCoinbaseWallet = async () => {
    console.log('🔵 Coinbase Wallet Connect button clicked!');
    if (!connectWallet) return;
    setConnecting(true);
    try {
      // Check if Coinbase Wallet is available
      if (window.ethereum && window.ethereum.isCoinbaseWallet) {
        console.log('🔵 Coinbase Wallet detected, attempting connection...');
        await connectWallet();
      } else {
        // Redirect to Coinbase Wallet if not installed
        window.open('https://www.coinbase.com/wallet', '_blank');
        alert('Please install Coinbase Wallet extension or app to continue');
      }
    } catch (error) {
      console.error('❌ Coinbase Wallet Connect failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const isCoinbaseWallet = window.ethereum?.isCoinbaseWallet;

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex space-x-1 flex-wrap justify-end">
        <button
          onClick={handleConnect}
          disabled={connecting || !connectWallet}
          className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white px-3 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center text-xs"
        >
          {connecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              🦊 MetaMask
            </>
          )}
        </button>

        <button
          onClick={handleConnectCoinbaseWallet}
          disabled={connecting}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center text-xs"
        >
          {connecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              CB Wallet...
            </>
          ) : (
            <>
              🔵 CB Wallet
            </>
          )}
        </button>

        <button
          onClick={handleConnectCDP}
          disabled={connecting}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center text-xs"
        >
          {connecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              CDP...
            </>
          ) : (
            <>
              🏦 CDP Testnet
            </>
          )}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 text-right">
        {hasMetaMask && <span className="text-orange-600">🦊 MetaMask </span>}
        {isCoinbaseWallet && <span className="text-blue-600">🔵 CB Wallet </span>}
        <span className="text-purple-600">🏦 CDP Ready</span>
      </div>
    </div>
  );
};

export default WalletConnect;