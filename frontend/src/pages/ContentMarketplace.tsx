import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import CoinbaseOnramp from '../components/CoinbaseOnramp';
import axios from 'axios';

interface Content {
  id: number;
  title: string;
  description: string;
  content_type: string;
  price_per_access: number;
  requires_payment: boolean;
  creator_username: string;
  total_views: number;
  paid_views: number;
}

const ContentMarketplace: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useWeb3();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/content');
      
      if (response.data.success) {
        // Transform the data to handle SQLite boolean values
        const transformedContent = response.data.data.content.map((item: any) => ({
          ...item,
          requires_payment: Boolean(item.requires_payment),
          is_active: Boolean(item.is_active)
        }));
        setContent(transformedContent);
      } else {
        setError('Failed to load content');
      }
    } catch (err: any) {
      console.error('Content fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item => {
    if (filter === 'free') return !item.requires_payment;
    if (filter === 'paid') return item.requires_payment;
    return true;
  });

  // Demo content when no real content exists
  const demoContent: Content[] = [
    {
      id: 1,
      title: "AI Trading Strategies Guide",
      description: "Comprehensive guide on using AI for crypto trading strategies and market analysis.",
      content_type: "article",
      price_per_access: 5.99,
      requires_payment: true,
      creator_username: "CryptoAI_Expert",
      total_views: 1247,
      paid_views: 89
    },
    {
      id: 2,
      title: "Free Blockchain Basics",
      description: "Learn the fundamentals of blockchain technology and how it powers cryptocurrencies.",
      content_type: "video",
      price_per_access: 0,
      requires_payment: false,
      creator_username: "BlockchainEdu",
      total_views: 3421,
      paid_views: 0
    },
    {
      id: 3,
      title: "DeFi Investment Dataset",
      description: "Curated dataset of DeFi protocols with performance metrics and risk analysis.",
      content_type: "data",
      price_per_access: 12.5,
      requires_payment: true,
      creator_username: "DataCrypto",
      total_views: 567,
      paid_views: 45
    }
  ];

  // Use API content if available, otherwise show demo content
  const displayContent = content.length > 0 ? filteredContent : (
    error ? demoContent.filter(item => {
      if (filter === 'free') return !item.requires_payment;
      if (filter === 'paid') return item.requires_payment;
      return true;
    }) : []
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Marketplace</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Marketplace</h1>
          <p className="text-gray-600">
            Discover premium AI and crypto content. Pay with crypto using Coinbase Pay.
          </p>
        </div>
        
        {isAuthenticated && (
          <Link
            to="/create-content"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold"
          >
            Create Content
          </Link>
        )}
      </div>

      {/* Coinbase Pay Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              💳 Pay with Crypto - Powered by Coinbase
            </h3>
            <p className="text-blue-100">
              Seamless USDC payments on Base network. No gas fees, instant access.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl">🚀</div>
              <div className="text-xs">Instant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🔒</div>
              <div className="text-xs">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🌐</div>
              <div className="text-xs">Global</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Content
        </button>
        <button
          onClick={() => setFilter('free')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'free'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Free
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'paid'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Premium
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {displayContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-6">Be the first to create content in this marketplace!</p>
          {isAuthenticated && (
            <Link
              to="/create-content"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Content
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayContent.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {item.content_type === 'article' && '📄'}
                      {item.content_type === 'video' && '🎥'}
                      {item.content_type === 'image' && '🖼️'}
                      {item.content_type === 'data' && '📊'}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                      {item.content_type}
                    </span>
                  </div>
                  
                  {item.requires_payment ? (
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {item.price_per_access} USDC
                      </div>
                      <div className="text-xs text-blue-500">with Coinbase Pay</div>
                    </div>
                  ) : (
                    <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm font-semibold">
                      Free
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>By {item.creator_username}</span>
                  <span>{item.total_views} views</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/content/${item.id}`}
                    className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-md text-center hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </Link>
                  
                  {item.requires_payment && isConnected && (
                    <Link
                      to={`/content/${item.id}`}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors text-sm"
                    >
                      💳 Buy Now
                    </Link>
                  )}
                </div>
              </div>

              {item.requires_payment && (
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Base Network
                    </span>
                    <span className="mx-2">•</span>
                    <span>{item.paid_views} purchases</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentMarketplace;