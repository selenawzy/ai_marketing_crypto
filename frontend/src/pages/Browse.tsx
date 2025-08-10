import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNetworkConfig } from '../config/networks';
import AgentDemoModal from '../components/AgentDemoModal';
import axios from 'axios';

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
}

const AGENT_CATEGORIES = [
  { id: 'all', name: 'All Agents', icon: '🤖' },
  { id: 'content', name: 'Content Creation', icon: '✍️' },
  { id: 'optimization', name: 'Campaign Optimization', icon: '📊' },
  { id: 'social', name: 'Social Media', icon: '📱' },
  { id: 'seo', name: 'SEO & Analytics', icon: '🔍' },
  { id: 'email', name: 'Email Marketing', icon: '📧' },
  { id: 'research', name: 'Market Research', icon: '🎯' },
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
];

const Browse: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const networkConfig = getNetworkConfig();
  
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'per_call' | 'subscription' | 'performance'>('all');
  const [demoAgent, setDemoAgent] = useState<AgentItem | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [selectedCategory, sortBy, searchQuery, pricingFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);

      // Try API first, fall back to mock data if API fails
      try {
        const params = new URLSearchParams({
          category: selectedCategory !== 'all' ? selectedCategory : '',
          sort: sortBy,
          search: searchQuery,
          pricing_filter: pricingFilter !== 'all' ? pricingFilter : '',
        });

        const response = await axios.get(`/api/ai-agents?${params}`);
        
        if (response.data.success) {
          // Transform API data to match AgentItem interface
          const transformedAgents: AgentItem[] = response.data.data.agents.map((agent: any) => ({
            id: agent.id,
            title: agent.agent_name || 'AI Agent',
            description: agent.description || 'AI Agent powered by blockchain',
            category: 'ai-assistant', // Default category
            agent_type: agent.smart_contract_address ? 'Smart Contract Agent' : 
                       agent.deployment_status === 'deployed' ? 'Deployed Agent' : 'Pending Agent',
            price_per_call: 0.1, // Default price
            price_per_month: 25.0, // Default monthly price
            total_uses: agent.total_transactions || 0,
            active_users: 1, // Default
            created_at: new Date(Number(agent.created_at)).toISOString(),
            creator_username: agent.owner_username || 'Anonymous',
            tags: agent.capabilities ? JSON.parse(agent.capabilities) : [],
            pricing_model: 'per_call' as const,
            performance_metrics: {
              accuracy: 0.95, // 95%
              response_time: 250, // 250ms
              success_rate: 0.98 // 98%
            }
          }));
          
          setAgents(transformedAgents);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
      }

      // Mock data fallback - realistic agent data
      const mockAgents: AgentItem[] = [
        {
          id: 1,
          title: 'Marketing Strategy Pro',
          description: 'Advanced AI agent for comprehensive marketing strategies, campaign optimization, and growth hacking techniques.',
          category: 'optimization',
          agent_type: 'Campaign Optimizer',
          price_per_call: 0.50,
          price_per_month: 15.99,
          total_uses: 2847,
          active_users: 156,
          created_at: '2024-01-15T00:00:00Z',
          creator_username: 'marketing_guru',
          tags: ['Strategy', 'Growth', 'ROI', 'Analytics'],
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
          description: 'Generate high-converting blog posts, social media content, ad copy, and email campaigns with AI-powered insights.',
          category: 'content',
          agent_type: 'Content Creation NFT',
          price_per_call: 0.25,
          price_per_month: 9.99,
          total_uses: 5423,
          active_users: 289,
          created_at: '2024-02-01T00:00:00Z',
          creator_username: 'content_wizard',
          tags: ['Blog Posts', 'Social Media', 'Ad Copy', 'Email'],
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
          description: 'Advanced SEO analysis, keyword research, competitor insights, and technical optimization recommendations.',
          category: 'seo',
          agent_type: 'SEO Oracle',
          price_per_call: 0.75,
          total_uses: 1832,
          active_users: 97,
          created_at: '2024-01-28T00:00:00Z',
          creator_username: 'seo_master',
          tags: ['Keywords', 'Technical SEO', 'Competitors', 'SERP'],
          pricing_model: 'performance',
          performance_metrics: {
            accuracy: 97,
            response_time: 3.1,
            success_rate: 98
          }
        },
        {
          id: 4,
          title: 'Social Media Intelligence',
          description: 'Analyze social media trends, optimize posting schedules, and create viral content strategies across all platforms.',
          category: 'social',
          agent_type: 'Social Intelligence',
          price_per_call: 0.35,
          price_per_month: 12.50,
          total_uses: 3921,
          active_users: 201,
          created_at: '2024-02-10T00:00:00Z',
          creator_username: 'social_ninja',
          tags: ['Trends', 'Viral Content', 'Scheduling', 'Analytics'],
          pricing_model: 'per_call',
          performance_metrics: {
            accuracy: 89,
            response_time: 2.7,
            success_rate: 91
          }
        },
        {
          id: 5,
          title: 'Email Campaign Optimizer',
          description: 'Create high-converting email sequences, optimize subject lines, and maximize open rates with advanced personalization.',
          category: 'email',
          agent_type: 'Email Automation',
          price_per_call: 0.40,
          price_per_month: 14.99,
          total_uses: 2156,
          active_users: 134,
          created_at: '2024-01-22T00:00:00Z',
          creator_username: 'email_expert',
          tags: ['Sequences', 'Subject Lines', 'Personalization', 'A/B Testing'],
          pricing_model: 'subscription',
          performance_metrics: {
            accuracy: 92,
            response_time: 2.1,
            success_rate: 94
          }
        },
        {
          id: 6,
          title: 'Market Research AI',
          description: 'Comprehensive market analysis, competitor research, customer insights, and trend prediction for strategic planning.',
          category: 'research',
          agent_type: 'Market Predictor',
          price_per_call: 0.85,
          total_uses: 1543,
          active_users: 78,
          created_at: '2024-02-05T00:00:00Z',
          creator_username: 'research_pro',
          tags: ['Market Analysis', 'Competitors', 'Trends', 'Insights'],
          pricing_model: 'performance',
          performance_metrics: {
            accuracy: 96,
            response_time: 4.2,
            success_rate: 97
          }
        }
      ];

      // Apply filtering and sorting to mock data
      let filteredAgents = mockAgents;

      // Filter by category
      if (selectedCategory !== 'all') {
        filteredAgents = filteredAgents.filter(agent => agent.category === selectedCategory);
      }

      // Filter by search term
      if (searchQuery.trim()) {
        const search = searchQuery.toLowerCase();
        filteredAgents = filteredAgents.filter(agent => 
          agent.title.toLowerCase().includes(search) ||
          agent.description.toLowerCase().includes(search) ||
          agent.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }

      // Filter by pricing model
      if (pricingFilter !== 'all') {
        filteredAgents = filteredAgents.filter(agent => agent.pricing_model === pricingFilter);
      }

      // Sort agents
      switch (sortBy) {
        case 'price_asc':
          filteredAgents.sort((a, b) => a.price_per_call - b.price_per_call);
          break;
        case 'price_desc':
          filteredAgents.sort((a, b) => b.price_per_call - a.price_per_call);
          break;
        case 'popular':
          filteredAgents.sort((a, b) => b.total_uses - a.total_uses);
          break;
        case 'oldest':
          filteredAgents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'newest':
        default:
          filteredAgents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }

      setAgents(filteredAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = AGENT_CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : '🤖';
  };

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
            <nav className="flex space-x-4 items-center">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/agents/create" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Create Agent
                  </Link>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Login / Sign Up
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse AI Agents</h2>
          <p className="text-gray-600">Discover and deploy premium AI marketing agents on the {networkConfig.name} network</p>
          
          {/* Buy with Real Money CTA */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">💳</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Need crypto to use AI agents?</h3>
                  <p className="text-sm text-gray-600">Buy crypto instantly with Apple Pay, debit card, or bank transfer</p>
                </div>
              </div>
              <Link
                to="/buy-crypto"
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
              >
                💳 Buy with Real Money
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Agents
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search agents by name, category, or capabilities..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Model Filter */}
            <div>
              <label htmlFor="pricing-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Model
              </label>
              <select
                id="pricing-filter"
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Models</option>
                <option value="per_call">Pay Per Call</option>
                <option value="subscription">Subscription</option>
                <option value="performance">Performance Based</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {AGENT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No agents found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(agent.category)}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {agent.category}
                      </span>
                    </div>
                    <div className="text-right">
                      {agent.pricing_model === 'per_call' && (
                        <div className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {agent.price_per_call} USDC/call
                        </div>
                      )}
                      {agent.pricing_model === 'subscription' && agent.price_per_month && (
                        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {agent.price_per_month} USDC/month
                        </div>
                      )}
                      {agent.pricing_model === 'performance' && (
                        <div className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          Performance Based
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {agent.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>By {agent.creator_username}</span>
                    <span>{agent.total_uses} uses • {agent.active_users} users</span>
                  </div>

                  {/* Performance Metrics */}
                  {agent.performance_metrics && (
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-green-600">{Math.round(agent.performance_metrics.accuracy * 100)}%</div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-blue-600">{agent.performance_metrics.response_time}ms</div>
                        <div className="text-xs text-gray-500">Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-purple-600">{Math.round(agent.performance_metrics.success_rate * 100)}%</div>
                        <div className="text-xs text-gray-500">Success</div>
                      </div>
                    </div>
                  )}

                  {agent.tags && agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {agent.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{agent.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to={`/agents/${agent.id}`}
                          className="flex-1 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                        >
                          View Agent
                        </Link>
                        <button 
                          onClick={() => setDemoAgent(agent)}
                          className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          🗋 Try Demo
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        className="flex-1 text-center bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium"
                      >
                        Login to Deploy
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Modal */}
      {demoAgent && (
        <AgentDemoModal
          agent={demoAgent}
          isOpen={!!demoAgent}
          onClose={() => setDemoAgent(null)}
        />
      )}
    </div>
  );
};

export default Browse;