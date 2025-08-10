import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getNetworkConfig } from '../config/networks';
import WalletConnect from '../components/WalletConnect';

const Home: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isConnected } = useWeb3();
  const networkConfig = getNetworkConfig();

  const features = [
    {
      icon: '⚡',
      title: 'Pay-Per-Use AI Agents',
      description: 'Only pay when you use an AI agent. No monthly subscriptions or hidden fees - transparent blockchain transactions.'
    },
    {
      icon: '🤖',
      title: 'Specialized Marketing AI', 
      description: 'Access expert AI agents for content creation, SEO analysis, social media strategy, and campaign optimization.'
    },
    {
      icon: '💳',
      title: 'Instant Blockchain Payments',
      description: 'Secure payments via Coinbase Wallet or MetaMask on Base Sepolia testnet. Transactions confirmed on-chain.'
    },
    {
      icon: '📊',
      title: 'Real AI Performance',
      description: 'Get actual AI-generated marketing strategies and content, not pre-written templates or generic responses.'
    }
  ];

  const agentCategories = [
    { name: 'Content Creation AI', icon: '✍️', description: 'Generate blog posts, social media content, and ad copy with AI assistance.', price: '$0.25/call', features: 'Real AI responses' },
    { name: 'Marketing Strategy', icon: '📊', description: 'Get comprehensive marketing strategies and campaign optimization advice.', price: '$0.50/call', features: 'Expert-level analysis' },
    { name: 'Social Media Manager', icon: '📱', description: 'Analyze trends, optimize posting schedules, and create viral content strategies.', price: '$0.35/call', features: 'Platform-specific insights' },
    { name: 'SEO Specialist', icon: '🔍', description: 'Keyword research, technical SEO analysis, and competitor insights.', price: '$0.75/call', features: 'Detailed SEO reports' },
    { name: 'Email Marketing', icon: '📧', description: 'Create email sequences, optimize subject lines, and improve open rates.', price: '$0.40/call', features: 'Conversion optimization' },
    { name: 'Market Research', icon: '🎯', description: 'Market analysis, competitor research, and customer insights.', price: '$0.85/call', features: 'Data-driven insights' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Crypto Agent Marketplace</h1>
            </div>
            <nav className="flex space-x-4 items-center">
              <Link to="/browse" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Browse Agents
              </Link>
              <Link to="/demo/pay-per-call" className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium font-semibold">
                🤖 Try Demo
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/agents/create" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Create Agent
                  </Link>
                  <WalletConnect />
                  
                  {/* User Profile Section */}
                  <div className="flex items-center space-x-3 ml-4">
                    <img
                      className="h-8 w-8 rounded-full bg-gray-200"
                      src={`https://ui-avatars.com/api/?name=${user?.username}&background=6366f1&color=fff`}
                      alt={user?.username}
                    />
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-gray-700">{user?.username}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Logout"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Login / Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Crypto Agent Marketplace
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Pay-per-use AI marketing agents with blockchain payments. Try real AI assistants and pay only when you use them - no subscriptions required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/demo/pay-per-call"
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🤖 Try Pay-Per-Call Demo
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/browse"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    🔍 Browse All Agents
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold text-lg"
                  >
                    📊 Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    🚀 Get Started Free
                  </Link>
                  <Link
                    to="/browse"
                    className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold text-lg"
                  >
                    🔍 Browse Agents
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Powered by {networkConfig.name}</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                <span>USDC Payments</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-purple-500 rounded-full mr-2"></div>
                <span>Web3 Native</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Pay-Per-Use AI Makes Sense?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              No monthly subscriptions. No setup fees. Pay only when you actually use an AI agent. Transparent blockchain transactions you can verify.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available AI Marketing Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Specialized AI assistants for different marketing tasks. Try them now with pay-per-use pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agentCategories.map((agent, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{agent.icon}</div>
                    <div className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {agent.price}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{agent.name}</h3>
                  <p className="text-gray-600 mb-3">{agent.description}</p>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-purple-700 text-sm font-medium">🔗 {agent.features}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to="/browse"
                      className="flex-1 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
                    >
                      View Agents
                    </Link>
                    <button className="bg-gray-100 text-gray-700 py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                      🧪 Demo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-lg text-gray-600">Decentralized</div>
              <div className="text-sm text-gray-500 mt-2">No middlemen, direct payments</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                0%
              </div>
              <div className="text-lg text-gray-600">Agent Fees</div>
              <div className="text-sm text-gray-500 mt-2">Pay only for usage</div>
            </div>
            <div className="p-8">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-lg text-gray-600">Global Access</div>
              <div className="text-sm text-gray-500 mt-2">Available worldwide, anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Deploy AI Agents?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join the decentralized AI economy where agents are owned as NFTs, training is community-driven, and performance is guaranteed by smart contracts. 
            Mint your first agent NFT in less than 2 minutes.
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth"
                className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🚀 Create Account
              </Link>
              <Link
                to="/browse"
                className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold text-lg"
              >
                🤖 View AI Agents
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Crypto Agent Marketplace</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Built on {networkConfig.name}</span>
              <span>•</span>
              <span>Powered by Web3</span>
              <span>•</span>
              <span>Secure & Decentralized</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2024 Crypto Agent Marketplace. Empowering creators with blockchain technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;