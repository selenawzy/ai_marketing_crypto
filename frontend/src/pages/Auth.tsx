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

  const features = [
    { icon: '🎯', title: 'Create Content', description: 'Monetize your articles' },
    { icon: '💰', title: 'Earn Crypto', description: 'Get paid in USDC on Base' },
    { icon: '🔒', title: 'Web3 Powered', description: 'Secure blockchain transactions' }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block group">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </Link>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            <Link to="/" className="hover:from-cyan-500 hover:to-blue-500 transition-all duration-300">
              AI Agent Marketplace
            </Link>
          </h2>
          <p className="text-purple-300">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-cyan-400">Web3 Wallet</h3>
            {isConnected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                Connected
              </span>
            )}
          </div>
          <WalletConnect />
          <p className="text-xs text-purple-300 mt-3">
            {isConnected 
              ? "Your wallet will be linked to your account" 
              : "Connect your wallet for seamless transactions"}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <ErrorNotification 
              error={error} 
              onClose={() => setError(null)} 
              autoClose={true}
              duration={6000}
            />

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-purple-300/50 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-cyan-400 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-purple-300/50 transition-all duration-200"
                  placeholder="Your unique username"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-400 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-purple-300/50 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-400 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-purple-300/50 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
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
          <h3 className="text-lg font-semibold text-cyan-400">Why join us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {features.map((feature, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 hover:border-cyan-500/50 transition-all duration-200">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="font-medium text-cyan-400">{feature.title}</div>
                <div className="text-purple-300">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
};

export default Auth;