import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

interface OnrampProps {
  contentId?: number;
  amount?: string;
  currency?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface Quote {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  baseAmount: string;
  targetAmount: string;
  exchangeRate: number;
  fees: {
    coinbaseFee: string;
    networkFee: string;
    total: string;
  };
  expiresAt: string;
  paymentMethods: string[];
  network: string;
}

const CoinbaseOnramp: React.FC<OnrampProps> = ({
  contentId,
  amount = '10',
  currency = 'USDC',
  onSuccess,
  onError
}) => {
  const { account } = useWeb3();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  // Generate quote when component mounts
  useEffect(() => {
    if (amount && currency) {
      generateQuote();
    }
  }, [amount, currency]);

  const generateQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/onramp/quote', {
        baseCurrency: 'USD',
        targetCurrency: currency,
        amount: parseFloat(amount),
        amountType: 'buy'
      });

      if (response.data.success) {
        setQuote(response.data.data.quote);
      } else {
        setError(response.data.message || 'Failed to generate quote');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate quote');
      onError?.(err.response?.data?.message || 'Failed to generate quote');
    } finally {
      setLoading(false);
    }
  };

  const generateOnrampUrl = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    // Check if this is demo mode
    const isDemoWallet = account === '0x1234567890123456789012345678901234567890';
    
    if (isDemoWallet) {
      // Simulate successful onramp generation in demo mode
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess?.({
          onrampUrl: 'demo-mode',
          transactionId: 'demo-onramp-' + Date.now(),
          amount: amount,
          currency: currency,
          demo: true
        });
        
        alert(`🎯 Demo Mode: Simulated ${amount} ${currency} purchase!\n\nIn production, this would open Coinbase Pay.\n\nTransaction ID: demo-onramp-${Date.now()}`);
      }, 1000);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/onramp/generate-url', {
        destinationWallet: account,
        presetCryptoAmount: amount,
        cryptoCurrencyCode: currency,
        fiatCurrencyCode: 'USD',
        country: 'US',
        contentId
      });

      if (response.data.success) {
        setOnrampUrl(response.data.data.onrampUrl);
        
        // Check if this is demo mode
        if (response.data.data.demo || response.data.data.onrampUrl === 'demo-mode') {
          // Handle demo mode - just show success without opening window
          alert(`🎯 Demo Mode: Simulated ${amount} ${currency} purchase!\n\nIn production, this would open Coinbase Pay.\n\nDemo transaction completed successfully!`);
          onSuccess?.(response.data.data);
        } else {
          // Open real Coinbase Pay in a new window
          window.open(response.data.data.onrampUrl, '_blank', 'width=400,height=600');
          onSuccess?.(response.data.data);
        }
      } else {
        setError(response.data.message || 'Failed to generate onramp URL');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate onramp URL');
      onError?.(err.response?.data?.message || 'Failed to generate onramp URL');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickBuy = async () => {
    if (!contentId) {
      generateOnrampUrl();
      return;
    }

    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    // Check if this is demo mode
    const isDemoWallet = account === '0x1234567890123456789012345678901234567890';
    
    if (isDemoWallet) {
      // Simulate successful purchase in demo mode
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess?.({
          transactionId: 'demo-tx-' + Date.now(),
          amount: amount,
          currency: currency,
          status: 'completed',
          demo: true
        });
        
        // Show demo success notification
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
            <strong>Demo Purchase Successful!</strong>
          </div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
            Amount: ${amount} ${currency}<br>
            Transaction: Demo Mode<br>
            <br>
            <em>This was a simulated purchase!</em>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 4000);
      }, 1500);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`/api/onramp/content/${contentId}/buy-config`, {
        destinationWallet: account
      });

      if (response.data.success) {
        const { buyConfig } = response.data.data;
        
        // Check if this is demo mode
        if (buyConfig.demo || buyConfig.onrampUrl === 'demo-mode') {
          // Handle demo mode - just show success without opening window
          alert(`🎯 Demo Mode: Simulated purchase completed!\n\nAmount: ${buyConfig.amount} ${buyConfig.currency}\nContent ID: ${buyConfig.contentId}\n\nIn production, this would open Coinbase Pay.`);
          onSuccess?.(buyConfig);
        } else {
          // Open real Coinbase Pay in a new window
          window.open(buyConfig.onrampUrl, '_blank', 'width=400,height=600');
          onSuccess?.(buyConfig);
        }
      } else {
        setError(response.data.message || 'Failed to create buy configuration');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create buy configuration');
      onError?.(err.response?.data?.message || 'Failed to create buy configuration');
    } finally {
      setLoading(false);
    }
  };

  const isDemoWallet = account === '0x1234567890123456789012345678901234567890';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Buy Crypto</h3>
        <div className="flex items-center space-x-2">
          {isDemoWallet && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Demo Mode
            </span>
          )}
          <img 
            src="https://cdn.jsdelivr.net/gh/coinbase/coinbase-kit@main/assets/coinbase-logo.svg" 
            alt="Coinbase" 
            className="h-6"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {quote && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">You pay</span>
            <span className="font-semibold">${quote.baseAmount} {quote.baseCurrency}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">You receive</span>
            <span className="font-semibold">{quote.targetAmount} {quote.targetCurrency}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Exchange rate</span>
            <span className="text-sm">1 {quote.baseCurrency} = {quote.exchangeRate.toFixed(4)} {quote.targetCurrency}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total fees</span>
            <span>${quote.fees.total}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!account ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Connect your wallet to continue</p>
            <button className="w-full bg-gray-200 text-gray-500 py-3 px-4 rounded-lg cursor-not-allowed">
              Connect Wallet First
            </button>
          </div>
        ) : (
          <>
            {isDemoWallet && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-yellow-800 text-sm flex items-center">
                  <span className="mr-2">🎯</span>
                  <strong>Demo Mode:</strong> This will simulate a purchase without real transactions
                </p>
              </div>
            )}

            {contentId ? (
              <button
                onClick={handleOneClickBuy}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {isDemoWallet ? '🎯 Demo Purchase' : '🚀 Buy Now with Crypto'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={generateOnrampUrl}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    {isDemoWallet ? '🎯 Demo Buy ' + currency : '💳 Buy ' + currency + ' with Coinbase'}
                  </>
                )}
              </button>
            )}

            <p className="text-xs text-gray-500 text-center">
              Powered by Coinbase Pay • Secure & Fast
            </p>
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