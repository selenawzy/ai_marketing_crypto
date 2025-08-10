import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import WalletConnect from '../components/WalletConnect';
import PayPerCallAgent from '../components/PayPerCallAgent';
import { 
  RocketLaunchIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  CpuChipIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const PayPerCallDemo: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-crypto">
        <div className="max-w-7xl mx-auto responsive-padding">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-crypto">
                  <RocketLaunchIcon className="text-white text-2xl" />
                </div>
                <h1 className="text-2xl font-bold text-white ml-4">CryptoAI</h1>
              </Link>
            </div>
            <nav className="flex space-x-8 items-center">
              <Link to="/browse" className="text-base font-medium text-white/70 hover:text-white transition-colors">
                Browse Agents
              </Link>
              <Link to="/" className="text-base font-medium text-white/70 hover:text-white transition-colors">
                Home
              </Link>
              <WalletConnect />
              {isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <UserIcon className="text-white/70 text-xl" />
                    </div>
                    <span className="text-base font-medium text-white/90">{user?.username || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 text-white/70 hover:text-white transition-colors font-medium text-base hover:bg-white/10 rounded-xl"
                  >
                    <ArrowRightOnRectangleIcon className="inline mr-3 h-5 w-5" />
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto responsive-padding">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
              Pay-Per-AI-Call Demo
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-4xl mx-auto mb-12 leading-relaxed">
              Experience the future of AI monetization. Pay micro-amounts for each AI interaction. 
              Creators earn instantly. No subscriptions, no commitments.
            </p>
            
            {/* Key Benefits */}
            <div className="grid-responsive gap-8 max-w-6xl mx-auto mb-16">
              <div className="stats-card text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RocketLaunchIcon className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Instant Payments</h3>
                <p className="text-base text-white/70">Pay only when you use the AI. Blockchain ensures instant, transparent transactions.</p>
              </div>
              <div className="stats-card text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Creator Earnings</h3>
                <p className="text-base text-white/70">AI creators earn from every interaction. Build once, earn continuously.</p>
              </div>
              <div className="stats-card text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Trustless System</h3>
                <p className="text-base text-white/70">Smart contracts ensure fair payment distribution. No middlemen.</p>
              </div>
            </div>
          </div>

          {/* Demo Stats */}
          {account && (callsMade > 0 || totalEarnings > 0) && (
            <div className="stats-card bg-gradient-to-r from-green-500/20 to-blue-600/20 border-green-500/30 mb-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-400 mb-6">🎉 Demo Session Stats</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-green-300 mb-2">{callsMade}</div>
                    <div className="text-base text-green-200">AI Calls Made</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-blue-300 mb-2">{totalEarnings.toFixed(2)} USDC</div>
                    <div className="text-base text-blue-200">Total Earned (as Creator)</div>
                  </div>
                </div>
                <p className="text-base text-green-200 mt-6">
                  💡 In this demo, you're both the user (paying for AI calls) and the creator (receiving payments)
                </p>
              </div>
            </div>
          )}

          {!account && (
            <div className="stats-card bg-yellow-500/10 border-yellow-500/30 mb-12">
              <div className="flex items-center">
                <span className="mr-3 text-2xl">⚠️</span>
                <div>
                  <span className="text-xl font-semibold text-yellow-300">Connect your wallet to try the pay-per-AI-call demo</span>
                  <p className="text-base text-yellow-200 mt-2">Your wallet will act as both the user (paying for AI calls) and the creator (receiving payments) in this demo.</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Agents Grid */}
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-center text-white text-shadow">Available AI Marketing Agents</h2>
            
            <div className="grid-responsive gap-8">
              {demoAgents.map((agent) => (
                <div key={agent.id} className="card overflow-hidden">
                  {/* Agent Header */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3">{agent.name}</h3>
                        <span className="bg-white/10 px-4 py-2 rounded-xl text-sm font-medium text-white/90 backdrop-blur-sm">
                          {agent.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white mb-1">{agent.pricePerCall} USDC</div>
                        <div className="text-body text-white/70">per call</div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Details */}
                  <div className="p-8">
                    <p className="text-base text-white/80 mb-6 leading-relaxed">
                      {agent.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Features:</h4>
                      <div className="flex flex-wrap gap-3">
                        {agent.features.map((feature, index) => (
                          <span key={index} className="bg-white/10 text-white/90 px-3 py-2 rounded-xl text-sm backdrop-blur-sm border border-white/10">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Embed PayPerCallAgent Component */}
                    <div className="border-t border-white/10 pt-6">
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
          <div className="mt-20 card">
            <h2 className="text-3xl font-bold text-center text-white mb-12 text-shadow">How Pay-Per-AI-Call Works</h2>
            <div className="grid-responsive gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-blue-500/30">1</div>
                <h3 className="text-lg font-semibold text-white mb-3">Choose Agent</h3>
                <p className="text-base text-white/70">Select an AI agent based on your needs and budget</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-purple-500/30">2</div>
                <h3 className="text-lg font-semibold text-white mb-3">Enter Prompt</h3>
                <p className="text-base text-white/70">Write your question or request for the AI agent</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-green-500/30">3</div>
                <h3 className="text-lg font-semibold text-white mb-3">Pay & Execute</h3>
                <p className="text-base text-white/70">Pay with crypto and get instant AI response</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-orange-500/30">4</div>
                <h3 className="text-lg font-semibold text-white mb-3">Creator Earns</h3>
                <p className="text-base text-white/70">Payment goes directly to the AI agent creator</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <div className="card bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
              <h2 className="text-3xl font-bold text-white mb-6 text-shadow">Ready to Create Your Own AI Agent?</h2>
              <p className="text-lg text-white/80 mb-8">
                Build AI agents, set your price, and earn from every interaction
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/agents/create"
                  className="btn-primary"
                >
                  <CpuChipIcon className="inline mr-3 h-6 w-6" />
                  Create Agent
                </Link>
                <Link
                  to="/browse"
                  className="btn-secondary"
                >
                  <ChartBarIcon className="inline mr-3 h-6 w-6" />
                  Browse More Agents
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