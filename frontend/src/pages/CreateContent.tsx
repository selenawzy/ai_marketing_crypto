import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface ContentFormData {
  title: string;
  description: string;
  contentType: 'article' | 'video' | 'image' | 'data' | 'course';
  price: string;
  requiresPayment: boolean;
  content: string;
  tags: string;
}

const CreateContent: React.FC = () => {
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    contentType: 'article',
    price: '5.00',
    requiresPayment: true,
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isAuthenticated) {
      setError('Please log in to create content');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/content', {
        title: formData.title,
        description: formData.description,
        url: `content://internal/${Date.now()}`, // Temporary URL for demo
        content_type: formData.contentType,
        price_per_access: parseFloat(formData.price),
        requires_payment: formData.requiresPayment,
        metadata: {
          content_body: formData.content,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }
      });

      if (response.data.success) {
        navigate(`/content/${response.data.data.content.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const contentTypes = [
    { value: 'article', label: '📄 Article', desc: 'Written content, guides, tutorials' },
    { value: 'video', label: '🎥 Video', desc: 'Video content, courses, demos' },
    { value: 'image', label: '🖼️ Image', desc: 'Graphics, art, infographics' },
    { value: 'data', label: '📊 Dataset', desc: 'Data files, spreadsheets, APIs' },
    { value: 'course', label: '🎓 Course', desc: 'Multi-part learning content' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Premium Content</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your knowledge and get paid in crypto. Every piece of content can generate revenue through Coinbase Pay.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="text-3xl mr-3">🚀</div>
                  <h2 className="text-2xl font-bold text-gray-900">Content Details</h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Title *
                    </label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="Enter an engaging title for your content"
                      required
                    />
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Content Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contentTypes.map(type => (
                        <label key={type.value} className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.contentType === type.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="contentType"
                            value={type.value}
                            checked={formData.contentType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                      placeholder="Describe what users will get from your content..."
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Body *
                    </label>
                    <textarea 
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
                      placeholder="Enter your premium content here..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This content will only be accessible after payment via Coinbase Pay
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input 
                      type="text" 
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="ai, crypto, tutorial, premium (comma separated)"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">💰 Monetization Settings</h3>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        name="requiresPayment"
                        checked={formData.requiresPayment}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">
                        Require payment to access this content
                      </label>
                    </div>

                    {formData.requiresPayment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price in USDC *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input 
                            type="number" 
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                            placeholder="5.00"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">USDC</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Payments processed via Coinbase Pay on Base network
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setPreview(!preview)}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      {preview ? 'Hide Preview' : 'Preview'}
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </div>
                      ) : (
                        'Publish Content'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">💡 Content Tips</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Write engaging titles that clearly describe the value
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Price competitively - start with $1-10 USDC
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Include relevant tags for discoverability
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    High-quality content gets more sales
                  </li>
                </ul>
              </div>

              {/* Coinbase Pay Info */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
                <h3 className="font-semibold mb-3">⚡ Powered by Coinbase Pay</h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>✓ Instant USDC payments</li>
                  <li>✓ No gas fees on Base network</li>
                  <li>✓ Global reach with card/bank payments</li>
                  <li>✓ Automatic revenue distribution</li>
                </ul>
              </div>

              {/* Preview */}
              {preview && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">📄 Preview</h3>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {formData.contentType === 'article' && '📄'}
                        {formData.contentType === 'video' && '🎥'}
                        {formData.contentType === 'image' && '🖼️'}
                        {formData.contentType === 'data' && '📊'}
                        {formData.contentType === 'course' && '🎓'}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                        {formData.contentType}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{formData.title || 'Content Title'}</h4>
                    <p className="text-sm text-gray-600">{formData.description || 'Description will appear here...'}</p>
                    {formData.requiresPayment && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          ${formData.price || '0.00'} USDC
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;