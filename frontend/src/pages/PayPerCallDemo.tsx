import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import WalletConnect from '../components/WalletConnect';
import PayPerCallAgent from '../components/PayPerCallAgent';

const PayPerCallDemo: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { account } = useWeb3();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [callsMade, setCallsMade] = useState(0);

  // Demo wallet address for receiving payments - your testnet wallet
  const DEMO_CREATOR_WALLET = '0xFFada9Cec17EcE63B7B52f17f0C233769E7c42A5';

  // Demo agents with different pricing
  const demoAgents = [
    {
      id: 'marketing-pro',
      name: 'Marketing Strategy Pro',
      description: 'AI agent specialized in creating comprehensive marketing strategies, campaign optimization, and growth hacking techniques.',
      pricePerCall: 0.50,
      creatorWallet: DEMO_CREATOR_WALLET,
      category: 'Strategy',
      features: ['Campaign Strategy', 'Growth Hacking', 'Market Analysis', 'ROI Optimization']
    },
    {
      id: 'content-creator',
      name: 'Content Creation Expert',
      description: 'Generate high-converting blog posts, social media content, ad copy, and email campaigns with AI-powered insights.',
      pricePerCall: 0.25,
      creatorWallet: DEMO_CREATOR_WALLET,
      category: 'Content',
      features: ['Blog Posts', 'Social Media', 'Ad Copy', 'Email Campaigns']
    },
    {
      id: 'seo-optimizer',
      name: 'SEO & Analytics Master',
      description: 'Advanced SEO analysis, keyword research, competitor insights, and technical optimization recommendations.',
      pricePerCall: 0.75,
      creatorWallet: DEMO_CREATOR_WALLET,
      category: 'SEO',
      features: ['Keyword Research', 'Technical SEO', 'Competitor Analysis', 'SERP Optimization']
    }
  ];

  const handlePaymentSuccess = (data: any) => {
    setTotalEarnings(prev => prev + data.amount);
    setCallsMade(prev => prev + 1);
    console.log('🎉 Payment successful:', data);
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200">
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
              <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <WalletConnect />
            </nav>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pay-Per-AI-Call Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Experience the future of AI monetization. Pay micro-amounts for each AI interaction. 
              Creators earn instantly. No subscriptions, no commitments.
            </p>
            
            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-1">Instant Payments</h3>
                <p className="text-sm text-gray-600">Pay only when you use the AI. Blockchain ensures instant, transparent transactions.</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold text-gray-900 mb-1">Creator Earnings</h3>
                <p className="text-sm text-gray-600">AI creators earn from every interaction. Build once, earn continuously.</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-900 mb-1">Trustless System</h3>
                <p className="text-sm text-gray-600">Smart contracts ensure fair payment distribution. No middlemen.</p>
              </div>
            </div>
          </div>

          {/* Demo Stats */}
          {account && (callsMade > 0 || totalEarnings > 0) && (
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-6 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">🎉 Demo Session Stats</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-3xl font-bold">{callsMade}</div>
                    <div className="text-green-100">AI Calls Made</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{totalEarnings.toFixed(2)} USDC</div>
                    <div className="text-green-100">Total Earned (as Creator)</div>
                  </div>
                </div>
                <p className="text-sm text-green-100 mt-4">
                  💡 In this demo, you're both the user (paying for AI calls) and the creator (receiving payments)
                </p>
              </div>
            </div>
          )}

          {!account && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg mb-8">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span className="font-semibold">Connect your wallet to try the pay-per-AI-call demo</span>
              </div>
              <p className="text-sm mt-2">Your wallet will act as both the user (paying for AI calls) and the creator (receiving payments) in this demo.</p>
            </div>
          )}

          {/* AI Agents Grid */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Available AI Marketing Agents</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {demoAgents.map((agent) => (
                <div key={agent.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Agent Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {agent.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{agent.pricePerCall} USDC</div>
                        <div className="text-blue-100 text-sm">per call</div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Details */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {agent.description}
                    </p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.features.map((feature, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Embed PayPerCallAgent Component */}
                    <div className="border-t pt-4">
                      <PayPerCallAgent
                        agentId={agent.id}
                        agentName={agent.name}
                        pricePerCall={agent.pricePerCall}
                        creatorWallet={agent.creatorWallet}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it Works */}
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How Pay-Per-AI-Call Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose Agent</h3>
                <p className="text-sm text-gray-600">Select an AI agent based on your needs and budget</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Enter Prompt</h3>
                <p className="text-sm text-gray-600">Write your question or request for the AI agent</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Pay & Execute</h3>
                <p className="text-sm text-gray-600">Pay with crypto and get instant AI response</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
                <h3 className="font-semibold text-gray-900 mb-2">Creator Earns</h3>
                <p className="text-sm text-gray-600">Payment goes directly to the AI agent creator</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own AI Agent?</h2>
              <p className="text-xl text-blue-100 mb-6">
                Build AI agents, set your price, and earn from every interaction
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/agents/create"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  🎨 Create Agent
                </Link>
                <Link
                  to="/browse"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                >
                  🔍 Browse More Agents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPerCallDemo;