import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import CoinbaseOnramp from '../components/CoinbaseOnramp';
import WalletConnect from '../components/WalletConnect';
import axios from 'axios';

interface Content {
  id: number;
  title: string;
  description: string;
  url: string;
  content_type: string;
  price_per_access: number;
  requires_payment: boolean;
  creator_username: string;
  creator_wallet: string;
  total_views: number;
  paid_views: number;
}

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { account, isConnected } = useWeb3();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnramp, setShowOnramp] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/content/${id}`);
      
      if (response.data.success) {
        setContent(response.data.data.content);
      } else {
        setError('Content not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSuccess = (data: any) => {
    setPurchaseSuccess(true);
    setShowOnramp(false);
    // Optionally track the purchase or update UI
    console.log('Purchase successful:', data);
  };

  const handlePurchaseError = (error: string) => {
    console.error('Purchase error:', error);
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

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Content not found'}
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
                Browse
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {content.creator_username}</span>
                  <span>•</span>
                  <span className="capitalize">{content.content_type}</span>
                  <span>•</span>
                  <span>{content.total_views} views</span>
                </div>
              </div>
              
              <div className="text-right">
                {content.requires_payment ? (
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {content.price_per_access} USDC
                    </div>
                    <div className="text-sm text-blue-500">per access</div>
                  </div>
                ) : (
                  <div className="bg-green-50 px-4 py-2 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">Free</div>
                  </div>
                )}
              </div>
            </div>

            {content.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{content.description}</p>
              </div>
            )}

            {content.requires_payment && !purchaseSuccess ? (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🔒 Premium Content
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This content requires payment to access. Purchase with crypto using Coinbase Pay for instant access.
                  </p>
                  
                  {!isConnected ? (
                    <div className="space-y-4">
                      <p className="text-orange-600 font-medium">
                        Connect your wallet to purchase this content
                      </p>
                      <WalletConnect />
                    </div>
                  ) : !showOnramp ? (
                    <button
                      onClick={() => setShowOnramp(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center justify-center mx-auto"
                    >
                      <span className="mr-2">💳</span>
                      Buy Access with Crypto
                    </button>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <CoinbaseOnramp
                        contentId={content.id}
                        amount={content.price_per_access.toString()}
                        currency="USDC"
                        onSuccess={handlePurchaseSuccess}
                        onError={handlePurchaseError}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-6 mb-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    ✅ {purchaseSuccess ? 'Purchase Successful!' : 'Content Access'}
                  </h3>
                  {purchaseSuccess && (
                    <p className="text-green-700 mb-4">
                      Your purchase was successful! You now have access to this content.
                    </p>
                  )}
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-200">
                    <p className="text-gray-700 mb-4">
                      <strong>Content URL:</strong> {content.url}
                    </p>
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                    >
                      <span className="mr-2">🚀</span>
                      Access Content
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{content.total_views}</div>
                <div className="text-sm text-gray-500">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{content.paid_views}</div>
                <div className="text-sm text-gray-500">Paid Access</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{content.price_per_access}</div>
                <div className="text-sm text-gray-500">Price (USDC)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Base</div>
                <div className="text-sm text-gray-500">Network</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;