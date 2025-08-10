import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { getNetworkConfig } from '../config/networks';
import AIService from '../services/aiService';
import ErrorNotification from './ErrorNotification';

interface PayPerCallAgentProps {
  agentId: string;
  agentName: string;
  pricePerCall: number;
  creatorWallet: string;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: string) => void;
}

const PayPerCallAgent: React.FC<PayPerCallAgentProps> = ({
  agentId,
  agentName,
  pricePerCall,
  creatorWallet,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { account, provider, signer, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [callCount, setCallCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const networkConfig = getNetworkConfig();

  // Real AI call after payment
  const callAIAgent = async (userPrompt: string) => {
    const aiService = AIService.getInstance();
    try {
      const aiResponse = await aiService.callAI(agentId, userPrompt);
      return aiResponse.response;
    } catch (error) {
      console.error('AI call failed:', error);
      return 'Sorry, the AI agent is temporarily unavailable. Please try again later.';
    }
  };

  const handlePayAndCall = async () => {
    if (!prompt.trim()) {
      setError('💭 Please enter a question or prompt for the AI agent to help you with your marketing needs.');
      return;
    }

    if (!account || !provider || !signer) {
      setError('🔗 Please connect your wallet first to make payments to AI agents and unlock their capabilities.');
      return;
    }

    if (chainId !== networkConfig.chainId) {
      setError(`🌐 Please switch to ${networkConfig.name} network to make payments. The current network is not supported for transactions.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert price to ETH (for demo: 1 USDC = 0.001 ETH)
      const ethAmount = (pricePerCall * 0.001).toFixed(6);
      const amountInWei = ethers.parseEther(ethAmount);

      // Check balance
      const balance = await provider.getBalance(account);
      const balanceFormatted = ethers.formatEther(balance);
      
      if (parseFloat(balanceFormatted) < parseFloat(ethAmount)) {
        throw new Error(`💳 Insufficient ETH balance! You have ${parseFloat(balanceFormatted).toFixed(4)} ETH but need ${ethAmount} ETH for this AI call. Please get some testnet ETH from a faucet to continue.`);
      }

      console.log(`💰 Paying ${ethAmount} ETH (${pricePerCall} USDC) to creator ${creatorWallet} for AI call...`);

      // Send payment to creator
      const tx = await signer.sendTransaction({
        to: creatorWallet,
        value: amountInWei,
      });

      console.log('📝 Payment transaction:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('💥 Transaction failed! The blockchain transaction was not successful. Please try again with sufficient gas fees.');
      }

      // After successful payment, make real AI call
      console.log('🤖 Making AI call...');
      const aiResponse = await callAIAgent(prompt);
      setResponse(aiResponse);
      setCallCount(prev => prev + 1);
      setTotalSpent(prev => prev + pricePerCall);

      // Show success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-weight: 500;
        max-width: 400px;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; margin-right: 8px;">🤖</span>
          <strong>AI Call Successful!</strong>
        </div>
        <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
          <strong>Paid:</strong> ${ethAmount} ETH (${pricePerCall} USDC)<br>
          <strong>To Creator:</strong> ${creatorWallet.slice(0, 8)}...<br>
          <strong>Agent:</strong> ${agentName}<br>
          <a href="https://sepolia.basescan.org/tx/${receipt.hash}" 
             target="_blank" 
             style="color: #87CEEB; text-decoration: underline;">
            🔍 View Payment →
          </a>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 8000);

      onPaymentSuccess?.({
        transactionHash: receipt.hash,
        amount: pricePerCall,
        creator: creatorWallet,
        prompt,
        response: aiResponse
      });

      // Clear prompt for next call
      setPrompt('');

    } catch (err: any) {
      console.error('❌ AI call payment failed:', err);
      
      let errorMessage = '💥 Payment failed! ';
      if (err.message.includes('insufficient funds')) {
        errorMessage = '💳 Insufficient funds! Please get some Base Sepolia testnet ETH from a faucet to make payments.';
      } else if (err.message.includes('Insufficient ETH balance')) {
        errorMessage = err.message;
      } else if (err.message.includes('user rejected') || err.message.includes('rejected')) {
        errorMessage = '🚫 Payment cancelled! You rejected the transaction. You can try again when ready.';
      } else if (err.message.includes('gas')) {
        errorMessage = '⛽ Gas fee issue! Please try again with higher gas fees or check your wallet settings.';
      } else if (err.message.includes('network')) {
        errorMessage = '🌐 Network error! Please check your connection and make sure you\'re on the correct network.';
      } else {
        errorMessage += err.message || 'Please check your wallet and network connection.';
      }
      
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">🤖 {agentName}</h3>
        <div className="text-right">
          <div className="text-sm text-gray-600">Price per call</div>
          <div className="text-lg font-bold text-blue-600">{pricePerCall} USDC</div>
        </div>
      </div>

      {/* Usage Stats */}
      {callCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Calls made: <strong>{callCount}</strong></span>
            <span>Total spent: <strong>{totalSpent} USDC</strong></span>
          </div>
        </div>
      )}

      <ErrorNotification 
        error={error} 
        onClose={() => setError(null)} 
        autoClose={true}
        duration={8000}
      />

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ask the AI Agent
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a marketing strategy for my startup', 'Write SEO content for my product', etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Pay and Call Button */}
      <button
        onClick={handlePayAndCall}
        disabled={loading || !prompt.trim() || !account}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
          account && prompt.trim() && !loading
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </>
        ) : !account ? (
          'Connect Wallet to Use AI'
        ) : !prompt.trim() ? (
          'Enter a prompt to continue'
        ) : (
          `💰 Pay ${pricePerCall} USDC & Ask AI`
        )}
      </button>

      {/* AI Response */}
      {response && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-green-600 font-semibold">✅ AI Response</span>
            <span className="ml-auto text-xs text-gray-500">Call #{callCount}</span>
          </div>
          <p className="text-gray-800 leading-relaxed">{response}</p>
        </div>
      )}

      {/* Creator Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Creator earnings go to:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {creatorWallet.slice(0, 8)}...{creatorWallet.slice(-6)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PayPerCallAgent;