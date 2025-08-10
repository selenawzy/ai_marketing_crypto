import React from 'react';

interface AgentKitInfoProps {
  agent: {
    cdp_agent_id?: string;
    wallet_address?: string;
    deployment_status?: 'pending' | 'deployed' | 'active';
    network?: string;
    title: string;
  };
}

const AgentKitInfo: React.FC<AgentKitInfoProps> = ({ agent }) => {
  if (!agent.cdp_agent_id) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-cyan-400 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          AgentKit Integration
        </h4>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          agent.deployment_status === 'active' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : agent.deployment_status === 'deployed'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {agent.deployment_status === 'active' ? '🟢 Active' : 
           agent.deployment_status === 'deployed' ? '🔵 Deployed' : '🟡 Pending'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-purple-300">Agent ID:</span>
          <div className="text-cyan-400 font-mono bg-black/30 px-2 py-1 rounded border border-cyan-500/20 mt-1">
            {agent.cdp_agent_id}
          </div>
        </div>
        
        {agent.wallet_address && (
          <div>
            <span className="text-purple-300">Wallet:</span>
            <div className="text-cyan-400 font-mono bg-black/30 px-2 py-1 rounded border border-cyan-500/20 mt-1 truncate">
              {agent.wallet_address}
            </div>
          </div>
        )}
        
        {agent.network && (
          <div>
            <span className="text-purple-300">Network:</span>
            <div className="text-cyan-400 bg-black/30 px-2 py-1 rounded border border-cyan-500/20 mt-1">
              {agent.network}
            </div>
          </div>
        )}
        
        <div>
          <span className="text-purple-300">Capabilities:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded border border-cyan-500/30">
              Smart Contracts
            </span>
            <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded border border-cyan-500/30">
              Onchain Actions
            </span>
            <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded border border-cyan-500/30">
              Secure Wallets
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-cyan-500/20">
        <a
          href="https://docs.cdp.coinbase.com/agent-kit/welcome"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Learn more about AgentKit
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default AgentKitInfo; 