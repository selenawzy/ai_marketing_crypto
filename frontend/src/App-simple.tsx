import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Agent Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Monetize your content with AI agents on the blockchain
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Get Started
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;