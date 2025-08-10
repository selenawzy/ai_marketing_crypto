import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

interface AIAgent {
  id: number;
  agent_name: string;
  description?: string;
  wallet_address: string;
  network: string;
  balance: string;
  capabilities: string[];
  is_active: boolean;
  is_deployed: boolean;
  deployment_status: string;
  created_at: string;
}

interface CreateAgentForm {
  name: string;
  description: string;
  capabilities: string[];
}

const AIAgentDashboard: React.FC = () => {
  const { account } = useWeb3();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAgentForm>({
    name: '',
    description: '',
    capabilities: ['content-access', 'payment-processing']
  });

  useEffect(() => {
    if (account) {
      fetchAgents();
    }
  }, [account]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your AI agents');
        return;
      }

      const response = await fetch('/api/ai-agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const data = await response.json();
      if (data.success) {
        setAgents(data.data.agents || []);
      }
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      setError(error.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to create an AI agent');
        return;
      }

      const response = await fetch('/api/ai-agents/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_name: createForm.name,
          description: createForm.description,
          capabilities: createForm.capabilities
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();
      if (data.success) {
        // Reset form and hide it
        setCreateForm({ name: '', description: '', capabilities: ['content-access', 'payment-processing'] });
        setShowCreateForm(false);
        
        // Refresh agents list
        await fetchAgents();
        
        console.log('✅ AI Agent created successfully:', data.data);
      }
    } catch (error: any) {
      console.error('Error creating agent:', error);
      setError(error.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const handleCapabilityToggle = (capability: string) => {
    setCreateForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Agent Dashboard</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet Required</h3>
          <p className="text-gray-500">Connect your wallet to create and manage AI agents with blockchain capabilities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Agent Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your blockchain-enabled AI agents powered by Coinbase CDP</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create AI Agent</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Create Agent Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create AI Agent</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My AI Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what your AI agent does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
                <div className="space-y-2">
                  {['content-access', 'payment-processing', 'defi-interaction', 'nft-trading'].map(capability => (
                    <label key={capability} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.capabilities.includes(capability)}
                        onChange={() => handleCapabilityToggle(capability)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{capability.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={createAgent}
                  disabled={loading || !createForm.name.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Agent'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agents List */}
      {loading && agents.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading your AI agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Agents Yet</h3>
          <p className="text-gray-500 mb-4">Create your first AI agent to start automating blockchain interactions.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{agent.agent_name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  agent.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {agent.description && (
                <p className="text-gray-600 text-sm mb-3">{agent.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Wallet:</span>
                  <span className="font-mono text-xs">
                    {agent.wallet_address.slice(0, 6)}...{agent.wallet_address.slice(-4)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Network:</span>
                  <span className="capitalize">{agent.network.replace('-', ' ')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Balance:</span>
                  <span>{parseFloat(agent.balance).toFixed(4)} ETH</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`capitalize ${
                    agent.deployment_status === 'active' 
                      ? 'text-green-600' 
                      : agent.deployment_status === 'failed'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {agent.deployment_status}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {capability.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CDP Info Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Powered by Coinbase Developer Platform</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Base Network Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentDashboard;