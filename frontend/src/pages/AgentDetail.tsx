import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import CoinbaseOnramp from '../components/CoinbaseOnramp';
import WalletConnect from '../components/WalletConnect';
import axios from 'axios';

interface Agent {
  id: number;
  title: string;
  description: string;
  category: string;
  agent_type: string;
  price_per_call: number;
  price_per_month?: number;
  total_uses: number;
  active_users: number;
  creator_username: string;
  creator_wallet: string;
  smart_contract_address?: string;
  pricing_model: 'per_call' | 'subscription' | 'performance';
  performance_metrics?: {
    accuracy: number;
    response_time: number;
    success_rate: number;
  };
  demo_config?: {
    max_free_calls: number;
    demo_prompt_examples: string[];
    input_type: 'text' | 'file' | 'url' | 'multi';
    output_type: 'text' | 'json' | 'file' | 'metrics';
  };
  tags: string[];
}

interface DemoResult {
  success: boolean;
  output: any;
  usage_info: {
    tokens_used: number;
    processing_time: number;
    cost_would_be: number;
  };
  error?: string;
}

const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { account, isConnected } = useWeb3();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnramp, setShowOnramp] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  
  // Demo state
  const [demoMode, setDemoMode] = useState(false);
  const [demoInput, setDemoInput] = useState('');
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [freeCalls, setFreeCalls] = useState(3); // Free demo calls

  useEffect(() => {
    if (id) {
      fetchAgent();
    }
  }, [id]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      
      // Get CDP agent (now public endpoint)
      const response = await axios.get(`/api/agents/${id}`);
      
      if (response.data.success) {
        const cdpAgent = response.data.data.agent;
        
        // Convert CDP agent to expected format
        const convertedAgent: Agent = {
          id: cdpAgent.id,
          title: cdpAgent.agent_name || 'AI Agent',
          description: cdpAgent.description || 'CDP Agent powered by Coinbase',
          category: 'ai-assistant',
          agent_type: 'cdp-agent',
          price_per_call: 0.1,
          total_uses: 0,
          active_users: 1,
          creator_username: 'You',
          creator_wallet: cdpAgent.wallet_address,
          smart_contract_address: cdpAgent.smart_contract_address,
          pricing_model: 'per_call',
          performance_metrics: {
            accuracy: 0.95, // 95%
            response_time: 250, // 250ms
            success_rate: 0.98 // 98%
          },
          tags: JSON.parse(cdpAgent.capabilities || '[]')
        };
        
        setAgent(convertedAgent);
      } else {
        setError('Agent not found');
      }
    } catch (err: any) {
      console.error('Error fetching CDP agent:', err);
      setError(err.response?.data?.message || 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploymentSuccess = (data: any) => {
    setDeploymentSuccess(true);
    setShowOnramp(false);
    console.log('Agent deployment successful:', data);
  };

  const handleDeploymentError = (error: string) => {
    console.error('Agent deployment error:', error);
  };

  const runDemo = async () => {
    if (!agent || freeCalls <= 0) return;
    
    setDemoLoading(true);
    try {
      const response = await axios.post(`/api/agents/${id}/demo`, {
        input: demoInput,
        agent_type: agent.agent_type
      });
      
      if (response.data.success) {
        setDemoResult(response.data.data);
        setFreeCalls(prev => prev - 1);
      } else {
        setDemoResult({
          success: false,
          output: null,
          usage_info: { tokens_used: 0, processing_time: 0, cost_would_be: 0 },
          error: response.data.message
        });
      }
    } catch (err: any) {
      setDemoResult({
        success: false,
        output: null,
        usage_info: { tokens_used: 0, processing_time: 0, cost_would_be: 0 },
        error: err.response?.data?.message || 'Demo failed'
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const getDemoPlaceholder = () => {
    if (!agent) return "Enter your input...";
    
    switch (agent.category) {
      case 'content':
        return "Write a blog post about sustainable fashion trends in 2024...";
      case 'social':
        return "Create 5 engaging Instagram captions for a coffee shop...";
      case 'seo':
        return "Find trending keywords for 'AI marketing tools'...";
      case 'email':
        return "Create a welcome email sequence for new subscribers...";
      case 'optimization':
        return "Analyze this ad performance data: CTR: 2.3%, CVR: 4.1%...";
      case 'research':
        return "Research competitor pricing strategies for SaaS products...";
      default:
        return "Enter your request for the AI agent...";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'content': '✍️',
      'optimization': '📊', 
      'social': '📱',
      'seo': '🔍',
      'email': '📧',
      'research': '🎯'
    };
    return icons[category as keyof typeof icons] || '🤖';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Agent not found'}
        </div>
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
                <h1 className="text-xl font-semibold text-gray-900">AI Marketing Crypto</h1>
              </Link>
            </div>
            <nav className="flex space-x-4 items-center">
              <Link to="/browse" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Browse Agents
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
              )}
              <WalletConnect />
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Agent Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{getCategoryIcon(agent.category)}</div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.title}</h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {agent.creator_username}</span>
                        <span>•</span>
                        <span className="capitalize bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">{agent.category}</span>
                        <span>•</span>
                        <span>{agent.total_uses} uses</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {agent.pricing_model === 'per_call' && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {agent.price_per_call} USDC
                        </div>
                        <div className="text-sm text-green-500">per call</div>
                      </div>
                    )}
                    {agent.pricing_model === 'subscription' && agent.price_per_month && (
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {agent.price_per_month} USDC
                        </div>
                        <div className="text-sm text-blue-500">per month</div>
                      </div>
                    )}
                    {agent.pricing_model === 'performance' && (
                      <div className="bg-purple-50 px-4 py-2 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">Performance Based</div>
                        <div className="text-sm text-purple-500">Pay for results</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{agent.description}</p>
                </div>

                {/* CDP Agent Wallet Info */}
                {agent.agent_type === 'cdp-agent' && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">🔗 CDP Agent Details</h2>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                          <div className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                            {agent.creator_wallet}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                          <div className="text-sm text-gray-900 bg-white p-2 rounded border">
                            Base Sepolia Testnet
                          </div>
                        </div>
                      </div>
                      
                      {/* Smart Contract Address */}
                      {agent.smart_contract_address && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Smart Contract</label>
                          <div className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                            {agent.smart_contract_address}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          ✅ Real blockchain wallet • 🤖 Autonomous AI agent • 💰 CDP powered
                          {agent.smart_contract_address && ' • 📄 Smart contract deployed'}
                        </div>
                        <div className="flex space-x-3">
                          <a
                            href={`https://sepolia.basescan.org/address/${agent.creator_wallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Wallet →
                          </a>
                          {agent.smart_contract_address && (
                            <a
                              href={`https://sepolia.basescan.org/address/${agent.smart_contract_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              View Contract →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {agent.performance_metrics && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(agent.performance_metrics.accuracy * 100)}%
                        </div>
                        <div className="text-sm text-green-800">Accuracy</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {agent.performance_metrics.response_time}ms
                        </div>
                        <div className="text-sm text-blue-800">Avg Response</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(agent.performance_metrics.success_rate * 100)}%
                        </div>
                        <div className="text-sm text-purple-800">Success Rate</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {agent.tags && agent.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Capabilities</h2>
                    <div className="flex flex-wrap gap-2">
                      {agent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Demo & Deployment */}
          <div className="space-y-6">
            
            {/* Demo Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Try Agent Demo</h3>
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                  {freeCalls} free calls left
                </div>
              </div>

              {freeCalls > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Input
                    </label>
                    <textarea
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder={getDemoPlaceholder()}
                    />
                  </div>

                  <button
                    onClick={runDemo}
                    disabled={!demoInput.trim() || demoLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    {demoLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Running Demo...
                      </>
                    ) : (
                      <>
                        🧪 Run Free Demo
                      </>
                    )}
                  </button>

                  {/* Demo Results */}
                  {demoResult && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                      {demoResult.success ? (
                        <div>
                          <div className="flex items-center text-green-600 mb-2">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Demo Result</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(demoResult.output, null, 2)}</pre>
                          </div>
                          <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <div>⏱️ Processing time: {demoResult.usage_info.processing_time}ms</div>
                            <div>💰 Cost would be: {demoResult.usage_info.cost_would_be} USDC</div>
                            <div>🔢 Tokens used: {demoResult.usage_info.tokens_used}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-600">
                          <div className="flex items-center mb-2">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Demo Failed</span>
                          </div>
                          <div className="text-sm">{demoResult.error}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-500 mb-2">🎯 Demo limit reached</div>
                  <p className="text-sm text-gray-600">Deploy the agent to continue using it!</p>
                </div>
              )}
            </div>

            {/* Deployment Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deploy Agent</h3>
              
              {!deploymentSuccess ? (
                <div>
                  {!isConnected ? (
                    <div className="space-y-4">
                      <p className="text-orange-600 font-medium text-center">
                        Connect your wallet to deploy this agent
                      </p>
                      <WalletConnect />
                    </div>
                  ) : !showOnramp ? (
                    <button
                      onClick={() => setShowOnramp(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center justify-center"
                    >
                      <span className="mr-2">🚀</span>
                      Deploy Agent Now
                    </button>
                  ) : (
                    <CoinbaseOnramp
                      contentId={agent.id}
                      amount={agent.pricing_model === 'per_call' ? agent.price_per_call.toString() : agent.price_per_month?.toString() || '10'}
                      currency="USDC"
                      onSuccess={handleDeploymentSuccess}
                      onError={handleDeploymentError}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-green-900 mb-3">
                      ✅ Agent Deployed Successfully!
                    </h4>
                    <p className="text-green-700 mb-4">
                      Your agent is now active and ready to use. Access it from your dashboard.
                    </p>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      <span className="mr-2">📊</span>
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Uses</span>
                  <span className="font-semibold">{agent.total_uses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold">{agent.active_users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category Rank</span>
                  <span className="font-semibold text-blue-600">#3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;