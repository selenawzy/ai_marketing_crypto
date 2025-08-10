import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { getNetworkConfig } from '../config/networks';
import { initOnRamp } from '@coinbase/cbpay-js';
import axios from '../api/axiosConfig';

interface OnrampProps {
  contentId?: number;
  amount?: string;
  currency?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// Coinbase Onramp SDK handles quotes internally

const CoinbaseOnramp: React.FC<OnrampProps> = ({
  contentId,
  amount = '10',
  currency = 'USDC',
  onSuccess,
  onError
}) => {
  const { account, provider, signer, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const networkConfig = getNetworkConfig();

  // Component initialization - no need for quote generation as Onramp handles this
  useEffect(() => {
    setError(null);
  }, [amount, currency]);

  // Buy with Real Money (Fiat) - Coinbase Onramp
  const handleFiatPayment = async () => {
    console.log('🚀 Starting Coinbase Onramp initialization...');
    console.log('Account:', account);
    
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appId = process.env.REACT_APP_COINBASE_PROJECT_ID || 'de44a0ba-d4ff-432c-85e7-e70336fe4837';
      console.log('Using App ID:', appId);
      
      // First, get session token from backend
      console.log('🎫 Requesting session token...');
      const tokenResponse = await axios.post('/api/onramp/session-token', {
        walletAddress: account
      });

      if (!tokenResponse.data.success || !tokenResponse.data.data.sessionToken) {
        throw new Error('Invalid session token response');
      }

      const tokenData = tokenResponse.data;
      if (!tokenData.success || !tokenData.data.sessionToken) {
        throw new Error('Invalid session token response');
      }

      const sessionToken = tokenData.data.sessionToken;
      console.log('✅ Session token received:', sessionToken.substring(0, 20) + '...');

      console.log('Widget Parameters:', {
        addresses: { [account]: ['base'] },
        assets: ['USDC', 'ETH'],
        presetFiatAmount: parseInt(amount) || 25,
        fiatCurrency: 'USD',
        sessionToken: sessionToken.substring(0, 20) + '...'
      });

      // Initialize Coinbase Onramp with proper configuration
      console.log('🎫 Configuring Onramp with session token...');
      
      // Always use the One-Click Buy URL format with session token
      // Both sandbox and production require valid session tokens
      const isSandbox = process.env.REACT_APP_USE_SANDBOX !== 'false';
      const baseUrl = isSandbox 
        ? 'https://pay-sandbox.coinbase.com'
        : 'https://pay.coinbase.com';
      
      // Use correct sandbox URL format: /?sessionToken=<token>&<other params>
      const onrampUrl: string = `${baseUrl}/?` +
        `sessionToken=${encodeURIComponent(sessionToken)}&` +
        `defaultAsset=USDC&` +
        `defaultNetwork=base&` +
        `presetFiatAmount=${parseInt(amount) || 25}&` +
        `fiatCurrency=USD&` +
        `defaultExperience=buy&` +
        `partnerUserId=${account.substring(0, 50)}&` +
        `redirectUrl=${encodeURIComponent(window.location.origin + '/payment/success')}`;
      
      console.log(`🔗 Direct Onramp URL (${isSandbox ? 'SANDBOX' : 'PRODUCTION'}):`, onrampUrl);
      
      // IMPORTANT: For secure initialization, we must use the sessionToken approach
      // The SDK should NOT use appId with widgetParameters when sessionToken is present
      const onrampConfig: any = {
        // DO NOT include appId when using sessionToken - they are mutually exclusive
        // appId: appId, // REMOVED - causes conflict with sessionToken
        sessionToken: sessionToken, // This is the ONLY authentication needed
        onSuccess: () => {
          console.log('✅ Coinbase Onramp Success');
          setLoading(false);
          onSuccess?.({ success: true });
        },
        onExit: () => {
          console.log('👋 Coinbase Onramp Exit');
          setLoading(false);
        },
        onEvent: (event: any) => {
          console.log('📊 Coinbase Onramp Event:', event);
        },
        experienceLoggedIn: 'popup',
        closeOnExit: true,
        experienceLoggedOut: 'popup'
        // Note: widgetParameters are embedded in the sessionToken, not passed separately
      };

      console.log('🚀 Initializing Onramp with config:', {
        hasSessionToken: !!onrampConfig.sessionToken,
        sessionTokenPreview: onrampConfig.sessionToken?.substring(0, 30) + '...'
      });

      // Additional debug: Check if session token is properly formatted
      if (!onrampConfig.sessionToken || onrampConfig.sessionToken.startsWith('dev_')) {
        console.warn('⚠️ Using development session token - may not work in production');
        console.log('Full session token:', onrampConfig.sessionToken);
      }

      // Try to initialize with SDK
      try {
        initOnRamp(onrampConfig, (error: any, instance: any) => {
          console.log('📥 Callback received - Error:', error, 'Instance:', instance);
          
          if (error || !instance) {
            console.error('❌ SDK initialization failed:', error);
            console.log('🔗 Using direct URL approach with session token');
            
            // Always use the direct URL as fallback - it's more reliable
            window.open(onrampUrl, '_blank');
            setLoading(false);
            onSuccess?.({ success: true, method: 'direct_url' });
            return;
          }
          
          if (instance) {
            console.log('✅ Onramp instance created, opening widget...');
            instance.open();
          }
        });
      } catch (sdkError) {
        console.error('❌ SDK error:', sdkError);
        console.log('🔗 Opening direct URL with session token');
        
        // Direct URL fallback
        window.open(onrampUrl, '_blank');
        setLoading(false);
        onSuccess?.({ success: true, method: 'direct_url' });
      }
      
    } catch (err: any) {
      console.error('❌ Coinbase Onramp Error:', err);
      setError(err.message || 'Failed to initialize Coinbase Onramp');
      onError?.(err.message || 'Failed to initialize Coinbase Onramp');
      setLoading(false);
    }
  };

  // Buy with Crypto (ETH) - Real Base Sepolia transaction
  const handleCryptoPayment = async () => {
    if (!account || !window.ethereum) {
      setError('Please connect your Coinbase Wallet first');
      return;
    }

    // Ensure we're on the correct network
    if (chainId !== networkConfig.chainId) {
      setError(`Please switch to ${networkConfig.name} (Chain ID: ${networkConfig.chainId})`);
      return;
    }

    if (!provider || !signer) {
      setError('Web3 provider not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use connected wallet as receiver (user's wallet gets the test tokens)
      const RECEIVER_ADDRESS = account; // User's connected wallet receives the tokens
      
      // Convert amount to ETH (assuming 1 USDC ≈ 0.001 ETH for demo)
      const ethAmountNum = parseFloat(amount) * 0.001;
      const ethAmount = ethAmountNum.toFixed(6); // Limit to 6 decimal places to avoid precision errors
      const amountInWei = ethers.parseEther(ethAmount);

      // Check ETH balance first
      const balance = await provider.getBalance(account);
      const balanceFormatted = ethers.formatEther(balance);
      
      if (parseFloat(balanceFormatted) < parseFloat(ethAmount)) {
        throw new Error(`Insufficient ETH balance. You have ${parseFloat(balanceFormatted).toFixed(4)} ETH but need ${ethAmount} ETH. Get Base Sepolia ETH from a faucet first.`);
      }

      // Estimate gas for a simple ETH transfer
      const gasEstimate = await provider.estimateGas({
        to: RECEIVER_ADDRESS,
        value: amountInWei
      });
      
      // Execute the ETH transaction
      console.log(`🚀 Sending ${ethAmount} ETH (${amount} USDC equivalent) to ${RECEIVER_ADDRESS} on Base Sepolia...`);
      const tx = await signer.sendTransaction({
        to: RECEIVER_ADDRESS,
        value: amountInWei,
        gasLimit: gasEstimate
      });

      console.log('📝 Transaction submitted:', tx.hash);
      
      // Show pending notification
      const pendingNotification = document.createElement('div');
      pendingNotification.style.cssText = `
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
        max-width: 400px;
      `;
      pendingNotification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 8px;">⏳</span>
          <strong>Transaction Pending...</strong>
        </div>
        <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
          <strong>TX Hash:</strong> ${tx.hash.slice(0, 10)}...<br>
          <strong>Amount:</strong> ${ethAmount} ETH (${amount} USDC equivalent)<br>
          <strong>Network:</strong> Base Sepolia<br>
          <br>
          <em>Waiting for confirmation...</em>
        </div>
      `;
      document.body.appendChild(pendingNotification);

      // Wait for transaction to be mined
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      // Remove pending notification
      if (pendingNotification.parentNode) {
        pendingNotification.parentNode.removeChild(pendingNotification);
      }

      if (!receipt) {
        throw new Error('Transaction receipt not received');
      }

      console.log('✅ Transaction confirmed!', receipt);

      const transactionData = {
        transactionHash: receipt!.hash,
        blockNumber: receipt!.blockNumber,
        from: receipt!.from,
        to: receipt!.to,
        gasUsed: receipt!.gasUsed.toString(),
        status: receipt!.status === 1 ? 'success' : 'failed',
        value: amount,
        currency: currency,
        network: networkConfig.name,
        chainId: networkConfig.chainId,
        timestamp: new Date().toISOString(),
        baseScanUrl: `${networkConfig.blockExplorerUrl}/tx/${receipt!.hash}`
      };

      // Show success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
        max-width: 400px;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 8px;">✅</span>
          <strong>Transaction Success!</strong>
        </div>
        <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
          <strong>TX Hash:</strong> ${receipt!.hash.slice(0, 10)}...<br>
          <strong>Block:</strong> ${receipt!.blockNumber}<br>
          <strong>Amount:</strong> ${ethAmount} ETH (${amount} USDC equivalent)<br>
          <strong>Network:</strong> Base Sepolia<br>
          <strong>Gas Used:</strong> ${receipt!.gasUsed.toString()}<br>
          <br>
          <a href="https://sepolia.basescan.org/tx/${receipt!.hash}" 
             target="_blank" 
             style="color: #87CEEB; text-decoration: underline;">
            🔍 View on BaseScan →
          </a>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 10000);

      // Call success callback
      onSuccess?.(transactionData);
      
      console.log('🎉 Real Base Sepolia transaction completed:', transactionData);

    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      
      let errorMessage = 'Transaction failed';
      if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH for gas fees. Get Base Sepolia ETH from a faucet.';
      } else if (err.message.includes('Insufficient ETH balance')) {
        errorMessage = err.message;
      } else if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else {
        errorMessage = err.message || 'Unknown transaction error';
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Buy Crypto</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-lg">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>
            <span className="text-sm font-bold">Base Sepolia</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Coinbase Onramp Widget handles pricing and quotes internally */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex items-center">
          <div className="text-blue-600 text-xl mr-3">💳</div>
          <div>
            <div className="font-semibold text-blue-900">Buy ${amount} worth of {currency}</div>
            <div className="text-sm text-blue-700">Coinbase Onramp will show live rates and fees</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {!account ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Connect your wallet to continue</p>
            <button className="w-full bg-gray-200 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed">
              Connect Wallet First
            </button>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>ℹ️ Base Sepolia Testnet:</strong><br/>
                • Get free testnet ETH: <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noreferrer" className="underline">Alchemy Faucet</a><br/>
                • Network: Base Sepolia (Chain ID: 84532)
              </p>
            </div>

            {/* Buy with Real Money (Fiat) Button */}
            <button
              onClick={handleFiatPayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opening Coinbase Onramp...
                </>
              ) : (
                <>
                  💳 Buy with Real Money (Coinbase Onramp)
                </>
              )}
            </button>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500 font-medium">OR</span>
              </div>
            </div>

            {/* Buy with Crypto (ETH) Button */}
            <button
              onClick={handleCryptoPayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg transition-all duration-200 shadow-lg"
              title="Use your wallet ETH to purchase"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Transaction...
                </>
              ) : (
                <>
                  ⚡ Buy with Crypto (ETH)
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Powered by Coinbase Onramp • Secure Fiat-to-Crypto Transactions
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span>💳 Card, Bank, Apple Pay</span>
          <span>🌐 Base Network</span>
        </div>
      </div>
    </div>
  );
};

export default CoinbaseOnramp;