import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import WalletConnect from '../components/WalletConnect';
import CoinbaseOnramp from '../components/CoinbaseOnramp';
import { getNetworkConfig, isTestnet } from '../config/networks';

const BuyCrypto: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const networkConfig = getNetworkConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Crypto Agent Marketplace</h1>
              </Link>
            </div>
            <nav className="flex space-x-4 items-center">
              <Link to="/browse" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Browse Agents
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">💳 Buy Crypto with Real Money</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Purchase cryptocurrency instantly using Apple Pay, debit card, or bank transfer. 
            Powered by Coinbase's secure and trusted payment infrastructure.
          </p>
        </div>

        {/* CDP Configured Alert */}
        <div className="mb-8 p-4 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center justify-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <div className="font-semibold text-green-900">CDP API Configured</div>
              <div className="text-sm text-green-800">
                Using your CDP API key: a5ec0520-3f51-4e24-bf63-095cb82efc0a for session token generation
              </div>
            </div>
          </div>
        </div>

        {/* Sandbox Mode Alert */}
        <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-center">
            <div className="text-2xl mr-3">🧪</div>
            <div>
              <div className="font-semibold text-yellow-900">Sandbox Mode Active</div>
              <div className="text-sm text-yellow-800">
                Using Coinbase Sandbox for testing. Test with card: 4242 4242 4242 4242, any valid email/phone, verification code: 000000
              </div>
            </div>
          </div>
        </div>

        {/* Network Status Alert */}
        <div className={`mb-8 p-4 rounded-lg ${isTestnet() ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center justify-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${isTestnet() ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${isTestnet() ? 'text-orange-800' : 'text-green-800'}`}>
              Connected to {networkConfig.name} {isTestnet() ? '(Testnet - Sandbox Mode)' : '(Mainnet)'}
            </span>
          </div>
        </div>

        {/* Wallet Connection Section */}
        {!isConnected && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-6">
                Connect your wallet to receive cryptocurrency purchases directly to your address.
              </p>
              <WalletConnect />
            </div>
          </div>
        )}

        {/* Main Onramp Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Coinbase Onramp Widget */}
          <div className="lg:col-span-1">
            <CoinbaseOnramp 
              amount="25"
              currency="USDC"
              onSuccess={(result) => {
                console.log('✅ Purchase successful:', result);
                // Could add success notification here
              }}
              onError={(error) => {
                console.error('❌ Purchase failed:', error);
                // Could add error notification here
              }}
            />
          </div>

          {/* Information Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Use Coinbase Onramp?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🔒</div>
                  <div>
                    <div className="font-medium text-gray-900">Secure & Trusted</div>
                    <div className="text-sm text-gray-600">Regulated and trusted by millions of users worldwide</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">⚡</div>
                  <div>
                    <div className="font-medium text-gray-900">Instant Transactions</div>
                    <div className="text-sm text-gray-600">Funds appear in your wallet within minutes</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">💳</div>
                  <div>
                    <div className="font-medium text-gray-900">Multiple Payment Options</div>
                    <div className="text-sm text-gray-600">Apple Pay, debit card, bank transfer, and more</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🌐</div>
                  <div>
                    <div className="font-medium text-gray-900">Direct to Wallet</div>
                    <div className="text-sm text-gray-600">Cryptocurrency goes directly to your connected wallet</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Cryptocurrencies */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Cryptocurrencies</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mr-3">₿</div>
                  <div>
                    <div className="font-medium text-gray-900">Bitcoin</div>
                    <div className="text-sm text-gray-600">BTC</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl mr-3">Ξ</div>
                  <div>
                    <div className="font-medium text-gray-900">Ethereum</div>
                    <div className="text-sm text-gray-600">ETH</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mr-3">💰</div>
                  <div>
                    <div className="font-medium text-gray-900">USD Coin</div>
                    <div className="text-sm text-gray-600">USDC</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mr-3">🔵</div>
                  <div>
                    <div className="font-medium text-gray-900">Base ETH</div>
                    <div className="text-sm text-gray-600">ETH on Base</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="text-lg mr-3">1️⃣</div>
                  <span className="text-gray-700">Purchase crypto using the widget</span>
                </div>
                <div className="flex items-center">
                  <div className="text-lg mr-3">2️⃣</div>
                  <span className="text-gray-700">Funds appear in your connected wallet</span>
                </div>
                <div className="flex items-center">
                  <div className="text-lg mr-3">3️⃣</div>
                  <span className="text-gray-700">
                    <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium">
                      Browse and use AI agents
                    </Link>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Testnet Notice */}
        {isTestnet() && (
          <div className="mt-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚠️</div>
              <div>
                <div className="font-semibold text-orange-900">Testnet Mode</div>
                <div className="text-sm text-orange-800">
                  You're currently on {networkConfig.name}. This is for testing purposes only. 
                  Purchases made here use sandbox mode and won't charge real money.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyCrypto;