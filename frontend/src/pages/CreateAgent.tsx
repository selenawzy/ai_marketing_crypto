import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import WalletConnect from '../components/WalletConnect';
import ErrorNotification from '../components/ErrorNotification';
import axios from 'axios';

interface AgentFormData {
  title: string;
  description: string;
  agentType: 'content' | 'optimization' | 'social' | 'seo' | 'email' | 'research';
  pricingModel: 'per_call' | 'subscription' | 'performance' | 'stake_access';
  pricePerCall: string;
  pricePerMonth: string;
  performanceThreshold: string;
  stakeRequired: string;
  capabilities: string;
  trainingData: string;
  smartContractFeatures: {
    slaGuarantee: boolean;
    autoRefund: boolean;
    performanceBasedPricing: boolean;
    communityTraining: boolean;
    revenueSharing: boolean;
    stakingRewards: boolean;
  };
  nftMetadata: {
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    upgradeable: boolean;
    tradeable: boolean;
  };
}

const CreateAgent: React.FC = () => {
  const [formData, setFormData] = useState<AgentFormData>({
    title: '',
    description: '',
    agentType: 'content',
    pricingModel: 'per_call',
    pricePerCall: '0.10',
    pricePerMonth: '25.00',
    performanceThreshold: '85',
    stakeRequired: '100',
    capabilities: '',
    trainingData: '',
    smartContractFeatures: {
      slaGuarantee: true,
      autoRefund: false,
      performanceBasedPricing: false,
      communityTraining: true,
      revenueSharing: false,
      stakingRewards: false,
    },
    nftMetadata: {
      rarity: 'common',
      upgradeable: true,
      tradeable: true,
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const { isAuthenticated } = useAuth();
  const { account, isConnected } = useWeb3();
  const navigate = useNavigate();

  const agentTypes = [
    { 
      value: 'content', 
      label: '✍️ Content Creation NFT', 
      desc: 'AI agents that create content with performance-based pricing',
      features: 'NFT ownership, performance tracking, community training'
    },
    { 
      value: 'optimization', 
      label: '📊 Campaign Optimizer', 
      desc: 'Self-improving agents with guaranteed ROI via smart contracts',
      features: 'SLA guarantees, auto-refunds, continuous learning'
    },
    { 
      value: 'social', 
      label: '📱 Social Intelligence', 
      desc: 'Decentralized social data analysis with cross-chain deployment',
      features: 'DAO governance, multi-chain, privacy-preserving'
    },
    { 
      value: 'seo', 
      label: '🔍 SEO Oracle', 
      desc: 'On-chain SEO data validation with trustless verification',
      features: 'Oracle integration, verified data, consensus-driven'
    },
    { 
      value: 'email', 
      label: '📧 Email Automation', 
      desc: 'Privacy-preserving email AI with zero-knowledge processing',
      features: 'ZK-proofs, privacy-first, encrypted training'
    },
    { 
      value: 'research', 
      label: '🎯 Market Predictor', 
      desc: 'Prediction markets integration with accuracy betting',
      features: 'Prediction markets, yield farming, accuracy rewards'
    }
  ];

  const pricingModels = [
    { 
      value: 'per_call', 
      label: '⚡ Pay-Per-Call', 
      desc: 'Users pay for each agent interaction',
      crypto_reason: 'Micro-payments impossible with traditional systems'
    },
    { 
      value: 'subscription', 
      label: '📅 Smart Contract Subscription', 
      desc: 'Automated recurring payments via smart contracts',
      crypto_reason: 'Trustless subscriptions, no payment processor middlemen'
    },
    { 
      value: 'performance', 
      label: '📈 Performance-Based', 
      desc: 'Payment only when agent meets performance targets',
      crypto_reason: 'Smart contract SLAs with automatic execution'
    },
    { 
      value: 'stake_access', 
      label: '🏛️ Stake-to-Access', 
      desc: 'Users stake tokens to access agent, earn rewards',
      crypto_reason: 'DeFi mechanics for sustainable economics'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('smartContractFeatures.')) {
      const feature = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        smartContractFeatures: {
          ...prev.smartContractFeatures,
          [feature]: (e.target as HTMLInputElement).checked
        }
      }));
    } else if (name.includes('nftMetadata.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nftMetadata: {
          ...prev.nftMetadata,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isConnected) {
      setError('🔐 Authentication and wallet connection required! Please sign in and connect your wallet to create and mint AI agents as NFTs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/agents/create', {
        ...formData,
        creator_wallet: account,
        mint_as_nft: true, // Always mint as NFT
        smart_contract_address: null, // Will be generated
        blockchain_network: 'base-sepolia'
      });

      if (response.data.success) {
        console.log('✅ Agent created successfully:', response.data);
        // Use the agentId from the response
        const agentId = response.data.data.agentId;
        if (agentId) {
          navigate(`/agents/${agentId}`);
        } else {
          // Show success message and redirect to agent list
          alert('🎉 AI Agent created successfully!');
          navigate('/agents');
        }
      }
    } catch (err: any) {
      let errorMessage = '💥 Failed to create AI agent! ';
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message?.includes('network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else {
        errorMessage += 'Please check your wallet connection and try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(Math.min(step + 1, 3));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create AI agents</p>
          <Link to="/auth" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Login / Sign Up
          </Link>
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
                <h1 className="text-xl font-semibold text-gray-900">Crypto Agent Marketplace</h1>
              </Link>
            </div>
            <nav className="flex space-x-4 items-center">
              <Link to="/browse" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Browse Agents
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <WalletConnect />
            </nav>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create AI Agent NFT</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mint an AI marketing agent as an NFT with smart contract features. Earn from usage, community training, and performance rewards.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    stepNum === step 
                      ? 'bg-blue-600 text-white' 
                      : stepNum < step 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNum < step ? '✓' : stepNum}
                  </div>
                  {stepNum < 3 && <div className="w-12 h-0.5 bg-gray-300"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              
              <ErrorNotification 
                error={error} 
                onClose={() => setError('')} 
                autoClose={true}
                duration={8000}
              />

              {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    Connect your wallet to mint your agent as an NFT
                  </div>
                  <WalletConnect />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                {/* Step 1: Agent Type & Basic Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Agent Configuration</h2>
                      <p className="text-gray-600">Define your AI agent's core capabilities and blockchain features</p>
                    </div>

                    {/* Agent Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name *
                      </label>
                      <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                        placeholder="e.g., 'Content Creator Pro', 'SEO Oracle Master'"
                        required
                      />
                    </div>

                    {/* Agent Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Agent Type * <span className="text-blue-600">(Each type has unique blockchain features)</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agentTypes.map(type => (
                          <label key={type.value} className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.agentType === type.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="agentType"
                              value={type.value}
                              checked={formData.agentType === type.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className="font-medium text-gray-900 mb-1">{type.label}</div>
                            <div className="text-sm text-gray-600 mb-2">{type.desc}</div>
                            <div className="text-xs text-blue-600 font-medium">🔗 {type.features}</div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Description *
                      </label>
                      <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                        placeholder="Describe what your AI agent does and why it's unique..."
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        Next: Pricing & Smart Contracts →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Pricing & Smart Contract Features */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Blockchain Economics</h2>
                      <p className="text-gray-600">Configure pricing model and smart contract features</p>
                    </div>

                    {/* Pricing Model */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Pricing Model * <span className="text-blue-600">(Why crypto is essential)</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pricingModels.map(model => (
                          <label key={model.value} className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.pricingModel === model.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="pricingModel"
                              value={model.value}
                              checked={formData.pricingModel === model.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className="font-medium text-gray-900 mb-1">{model.label}</div>
                            <div className="text-sm text-gray-600 mb-2">{model.desc}</div>
                            <div className="text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                              💡 {model.crypto_reason}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Configuration */}
                    <div className="grid grid-cols-2 gap-6">
                      {(formData.pricingModel === 'per_call' || formData.pricingModel === 'subscription') && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price per Call (USDC)
                            </label>
                            <input 
                              type="number" 
                              name="pricePerCall"
                              value={formData.pricePerCall}
                              onChange={handleChange}
                              step="0.01"
                              min="0.01"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Monthly Subscription (USDC)
                            </label>
                            <input 
                              type="number" 
                              name="pricePerMonth"
                              value={formData.pricePerMonth}
                              onChange={handleChange}
                              step="0.01"
                              min="1.00"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                      
                      {formData.pricingModel === 'performance' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Performance Threshold (%)
                          </label>
                          <input 
                            type="number" 
                            name="performanceThreshold"
                            value={formData.performanceThreshold}
                            onChange={handleChange}
                            min="50"
                            max="99"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Users only pay if agent achieves this accuracy</p>
                        </div>
                      )}

                      {formData.pricingModel === 'stake_access' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Stake Required (USDC)
                          </label>
                          <input 
                            type="number" 
                            name="stakeRequired"
                            value={formData.stakeRequired}
                            onChange={handleChange}
                            min="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Users stake this amount to access agent</p>
                        </div>
                      )}
                    </div>

                    {/* Smart Contract Features */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Smart Contract Features <span className="text-blue-600">(Why traditional systems can't do this)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries({
                          slaGuarantee: 'SLA Guarantee - Automatic refunds if performance drops',
                          autoRefund: 'Auto-Refund System - No human intervention needed',
                          performanceBasedPricing: 'Performance-Based Pricing - Pay only for results',
                          communityTraining: 'Community Training - Decentralized improvement',
                          revenueSharing: 'Revenue Sharing - Automatic splits with contributors',
                          stakingRewards: 'Staking Rewards - Earn yield from agent usage'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              name={`smartContractFeatures.${key}`}
                              checked={formData.smartContractFeatures[key as keyof typeof formData.smartContractFeatures]}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        Next: NFT Configuration →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: NFT & Launch */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: NFT Minting & Launch</h2>
                      <p className="text-gray-600">Configure NFT metadata and launch your agent</p>
                    </div>

                    {/* NFT Configuration */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4">🎨 NFT Metadata</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NFT Rarity
                          </label>
                          <select
                            name="nftMetadata.rarity"
                            value={formData.nftMetadata.rarity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="common">🟢 Common (Most accessible)</option>
                            <option value="rare">🔵 Rare (Better performance bonuses)</option>
                            <option value="epic">🟣 Epic (Premium features unlocked)</option>
                            <option value="legendary">🟠 Legendary (Maximum capabilities)</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="nftMetadata.upgradeable"
                              checked={formData.nftMetadata.upgradeable}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">🔧 Upgradeable (Community can improve)</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="nftMetadata.tradeable"
                              checked={formData.nftMetadata.tradeable}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">💱 Tradeable (Can be sold on marketplaces)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Capabilities & Training Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agent Capabilities
                        </label>
                        <textarea 
                          name="capabilities"
                          value={formData.capabilities}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                          placeholder="List specific capabilities, skills, and features..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Training Data Sources
                        </label>
                        <textarea 
                          name="trainingData"
                          value={formData.trainingData}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                          placeholder="Describe training data, models used, specializations..."
                        />
                      </div>
                    </div>

                    {/* Launch Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Ready to Launch</h3>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <div className="text-blue-700 font-medium mb-2">What happens when you mint:</div>
                          <ul className="space-y-1 text-blue-600">
                            <li>• Agent NFT minted to your wallet</li>
                            <li>• Smart contracts deployed automatically</li>
                            <li>• Listed on marketplace immediately</li>
                            <li>• Revenue sharing contracts activated</li>
                          </ul>
                        </div>
                        <div>
                          <div className="text-blue-700 font-medium mb-2">Ongoing benefits:</div>
                          <ul className="space-y-1 text-blue-600">
                            <li>• Earn from every agent usage</li>
                            <li>• Community training improves performance</li>
                            <li>• NFT value increases with popularity</li>
                            <li>• Governance voting rights</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
                      >
                        ← Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading || !isConnected}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Minting Agent NFT...
                          </div>
                        ) : (
                          '🎨 Mint Agent NFT'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;