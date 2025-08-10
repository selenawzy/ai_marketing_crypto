import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Link, useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import CoinbaseOnramp from '../components/CoinbaseOnramp';
import ErrorNotification from '../components/ErrorNotification';
import { getNetworkConfig, isTestnet } from '../config/networks';
import { showSuccess } from '../utils/notifications';
import axios from 'axios';

interface DashboardStats {
  totalAgents: number;
  totalEarnings: number;
  totalCalls: number;
  activeUsers: number;
}

interface AgentItem {
  id: number;
  title: string;
  description: string;
  agent_type: string;
  price_per_call: number;
  total_calls: number;
  active_users: number;
  earnings: number;
  created_at: string;
  pricing_model: 'per_call' | 'subscription' | 'performance';
  performance_metrics?: {
    accuracy: number;
    response_time: number;
    success_rate: number;
  };
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { account, isConnected, balance } = useWeb3();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalEarnings: 0,
    totalCalls: 0,
    activeUsers: 0,
  });
  const [myAgents, setMyAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'earnings' | 'funding'>('overview');

  const networkConfig = getNetworkConfig();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API first, fall back to mock data
      try {
        const [statsResponse, agentsResponse] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/agents'),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data.stats);
        }
        
        if (agentsResponse.data.success) {
          setMyAgents(agentsResponse.data.data.agents);
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
        
        // Mock data for demo
        setStats({
          totalAgents: 3,
          totalEarnings: 24.75,
          totalCalls: 127,
          activeUsers: 45,
        });

        setMyAgents([
          {
            id: 1,
            title: 'Marketing Strategy Pro',
            description: 'Advanced AI agent for comprehensive marketing strategies and campaign optimization.',
            agent_type: 'Campaign Optimizer',
            price_per_call: 0.50,
            total_calls: 67,
            active_users: 23,
            earnings: 15.25,
            created_at: '2024-01-15T00:00:00Z',
            pricing_model: 'per_call',
            performance_metrics: {
              accuracy: 94,
              response_time: 2.3,
              success_rate: 96
            }
          },
          {
            id: 2,
            title: 'Content Creation Master',
            description: 'Generate high-converting blog posts, social media content, and ad copy.',
            agent_type: 'Content Creation NFT',
            price_per_call: 0.25,
            total_calls: 45,
            active_users: 18,
            earnings: 7.50,
            created_at: '2024-02-01T00:00:00Z',
            pricing_model: 'subscription',
            performance_metrics: {
              accuracy: 91,
              response_time: 1.8,
              success_rate: 93
            }
          },
          {
            id: 3,
            title: 'SEO Analytics Expert',
            description: 'Advanced SEO analysis, keyword research, and optimization recommendations.',
            agent_type: 'SEO Oracle',
            price_per_call: 0.75,
            total_calls: 15,
            active_users: 4,
            earnings: 2.00,
            created_at: '2024-01-28T00:00:00Z',
            pricing_model: 'performance',
            performance_metrics: {
              accuracy: 97,
              response_time: 3.1,
              success_rate: 98
            }
          }
        ]);
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError('🌐 Unable to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            
            <div className="flex items-center space-x-4">
              <WalletConnect />
              <div className="flex items-center space-x-2">
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
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Logout"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Status Alert */}
        <div className={`mb-6 p-4 rounded-lg ${isTestnet() ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${isTestnet() ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${isTestnet() ? 'text-orange-800' : 'text-green-800'}`}>
              Connected to {networkConfig.name} {isTestnet() ? '(Testnet)' : '(Mainnet)'}
            </span>
            {isTestnet() && (
              <a
                href={networkConfig.faucetUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-4 text-orange-600 hover:text-orange-500 text-sm underline"
              >
                Get testnet ETH
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: '📊' },
                { key: 'agents', label: 'My AI Agents', icon: '🤖' },
                { key: 'earnings', label: 'Earnings', icon: '💰' },
                { key: 'funding', label: 'Fund Wallet', icon: '💳' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <ErrorNotification 
          error={error} 
          onClose={() => setError(null)} 
          autoClose={true}
          duration={8000}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <div className="text-2xl">🤖</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalAgents}</div>
                    <div className="text-sm text-gray-500">AI Agents Created</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalEarnings.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">USDC Earned</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="text-2xl">🔥</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalCalls}</div>
                    <div className="text-sm text-gray-500">Total AI Calls</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                    <div className="text-sm text-gray-500">Active Users</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/agents/create"
                  className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  <div className="text-2xl mr-3">🤖</div>
                  <div>
                    <div className="font-medium">Create AI Agent</div>
                    <div className="text-sm opacity-75">Mint & monetize</div>
                  </div>
                </Link>

                <Link
                  to="/browse"
                  className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                >
                  <div className="text-2xl mr-3">🔍</div>
                  <div>
                    <div className="font-medium">Browse Agents</div>
                    <div className="text-sm opacity-75">Discover & use AI</div>
                  </div>
                </Link>

                <Link
                  to="/pay-per-call"
                  className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  <div className="text-2xl mr-3">⚡</div>
                  <div>
                    <div className="font-medium">Demo AI Calls</div>
                    <div className="text-sm opacity-75">Test payments</div>
                  </div>
                </Link>

                <button
                  onClick={() => setActiveTab('funding')}
                  className="flex items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                >
                  <div className="text-2xl mr-3">💳</div>
                  <div>
                    <div className="font-medium">Fund Wallet</div>
                    <div className="text-sm opacity-75">Add crypto</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">My AI Agents</h3>
                <Link
                  to="/agents/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Agent
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {myAgents.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No AI agents yet</h3>
                  <p className="mt-2 text-gray-500">Create your first AI agent and start earning from AI interactions.</p>
                  <Link
                    to="/agents/create"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    🎨 Create AI Agent
                  </Link>
                </div>
              ) : (
                myAgents.map((agent) => (
                  <div key={agent.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">{agent.title}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {agent.agent_type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            agent.pricing_model === 'per_call' ? 'bg-green-100 text-green-800' :
                            agent.pricing_model === 'subscription' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {agent.pricing_model === 'per_call' ? 'Pay per call' : 
                             agent.pricing_model === 'subscription' ? 'Subscription' : 
                             'Performance based'}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-500 line-clamp-2">{agent.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>🔥 {agent.total_calls} calls</span>
                          <span>👥 {agent.active_users} users</span>
                          <span>💰 ${agent.earnings.toFixed(2)} earned</span>
                        </div>
                        
                        {/* Performance Metrics */}
                        {agent.performance_metrics && (
                          <div className="mt-3 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-green-600">{Math.round(agent.performance_metrics.accuracy)}%</div>
                              <div className="text-xs text-gray-500">Accuracy</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-blue-600">{agent.performance_metrics.response_time}s</div>
                              <div className="text-xs text-gray-500">Response</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-purple-600">{Math.round(agent.performance_metrics.success_rate)}%</div>
                              <div className="text-xs text-gray-500">Success</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${agent.price_per_call} USDC
                          </div>
                          <div className="text-sm text-gray-500">per call</div>
                        </div>
                        <Link
                          to={`/agents/${agent.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Earnings Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{stats.totalEarnings.toFixed(2)}</div>
                <div className="text-sm text-green-800">Total USDC Earned</div>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalEarnings > 0 ? (stats.totalEarnings / stats.totalAgents).toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-blue-800">Avg. per Agent</div>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{balance || '0.000'}</div>
                <div className="text-sm text-purple-800">Wallet Balance (ETH)</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Earnings are automatically transferred to your connected wallet address. 
                All transactions are secured by the blockchain and can be viewed on {networkConfig.name}.
              </p>
            </div>
          </div>
        )}

        {/* Funding Tab */}
        {activeTab === 'funding' && (
          <div className="space-y-6">
            {/* Funding Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">💳 Fund Your Wallet</h3>
              <p className="text-gray-600 mb-4">
                Add crypto to your wallet to interact with AI agents and make payments. 
                Choose from multiple funding options below.
              </p>
              
              {/* Current Balance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Current Balance</div>
                  <div className="text-xl font-bold text-gray-900">{balance || '0.000'} ETH</div>
                  <div className="text-xs text-gray-500">{networkConfig.name}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Wallet Address</div>
                  <div className="text-sm font-mono text-gray-900">
                    {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : 'Not connected'}
                  </div>
                  <div className="text-xs text-gray-500">Your receiving address</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-500">Network</div>
                  <div className="text-lg font-bold text-blue-600">{networkConfig.name}</div>
                  <div className="text-xs text-gray-500">{isTestnet() ? 'Testnet' : 'Mainnet'}</div>
                </div>
              </div>
            </div>

            {/* Funding Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Coinbase Onramp */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">💳</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Buy Crypto with Fiat</h3>
                    <p className="text-sm text-gray-600">Use Apple Pay, debit card, or bank transfer</p>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-800 text-sm">
                    <div className="mr-2">ℹ️</div>
                    <div>
                      <strong>Powered by Coinbase</strong><br/>
                      Secure, regulated, and trusted by millions
                    </div>
                  </div>
                </div>

                <CoinbaseOnramp />
                
                <div className="mt-4 text-xs text-gray-500">
                  💡 Funds will appear in your connected wallet within minutes
                </div>
              </div>

              {/* Testnet Faucet */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">🚰</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Get Testnet ETH</h3>
                    <p className="text-sm text-gray-600">Free crypto for testing and development</p>
                  </div>
                </div>
                
                {isTestnet() ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center text-orange-800 text-sm">
                        <div className="mr-2">⚠️</div>
                        <div>
                          <strong>Testnet Only</strong><br/>
                          This ETH has no real value - perfect for testing
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.open(networkConfig.faucetUrl, '_blank')}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      🚰 Get Free Testnet ETH
                    </button>

                    <div className="text-xs text-gray-500">
                      💡 Usually takes 1-2 minutes to receive testnet ETH
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <div className="text-gray-500 mb-2">🔒</div>
                    <div className="text-sm text-gray-600">
                      Testnet faucet not available on mainnet
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Transfer Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">📤</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Transfer from Another Wallet</h3>
                  <p className="text-sm text-gray-600">Send crypto from your existing wallets</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Wallet Address:</h4>
                  <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                    {account || 'Please connect your wallet first'}
                  </div>
                  {account && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(account);
                        showSuccess('✅ Wallet address copied to clipboard!');
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      📋 Copy Address
                    </button>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supported Networks:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>{networkConfig.name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ⚠️ Only send crypto on the {networkConfig.name} network
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;