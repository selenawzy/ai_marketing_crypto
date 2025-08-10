import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { getNetworkConfig } from '../config/networks';
import WalletConnect from '../components/WalletConnect';
import { 
  BoltIcon, 
  CpuChipIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isConnected } = useWeb3();
  const networkConfig = getNetworkConfig();

  const features = [
    {
      icon: BoltIcon,
      title: 'Pay-Per-Use AI',
      description: 'No subscriptions, only pay when you use AI agents. Transparent pricing with no hidden fees.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CpuChipIcon,
      title: 'Marketing AI', 
      description: 'Content creation, SEO optimization, social media strategy, and market analysis.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: CreditCardIcon,
      title: 'Blockchain Payments',
      description: 'Secure USDC payments on Base Sepolia with instant settlement and no chargebacks.',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Real AI Performance',
      description: 'Actual AI responses powered by advanced language models, not pre-written templates.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const agentCategories = [
    { 
      name: 'Content Creation', 
      price: '$0.25', 
      unit: 'per call',
      description: 'Blog posts, articles, copywriting',
      color: 'from-cyan-400 via-blue-500 to-indigo-600',
      icon: '✍️'
    },
    { 
      name: 'Marketing Strategy', 
      price: '$0.50', 
      unit: 'per call',
      description: 'Campaign planning, audience analysis',
      color: 'from-purple-400 via-pink-500 to-rose-600',
      icon: '🎯'
    },
    { 
      name: 'Social Media', 
      price: '$0.35', 
      unit: 'per call',
      description: 'Posts, engagement, hashtag strategy',
      color: 'from-green-400 via-emerald-500 to-teal-600',
      icon: '📱'
    },
    { 
      name: 'SEO Specialist', 
      price: '$0.75', 
      unit: 'per call',
      description: 'Keyword research, optimization',
      color: 'from-orange-400 via-red-500 to-pink-600',
      icon: '🔍'
    },
    { 
      name: 'Email Marketing', 
      price: '$0.40', 
      unit: 'per call',
      description: 'Newsletters, automation sequences',
      color: 'from-indigo-400 via-purple-500 to-violet-600',
      icon: '📧'
    },
    { 
      name: 'Market Research', 
      price: '$0.85', 
      unit: 'per call',
      description: 'Competitor analysis, trends',
      color: 'from-yellow-400 via-orange-500 to-red-600',
      icon: '📊'
    }
  ];

  const stats = [
    { value: '100+', label: 'AI Agents', color: 'text-cyan-400', icon: '🤖' },
    { value: '24/7', label: 'Availability', color: 'text-pink-400', icon: '⏰' },
    { value: '0%', label: 'Setup Fees', color: 'text-green-400', icon: '💸' },
    { value: 'Instant', label: 'Access', color: 'text-yellow-400', icon: '⚡' }
  ];

  const benefits = [
    {
      icon: SparklesIcon,
      title: 'Cutting-Edge AI',
      description: 'Powered by the latest language models and AI technologies'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Lightning Fast',
      description: 'Get AI responses in seconds, not hours or days'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level security with blockchain verification'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Scale',
      description: 'Available worldwide with 99.9% uptime guarantee'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Enhanced Header */}
      <header className="relative bg-black/30 backdrop-blur-2xl border-b border-white/10 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="h-14 w-14 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110">
                  <BoltIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    AI Agent Marketplace
                  </h1>
                  <p className="text-white/60 text-sm font-medium">Powered by Coinbase AgentKit</p>
                </div>
              </Link>
            </div>
            <nav className="flex space-x-2 items-center">
              <Link to="/browse" className="nav-link">
                Browse Agents
              </Link>
              <Link to="/demo/pay-per-call" className="nav-link">
                Try Demo
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to="/agents/create" className="nav-link">
                    Create Agent
                  </Link>
                  <WalletConnect />
                  
                  {/* Enhanced User Profile Section */}
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="relative">
                      <img
                        className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-0.5 shadow-lg"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                        alt={user?.username || 'User'}
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-950"></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{user?.username || 'User'}</p>
                      <button
                        onClick={logout}
                        className="text-xs text-white/60 hover:text-white transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/auth" className="btn-secondary">
                    Sign In
                  </Link>
                  <Link to="/auth" className="btn-primary">
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4 mr-2" />
              The Future of AI Marketing is Here
            </div>
          </div>
          
          <h1 className="heading-xl mb-8 text-white">
            AI Agents for
            <span className="text-gradient block mt-2"> Modern Marketing</span>
          </h1>
          
          <p className="text-body-lg max-w-4xl mx-auto mb-12 text-white/80 leading-relaxed">
            Access professional AI marketing agents on-demand. No subscriptions, no setup fees. 
            Pay only for what you use with secure blockchain payments on Base Sepolia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link to="/browse" className="btn-primary btn-lg group">
              Explore Agents
              <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link to="/demo/pay-per-call" className="btn-secondary btn-lg group">
              <PlayIcon className="mr-3 h-6 w-6" />
              Try Demo
            </Link>
          </div>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-white/70 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-6 text-white">Why Choose Our Platform</h2>
            <p className="text-body max-w-3xl mx-auto text-white/70">
              Built for modern businesses that need flexible, scalable AI solutions without the complexity
            </p>
          </div>
          
          <div className="grid-responsive">
            {features.map((feature, index) => (
              <div key={index} className="feature-card group">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="heading-sm mb-4 text-white">{feature.title}</h3>
                <p className="text-body-sm text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Agent Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-6 text-white">Popular Agent Categories</h2>
            <p className="text-body max-w-3xl mx-auto text-white/70">
              Find the perfect AI agent for your specific marketing needs with transparent pricing
            </p>
          </div>
          
          <div className="grid-responsive">
            {agentCategories.map((category, index) => (
              <div key={index} className="action-card group">
                <div className={`w-full h-40 bg-gradient-to-r ${category.color} rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-6xl mb-2">{category.icon}</div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-3">{category.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-3xl font-bold text-white">{category.price}</span>
                    <span className="text-white/60 text-sm">{category.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-6 text-white">Built for the Future</h2>
            <p className="text-body max-w-3xl mx-auto text-white/70">
              Our platform combines cutting-edge AI technology with enterprise-grade infrastructure
            </p>
          </div>
          
          <div className="grid-responsive">
            {benefits.map((benefit, index) => (
              <div key={index} className="stats-card text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="heading-sm mb-4 text-white">{benefit.title}</h3>
                <p className="text-body-sm text-white/70 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
            <div className="relative z-10">
              <h2 className="heading-lg mb-8 text-white">Ready to Transform Your Marketing?</h2>
              <p className="text-body-lg mb-10 text-white/80 max-w-3xl mx-auto leading-relaxed">
                Join thousands of businesses already using AI agents to scale their marketing efforts and stay ahead of the competition
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/auth" className="btn-primary btn-lg group">
                  Start Building Today
                  <RocketLaunchIcon className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link to="/browse" className="btn-outline btn-lg">
                  Browse All Agents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
                  <BoltIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">AI Agent Marketplace</h3>
              </div>
              <p className="text-white/60 mb-6 max-w-lg leading-relaxed">
                The future of AI-powered marketing is here. Access professional AI agents on-demand with secure blockchain payments and transparent pricing.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ML</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BC</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/browse" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Browse Agents</Link></li>
                <li><Link to="/demo/pay-per-call" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Demo</Link></li>
                <li><Link to="/dashboard" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Dashboard</Link></li>
                <li><Link to="/agents/create" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Create Agent</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Documentation</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">API Reference</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Contact</a></li>
                <li><a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/40 text-sm">
              © 2024 AI Agent Marketplace. Built with modern web technologies and blockchain innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;