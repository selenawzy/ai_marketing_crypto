import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import ErrorNotification from '../components/ErrorNotification';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { account, isConnected } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('🔐 Passwords don\'t match! Please make sure both password fields are identical.');
        }
        if (formData.username.length < 3) {
          throw new Error('👤 Username too short! Please choose a username with at least 3 characters.');
        }
        
        await register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          wallet_address: account || undefined,
        });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      let errorMessage = err.message;
      
      // Make common auth errors prettier
      if (errorMessage.includes('Invalid email') || errorMessage.includes('email')) {
        errorMessage = '📧 ' + errorMessage;
      } else if (errorMessage.includes('password')) {
        errorMessage = '🔐 ' + errorMessage;
      } else if (errorMessage.includes('username')) {
        errorMessage = '👤 ' + errorMessage;
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        errorMessage = '🌐 Connection error! ' + errorMessage;
      } else if (!errorMessage.includes('🔐') && !errorMessage.includes('👤')) {
        errorMessage = '🚫 ' + errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 hover:shadow-lg transition-shadow">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              AI Marketing Crypto
            </Link>
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Web3 Wallet</h3>
            {isConnected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>
          <WalletConnect />
          <p className="text-xs text-gray-500 mt-2">
            {isConnected 
              ? "Your wallet will be linked to your account" 
              : "Connect your wallet for seamless transactions"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <ErrorNotification 
              error={error} 
              onClose={() => setError(null)} 
              autoClose={true}
              duration={6000}
            />

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your unique username"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormData({
                    email: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Why join us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium text-gray-900">Create Content</div>
              <div className="text-gray-600">Monetize your articles and data</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium text-gray-900">Earn Crypto</div>
              <div className="text-gray-600">Get paid in USDC on Base</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">🔒</div>
              <div className="font-medium text-gray-900">Web3 Powered</div>
              <div className="text-gray-600">Secure blockchain transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;