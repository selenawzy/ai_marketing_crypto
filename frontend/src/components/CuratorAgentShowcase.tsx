import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

interface CuratorAgent {
  agentId: number;
  name: string;
  wallet: {
    address: string;
    network: string;
    balance: string;
  };
  status: string;
  capabilities: string[];
}

interface AgentStatus {
  agent: {
    portfolio: {
      totalValue: number;
      performance: {
        dailyReturn: number;
        weeklyReturn: number;
        totalReturn: number;
      };
    };
    strategy: {
      content: {
        maxSpendPerContent: number;
        preferredCategories: string[];
      };
    };
    performance: {
      totalTransactions: number;
      successRate: number;
    };
  };
  recentTransactions: any[];
  purchasedContent: any[];
  realTimeMetrics: {
    totalContentPurchased: number;
    totalSpent: number;
    averageContentRating: number;
    lastActivity: string;
  };
}

const CuratorAgentShowcase: React.FC = () => {
  const { account } = useWeb3();
  const [deployedAgent, setDeployedAgent] = useState<CuratorAgent | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  // Demo data for the showcase
  const [demoInfo, setDemoInfo] = useState<any>(null);

  useEffect(() => {
    fetchDemoInfo();
  }, []);

  useEffect(() => {
    if (deployedAgent) {
      const interval = setInterval(fetchAgentStatus, 10000); // Update every 10 seconds
      fetchAgentStatus();
      return () => clearInterval(interval);
    }
  }, [deployedAgent]);

  const fetchDemoInfo = async () => {
    try {
      const response = await fetch('/api/curator-agent/demo');
      const data = await response.json();
      if (data.success) {
        setDemoInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching demo info:', error);
    }
  };

  const deployAgent = async () => {
    try {
      setDeploying(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to deploy an agent');
        return;
      }

      const response = await fetch('/api/curator-agent/deploy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to deploy agent');
      }

      const data = await response.json();
      if (data.success) {
        setDeployedAgent(data.data);
        setShowDemo(false);
        console.log('🎉 Curator Agent deployed successfully!', data.data);
      }
    } catch (error: any) {
      console.error('❌ Deploy error:', error);
      setError(error.message || 'Failed to deploy agent');
    } finally {
      setDeploying(false);
    }
  };

  const fetchAgentStatus = async () => {
    if (!deployedAgent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/curator-agent/${deployedAgent.agentId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAgentStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching agent status:', error);
    }
  };

  const fundAgent = async () => {
    if (!deployedAgent) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/curator-agent/${deployedAgent.agentId}/fund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: '0.1' }) // Fund with 0.1 ETH
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('💰 Agent funded successfully!');
          await fetchAgentStatus();
        }
      }
    } catch (error) {
      console.error('Error funding agent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet to Deploy</h3>
          <p className="text-gray-600">Connect your wallet to deploy and interact with the AI Content Curator & Trader</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🤖 AI Content Curator & Trader</h1>
            <p className="text-blue-100">Powered by Coinbase CDP Agent Kit • Autonomous • Intelligent • Profitable</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">🚀</div>
            <div className="text-sm text-blue-200">Next-Gen AI</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showDemo && demoInfo && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{demoInfo.name}</h2>
              <p className="text-gray-600">{demoInfo.description}</p>
            </div>
            <button
              onClick={deployAgent}
              disabled={deploying}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {deploying ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Deploy Agent</span>
                </>
              )}
            </button>
          </div>

          {/* Capabilities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {demoInfo.capabilities.map((capability: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{capability.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{capability.description}</p>
                <div className="space-y-1">
                  {capability.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Demo Metrics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Expected Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{demoInfo.demoMetrics.averageROI}</div>
                <div className="text-sm text-gray-500">Average ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{demoInfo.demoMetrics.successRate}</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{demoInfo.demoMetrics.contentAccuracy}</div>
                <div className="text-sm text-gray-500">Content Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{demoInfo.demoMetrics.uptime}</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deployed Agent Dashboard */}
      {deployedAgent && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🚀 Agent Deployed Successfully!</h2>
              <p className="text-gray-600">Your AI agent is now running autonomously</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={fundAgent}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                💰 Fund 0.1 ETH
              </button>
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                deployedAgent.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {deployedAgent.status === 'active' ? '🟢 Active' : '🟡 Pending'}
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Agent Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {deployedAgent.name}</div>
                <div><strong>Network:</strong> {deployedAgent.wallet.network}</div>
                <div><strong>Wallet:</strong> {deployedAgent.wallet.address.slice(0, 6)}...{deployedAgent.wallet.address.slice(-4)}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Portfolio</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Balance:</strong> {parseFloat(deployedAgent.wallet.balance).toFixed(4)} ETH</div>
                {agentStatus && (
                  <>
                    <div><strong>Total Value:</strong> {agentStatus.agent.portfolio?.totalValue?.toFixed(4) || '0'} ETH</div>
                    <div><strong>Transactions:</strong> {agentStatus.agent.performance?.totalTransactions || 0}</div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Performance</h3>
              <div className="space-y-2 text-sm">
                {agentStatus ? (
                  <>
                    <div><strong>Success Rate:</strong> {agentStatus.agent.performance?.successRate || 0}%</div>
                    <div><strong>Content Purchased:</strong> {agentStatus.realTimeMetrics.totalContentPurchased}</div>
                    <div><strong>Total Spent:</strong> {agentStatus.realTimeMetrics.totalSpent.toFixed(4)} ETH</div>
                  </>
                ) : (
                  <div className="text-gray-500">Loading performance data...</div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Activity */}
          {agentStatus && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🔄 Recent Activity</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {agentStatus.recentTransactions.slice(0, 5).map((tx: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">{tx.amount} {tx.currency}</div>
                          <div className="text-xs text-gray-500">
                            {JSON.parse(tx.transaction_data || '{}').type?.replace('_', ' ') || 'Transaction'}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  {agentStatus.recentTransactions.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No transactions yet. Agent is initializing...
                    </div>
                  )}
                </div>
              </div>

              {/* Purchased Content */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">📚 Smart Purchases</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {agentStatus.purchasedContent.map((content: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium mb-1">{content.title}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {content.category} • {content.price_per_access} ETH
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-xs text-yellow-600">
                            ⭐ {content.average_rating}/5
                          </div>
                          <div className="text-xs text-gray-500">
                            {content.view_count} views
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {agentStatus.purchasedContent.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No content purchased yet. Agent is analyzing market...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CDP Agent Kit Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Powered by Coinbase CDP Agent Kit</h3>
          <p className="text-gray-600 mb-4">
            This agent demonstrates the full capabilities of blockchain-enabled AI using Coinbase's Developer Platform
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real Wallet Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Autonomous Transactions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>DeFi Integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratorAgentShowcase;