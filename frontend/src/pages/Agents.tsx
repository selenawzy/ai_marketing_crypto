import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  TrashIcon, 
  Cog6ToothIcon, 
  ArrowTopRightOnSquareIcon,
  CpuChipIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface Agent {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  status: string;
  usage: number;
  earnings: number;
  image?: string;
}

const Agents: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useWeb3();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  const categories = [
    'all',
    'content-creation',
    'marketing-strategy',
    'social-media',
    'seo',
    'email-marketing',
    'market-research',
    'analytics',
    'automation'
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data);
          setFilteredAgents(data);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    let filtered = agents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(agent => agent.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      default: // popular
        filtered = [...filtered].sort((a, b) => b.usage - a.usage);
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, selectedCategory, sortBy]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content-creation':
        return <CpuChipIcon className="h-5 w-5" />;
      case 'marketing-strategy':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'social-media':
        return <RocketLaunchIcon className="h-5 w-5" />;
      case 'seo':
        return <MagnifyingGlassIcon className="h-5 w-5" />;
      case 'email-marketing':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'market-research':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'analytics':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'automation':
        return <SparklesIcon className="h-5 w-5" />;
      default:
        return <CpuChipIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content-creation':
        return 'from-cyan-400 to-blue-500';
      case 'marketing-strategy':
        return 'from-purple-400 to-pink-500';
      case 'social-media':
        return 'from-green-400 to-emerald-500';
      case 'seo':
        return 'from-orange-400 to-red-500';
      case 'email-marketing':
        return 'from-indigo-400 to-purple-500';
      case 'market-research':
        return 'from-yellow-400 to-orange-500';
      case 'analytics':
        return 'from-blue-400 to-indigo-500';
      case 'automation':
        return 'from-pink-400 to-rose-500';
      default:
        return 'from-gray-400 to-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-active">Active</span>;
      case 'pending':
        return <span className="status-pending">Pending</span>;
      case 'inactive':
        return <span className="status-inactive">Inactive</span>;
      case 'processing':
        return <span className="status-processing">Processing</span>;
      default:
        return <span className="status-inactive">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-8"></div>
          <div className="text-white text-2xl font-light">Loading Agents</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-500/3 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                <CpuChipIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  AI Agents
                </h1>
                <p className="text-white/60 text-sm">Browse and deploy AI marketing agents</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <Link to="/agents/create" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Agent
                </Link>
              )}
              <Link to="/demo/pay-per-call" className="btn-secondary">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search AI agents by name, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field pr-10 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FunnelIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-white/60">
              Showing {filteredAgents.length} of {agents.length} agents
            </p>
          </div>

          {/* Agents Grid */}
          {filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <CpuChipIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <h3 className="heading-sm mb-2">No agents found</h3>
              <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('popular');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="card group hover:card-hover">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(agent.category)} rounded-lg flex items-center justify-center`}>
                        {getCategoryIcon(agent.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-white/60 text-sm">{agent.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(agent.status)}
                    </div>
                  </div>

                  {/* Agent Description */}
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Agent Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-xs">Price</p>
                      <p className="text-white font-semibold">${agent.price.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-xs">Rating</p>
                      <div className="flex items-center justify-center space-x-1">
                        <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold text-sm">{agent.rating}</span>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-xs">Usage</p>
                      <p className="text-white font-semibold text-sm">{agent.usage}</p>
                    </div>
                  </div>

                  {/* Agent Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 btn-primary btn-sm">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Deploy
                    </button>
                    <button className="btn-secondary btn-sm">
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                    <button className="btn-secondary btn-sm">
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Earnings Display */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Total Earnings</span>
                      <span className="text-emerald-400 font-semibold">${agent.earnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredAgents.length > 0 && (
            <div className="text-center mt-12">
              <button className="btn-secondary btn-lg">
                Load More Agents
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Agents; 