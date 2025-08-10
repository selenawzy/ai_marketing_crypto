import React, { useState } from 'react';
import axios from '../api/axiosConfig';

const TestOnramp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testSessionToken = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🧪 Testing session token API...');
      
      const response = await axios.post('/api/onramp/session-token', {
        walletAddress: '0x1234567890123456789012345678901234567890'
      });

      console.log('✅ API Response:', response.data);
      setResult(JSON.stringify(response.data, null, 2));
      
    } catch (err: any) {
      console.error('❌ API Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test Onramp API</h3>
      
      <button
        onClick={testSessionToken}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Session Token API'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success:</strong>
          <pre className="mt-2 text-sm overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TestOnramp; 