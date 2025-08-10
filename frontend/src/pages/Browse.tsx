import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AgentKitInfo from '../components/AgentKitInfo';

interface AgentItem {
  id: number;
  title: string;
  description: string;
  category: string;
  agent_type: string;
  price_per_call: number;
  price_per_month?: number;
  total_uses: number;
  active_users: number;
  created_at: string;
  creator_username: string;
  tags: string[];
  pricing_model: 'per_call' | 'subscription' | 'performance';
  performance_metrics?: {
    accuracy: number;
    response_time: number;
    success_rate: number;
  };
  cdp_agent_id?: string;
  wallet_address?: string;
  deployment_status?: 'pending' | 'deployed' | 'active';
  network?: string;
}

const AGENT_CATEGORIES = [
  { name: 'Marketing', icon: '📢', color: 'from-pink-500 to-rose-500' },
  { name: 'Content Creation', icon: '✍️', color: 'from-blue-500 to-cyan-500' },
  { name: 'SEO Analysis', icon: '🔍', color: 'from-green-500 to-emerald-500' },
  { name: 'Social Media', icon: '📱', color: 'from-purple-500 to-violet-500' },
  { name: 'Campaign Optimization', icon: '📈', color: 'from-yellow-500 to-orange-500' },
  { name: 'DeFi Trading', icon: '💹', color: 'from-emerald-500 to-teal-500' },
  { name: 'NFT Management', icon: '🖼️', color: 'from-indigo-500 to-purple-500' }
];

const SORT_OPTIONS = [
  'Most Popular',
  'Best Performance', 
  'Lowest Price',
  'Newest',
  'Highest Rated'
];

const Browse: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('Most Popular');
  const [showAgentKitInfo, setShowAgentKitInfo] = useState(false);

  // Fetch real agents from the database
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.agents) {
            // Convert backend agent data to frontend format
            const convertedAgents = data.data.agents.map((backendAgent: any) => ({
              id: backendAgent.id,
              title: backendAgent.agent_name || 'AI Agent',
              description: backendAgent.description || 'AI-powered marketing agent with blockchain capabilities',
              category: 'Marketing', // Default category
              agent_type: 'AI Agent',
              price_per_call: 0, // Will be extracted from deployment_config if available
              total_uses: backendAgent.total_transactions || 0,
              active_users: 1, // Default value
              created_at: backendAgent.created_at || new Date().toISOString(),
              creator_username: 'Demo User', // Default since we don't have this field
              tags: ['AI', 'Marketing', 'Blockchain'],
              pricing_model: 'per_call' as const,
              performance_metrics: { accuracy: 85, response_time: 2.0, success_rate: 80 },
              cdp_agent_id: backendAgent.cdp_agent_id,
              wallet_address: backendAgent.wallet_address,
              deployment_status: backendAgent.is_deployed ? 'active' : 'pending',
              network: backendAgent.network || 'base-sepolia'
            }));
            setAgents(convertedAgents);
          } else {
            // Fallback to mock data if API fails
            setAgents(mockAgents);
          }
        } else {
          // Fallback to mock data if API fails
          setAgents(mockAgents);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        // Fallback to mock data if API fails
        setAgents(mockAgents);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Mock data as fallback
  const mockAgents: AgentItem[] = [
    {
      id: 9,
      title: 'AI Marketing Guru',
      description: 'Expert marketing strategies powered by Coinbase AgentKit',
      category: 'Marketing',
      agent_type: 'Strategy',
      price_per_call: 0.50,
      total_uses: 1250,
      active_users: 89,
      created_at: '2024-01-15',
      creator_username: 'MarketingPro',
      tags: ['Strategy', 'Analytics', 'ROI'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 94, response_time: 1.2, success_rate: 89 },
      cdp_agent_id: 'cdp_001',
      wallet_address: '0x1234...5678',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 10,
      title: 'Crypto Trading Bot',
      description: 'Advanced crypto trading strategies with AI-powered analysis',
      category: 'DeFi Trading',
      agent_type: 'Trading',
      price_per_call: 0.75,
      total_uses: 890,
      active_users: 67,
      created_at: '2024-01-10',
      creator_username: 'ContentWizard',
      tags: ['Blog', 'Social', 'SEO'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 91, response_time: 2.1, success_rate: 85 },
      cdp_agent_id: 'cdp_002',
      wallet_address: '0x8765...4321',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 11,
      title: 'Content Creator Assistant',
      description: 'AI-powered content creation and management assistant',
      category: 'Content Creation',
      agent_type: 'Generation',
      price_per_call: 0.60,
      total_uses: 1100,
      active_users: 78,
      created_at: '2024-01-08',
      creator_username: 'SEOGuru',
      tags: ['Keywords', 'Ranking', 'Backlinks'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 96, response_time: 1.8, success_rate: 92 },
      cdp_agent_id: 'cdp_003',
      wallet_address: '0x9876...5432',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 4,
      title: 'Social Media Manager',
      description: 'Smart social media strategies with AgentKit capabilities',
      category: 'Social Media',
      agent_type: 'Management',
      price_per_call: 0.65,
      total_uses: 950,
      active_users: 72,
      created_at: '2024-01-12',
      creator_username: 'SocialPro',
      tags: ['Instagram', 'Twitter', 'Engagement'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 89, response_time: 1.5, success_rate: 87 },
      cdp_agent_id: 'cdp_004',
      wallet_address: '0x5432...1098',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 5,
      title: 'Campaign Optimizer',
      description: 'Data-driven campaign optimization using AI and blockchain',
      category: 'Campaign Optimization',
      agent_type: 'Optimization',
      price_per_call: 0.80,
      total_uses: 680,
      active_users: 54,
      created_at: '2024-01-05',
      creator_username: 'CampaignMaster',
      tags: ['ROI', 'Conversion', 'A/B Testing'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 93, response_time: 2.3, success_rate: 90 },
      cdp_agent_id: 'cdp_005',
      wallet_address: '0x2109...8765',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 6,
      title: 'DeFi Trading Assistant',
      description: 'Intelligent DeFi trading strategies with AgentKit integration',
      category: 'DeFi Trading',
      agent_type: 'Trading',
      price_per_call: 1.20,
      total_uses: 420,
      active_users: 38,
      created_at: '2024-01-03',
      creator_username: 'DeFiTrader',
      tags: ['Yield', 'Liquidity', 'Risk'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 88, response_time: 1.1, success_rate: 82 },
      cdp_agent_id: 'cdp_006',
      wallet_address: '0x6543...2109',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 7,
      title: 'NFT Portfolio Manager',
      description: 'Smart NFT management powered by Coinbase AgentKit',
      category: 'NFT Management',
      agent_type: 'Management',
      price_per_call: 0.90,
      total_uses: 320,
      active_users: 29,
      created_at: '2024-01-01',
      creator_username: 'NFTCollector',
      tags: ['Portfolio', 'Valuation', 'Trading'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 92, response_time: 1.6, success_rate: 88 },
      cdp_agent_id: 'cdp_007',
      wallet_address: '0x1098...7654',
      deployment_status: 'active',
      network: 'base-sepolia'
    },
    {
      id: 8,
      title: 'Blockchain Analytics Pro',
      description: 'Advanced blockchain analytics using AI and AgentKit',
      category: 'Marketing',
      agent_type: 'Analytics',
      price_per_call: 1.00,
      total_uses: 580,
      active_users: 45,
      created_at: '2024-01-07',
      creator_username: 'BlockchainAnalyst',
      tags: ['Analytics', 'On-chain', 'Metrics'],
      pricing_model: 'per_call',
      performance_metrics: { accuracy: 95, response_time: 1.9, success_rate: 91 },
      cdp_agent_id: 'cdp_008',
      wallet_address: '0x7654...3210',
      deployment_status: 'active',
      network: 'base-sepolia'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'Most Popular':
        return b.total_uses - a.total_uses;
      case 'Best Performance':
        return (b.performance_metrics?.accuracy || 0) - (a.performance_metrics?.accuracy || 0);
      case 'Lowest Price':
        return a.price_per_call - b.price_per_call;
      case 'Newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'Highest Rated':
        return (b.performance_metrics?.success_rate || 0) - (a.performance_metrics?.success_rate || 0);
      default:
        return 0;
    }
  });

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceIcon = (accuracy: number) => {
    if (accuracy >= 90) return '🚀';
    if (accuracy >= 80) return '⚡';
    return '📊';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="h-12 w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    AI Agent Marketplace
                  </h1>
                  <p className="text-purple-300 text-sm">Powered by Coinbase AgentKit</p>
                </div>
              </Link>
            </div>
            <nav className="flex space-x-6 items-center">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-purple-300 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-500/20">
                    Dashboard
                  </Link>
                  <Link to="/agents/create" className="text-purple-300 hover:text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-500/20">
                    Create Agent
                  </Link>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  Login / Sign Up
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Discover AI Agents
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Find the perfect AI agent for your needs. All powered by Coinbase AgentKit for secure, on-chain operations.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
              <div className="text-2xl font-bold text-cyan-400">{agents.length}</div>
              <div className="text-purple-300 text-sm">Total Agents</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
              <div className="text-2xl font-bold text-pink-400">{agents.filter(a => a.cdp_agent_id).length}</div>
              <div className="text-purple-300 text-sm">AgentKit Ready</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
              <div className="text-2xl font-bold text-green-400">{agents.reduce((sum, a) => sum + a.total_uses, 0)}</div>
              <div className="text-purple-300 text-sm">Total Uses</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
              <div className="text-2xl font-bold text-yellow-400">{agents.reduce((sum, a) => sum + a.active_users, 0)}</div>
              <div className="text-purple-300 text-sm">Active Users</div>
            </div>
          </div>

          {/* AgentKit Info Toggle */}
          <button
            onClick={() => setShowAgentKitInfo(!showAgentKitInfo)}
            className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 px-6 py-3 rounded-xl hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-200 mb-8"
          >
            {showAgentKitInfo ? '🔽 Hide' : '🔼 Show'} AgentKit Information
          </button>

          {showAgentKitInfo && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Coinbase AgentKit
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-3xl mb-2">🔐</div>
                  <h4 className="text-cyan-400 font-semibold mb-2">Secure Wallets</h4>
                  <p className="text-purple-200 text-sm">Each agent has its own secure blockchain wallet</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="text-purple-400 font-semibold mb-2">On-chain Actions</h4>
                  <p className="text-purple-200 text-sm">Execute transactions directly on the blockchain</p>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="text-3xl mb-2">🌐</div>
                  <h4 className="text-green-400 font-semibold mb-2">Base Network</h4>
                  <p className="text-purple-200 text-sm">Built on Coinbase's Base network for reliability</p>
                </div>
              </div>
              <div className="text-center mt-6">
                <a
                  href="https://docs.cdp.coinbase.com/agent-kit/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  📚 Learn More About AgentKit
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">🔍 Search</label>
              <input
                type="text"
                placeholder="Find agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">📂 Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {AGENT_CATEGORIES.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-purple-300 text-sm font-medium mb-2">📊 Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedCategory === '' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-black/40 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
            }`}
          >
            🌟 All
          </button>
          {AGENT_CATEGORIES.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.name 
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-black/40 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-purple-300 bg-black/40 rounded-xl border border-purple-500/30">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading AI Agents...
            </div>
          </div>
        ) : sortedAgents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-purple-200 mb-2">No agents found</h3>
            <p className="text-purple-300">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAgents.map((agent) => (
              <div key={agent.id} className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30 hover:border-cyan-400/50 transition-all duration-300 group">
                {/* AgentKit Badge */}
                {agent.cdp_agent_id && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30">
                      ⚡ AgentKit
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {agent.title}
                      </h3>
                      <p className="text-purple-300 text-sm mb-3 line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {agent.performance_metrics && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-black/30 rounded-xl border border-purple-500/20">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getPerformanceIcon(agent.performance_metrics.accuracy)}</span>
                        <div>
                          <div className={`text-lg font-bold ${getPerformanceColor(agent.performance_metrics.accuracy)}`}>
                            {agent.performance_metrics.accuracy}%
                          </div>
                          <div className="text-xs text-purple-300">Accuracy</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-cyan-400">
                          {agent.performance_metrics.response_time}s
                        </div>
                        <div className="text-xs text-purple-300">Response</div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-black/30 rounded-lg border border-purple-500/20">
                      <div className="text-lg font-bold text-cyan-400">{agent.total_uses}</div>
                      <div className="text-xs text-purple-300">Uses</div>
                    </div>
                    <div className="text-center p-2 bg-black/30 rounded-lg border border-purple-500/20">
                      <div className="text-lg font-bold text-pink-400">{agent.active_users}</div>
                      <div className="text-xs text-purple-300">Users</div>
                    </div>
                    <div className="text-center p-2 bg-black/30 rounded-lg border border-purple-500/20">
                      <div className="text-lg font-bold text-green-400">${agent.price_per_call}</div>
                      <div className="text-xs text-purple-300">Per Call</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {agent.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-block bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* AgentKit Info */}
                  {agent.cdp_agent_id && (
                    <AgentKitInfo agent={agent} />
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/agents/${agent.id}`}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    >
                      👁️ View Agent
                    </Link>
                    <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                      🚀 Try Demo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      ` }} />
    </div>
  );
};

export default Browse;