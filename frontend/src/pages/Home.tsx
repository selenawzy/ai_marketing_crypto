import React from 'react';
import { Link } from 'react-router-dom';
import CoinbaseOnramp from '../components/CoinbaseOnramp';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AI Agent Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Monetize your content with AI agents on the blockchain. 
          Powered by <strong>Coinbase Pay</strong> for seamless crypto payments.
        </p>
        
        {/* Coinbase Challenge Badge */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full inline-flex items-center mb-8">
          <span className="mr-2">🏆</span>
          <span className="font-semibold">Coinbase Developer Platform Hackathon</span>
        </div>
        
        <div className="space-x-4">
          <Link 
            to="/marketplace" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block font-semibold"
          >
            Explore Marketplace
          </Link>
          <Link 
            to="/create-content" 
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 inline-block font-semibold"
          >
            Create Content
          </Link>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">Coinbase Pay Integration</h3>
          <p className="text-gray-600">
            Seamless USDC payments on Base network with no gas fees. 
            Support for cards, bank transfers, and Apple Pay.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Agent Access</h3>
          <p className="text-gray-600">
            AI agents can purchase and access premium content automatically 
            using smart contracts and onramp functionality.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Instant Monetization</h3>
          <p className="text-gray-600">
            Creators get paid instantly in USDC when their content is accessed. 
            Global reach with crypto payments.
          </p>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-8 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try Coinbase Pay Demo
            </h2>
            <p className="text-gray-600">
              Experience our frictionless checkout flow powered by Coinbase Onramp APIs
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                🚀 One-Click Crypto Purchase
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Pay with card, bank, or Apple Pay
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Automatic USDC conversion on Base
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  No gas fees or technical complexity
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Instant content access
                </li>
              </ul>
            </div>
            
            <div className="md:w-1/3">
              <CoinbaseOnramp
                amount="25"
                currency="USDC"
                onSuccess={(data) => {
                  console.log('Demo purchase successful:', data);
                  alert('Demo successful! In production, this would grant access to premium content.');
                }}
                onError={(error) => {
                  console.error('Demo error:', error);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coinbase Integration Highlight */}
      <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Built with Coinbase Developer Platform
        </h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          This application demonstrates how to build frictionless checkout flows using 
          Coinbase's Onramp APIs, removing crypto UX hurdles and enabling global payments.
        </p>
        <div className="flex justify-center items-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold">⚡</div>
            <div className="text-sm">Instant</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">🔒</div>
            <div className="text-sm">Secure</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">🌍</div>
            <div className="text-sm">Global</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">💳</div>
            <div className="text-sm">Multiple Payment Methods</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-4">
          <div className="text-2xl font-bold text-blue-600">$0</div>
          <div className="text-sm text-gray-500">Gas Fees</div>
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold text-green-600">⚡</div>
          <div className="text-sm text-gray-500">Instant Settlement</div>
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold text-purple-600">Base</div>
          <div className="text-sm text-gray-500">Network</div>
        </div>
        <div className="p-4">
          <div className="text-2xl font-bold text-orange-600">USDC</div>
          <div className="text-sm text-gray-500">Stablecoin</div>
        </div>
      </div>
    </div>
  );
};

export default Home;