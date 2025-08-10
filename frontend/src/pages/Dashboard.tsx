import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { getNetworkConfig } from '../config/networks';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  CpuChipIcon, 
  ChartBarIcon, 
  WalletIcon, 
  PlusIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  CircleStackIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface Agent {
  id: number;
  name: string;
  description: string;
  status: string;
  performance: number;
  earnings: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { account, balance, isConnected } = useWeb3();
  const navigate = useNavigate();
  const networkConfig = getNetworkConfig();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalTransactions: 0
  });
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, agentsResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/agents')
        ]);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
        
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json();
          setAgents(agentsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-8"></div>
          <div className="text-white text-2xl font-light">Loading Dashboard</div>
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
                  Dashboard
                </h1>
                <p className="text-white/60 text-sm">AI Agent Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <BellIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <CogIcon className="h-6 w-6" />
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 ml-4">
                <img
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-0.5"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                  alt={user?.username || 'User'}
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-white/60 hover:text-white transition-colors flex items-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-3 w-3 mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Agents</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAgents}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <CpuChipIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Active Agents</p>
                  <p className="text-3xl font-bold text-white">{stats.activeAgents}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Transactions</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-8 backdrop-blur-sm">
            {['overview', 'agents', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="card">
                <h3 className="heading-sm mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="action-card group">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <PlusIcon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Create Agent</h4>
                    <p className="text-white/60 text-sm">Deploy a new AI agent</p>
                  </button>
                  
                  <button className="action-card group">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <RocketLaunchIcon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Launch Campaign</h4>
                    <p className="text-white/60 text-sm">Start marketing campaign</p>
                  </button>
                  
                  <button className="action-card group">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">View Analytics</h4>
                    <p className="text-white/60 text-sm">Performance insights</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="heading-sm mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <CpuChipIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{agent.name}</h4>
                          <p className="text-white/60 text-sm">{agent.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'active' ? 'status-active' : 
                          agent.status === 'pending' ? 'status-pending' : 'status-inactive'
                        }`}>
                          {agent.status}
                        </div>
                        <p className="text-white/60 text-sm mt-1">${agent.earnings.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="heading-sm">Your AI Agents</h3>
                <button 
                  onClick={() => navigate('/agents/create')}
                  className="btn-primary btn-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Agent
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <CpuChipIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                          <p className="text-white/60 text-sm">{agent.description}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        agent.status === 'active' ? 'status-active' : 
                        agent.status === 'pending' ? 'status-pending' : 'status-inactive'
                      }`}>
                        {agent.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm">Performance</p>
                        <p className="text-xl font-bold text-white">{agent.performance}%</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-sm">Earnings</p>
                        <p className="text-xl font-bold text-white">${agent.earnings.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 btn-secondary btn-sm">
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Start
                      </button>
                      <button className="flex-1 btn-secondary btn-sm">
                        <Cog6ToothIcon className="h-4 w-4 mr-2" />
                        Configure
                      </button>
                      <button className="btn-secondary btn-sm">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="card">
              <h3 className="heading-sm mb-6">Performance Analytics</h3>
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Analytics dashboard coming soon</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card">
              <h3 className="heading-sm mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Profile Information</h4>
                    <p className="text-white/60 text-sm">Update your account details</p>
                  </div>
                  <button className="btn-secondary btn-sm">Edit</button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Wallet Connection</h4>
                    <p className="text-white/60 text-sm">Manage blockchain wallet</p>
                  </div>
                  <button className="btn-secondary btn-sm">Connect</button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">API Keys</h4>
                    <p className="text-white/60 text-sm">Manage API access</p>
                  </div>
                  <button className="btn-secondary btn-sm">Manage</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;