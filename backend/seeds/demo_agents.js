exports.seed = async function(knex) {
  console.log('🌱 Creating demo agents...');
  
  // First, let's get a demo user ID
  const demoUser = await knex('users').where('email', 'demo@example.com').first();
  
  if (!demoUser) {
    console.log('⚠️  Demo user not found. Please run demo_users.js seed first.');
    return;
  }

  // Clear existing agents
  await knex('ai_agents').del();
  
  // Insert demo agents
  await knex('ai_agents').insert([
    {
      user_id: demoUser.id,
      agent_name: 'AI Marketing Guru',
      description: 'Autonomous AI agent that optimizes marketing campaigns and manages client funds using blockchain technology. Powered by AgentKit for real-time market analysis and automated trading strategies.',
      wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      capabilities: JSON.stringify([
        'Market Analysis',
        'Campaign Optimization',
        'Automated Trading',
        'Performance Tracking',
        'Risk Management'
      ]),
      cdp_agent_id: 'cdp_agent_001',
      network: 'base-sepolia',
      is_active: true,
      is_deployed: true,
      deployment_status: 'active',
      deployment_config: JSON.stringify({
        agent_type: 'marketing-optimizer',
        pricing_model: 'per_call',
        price_per_call: 0.15,
        source: 'Coinbase AgentKit',
        version: '1.0.0'
      }),
      balance: 0.5,
      total_transactions: 156,
      total_volume: 23.4,
      deployed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: demoUser.id,
      agent_name: 'Crypto Trading Bot',
      description: 'Advanced AI trading bot that analyzes market patterns and executes trades automatically. Built with real-time data feeds and machine learning algorithms for optimal performance.',
      wallet_address: '0x8ba1f109551bD432803012645Hac136c772c3c2b',
      capabilities: JSON.stringify([
        'Technical Analysis',
        'Pattern Recognition',
        'Risk Assessment',
        'Portfolio Management',
        'Real-time Alerts'
      ]),
      cdp_agent_id: 'cdp_agent_002',
      network: 'base-sepolia',
      is_active: true,
      is_deployed: true,
      deployment_status: 'active',
      deployment_config: JSON.stringify({
        agent_type: 'trading-bot',
        pricing_model: 'subscription',
        price_per_month: 29.99,
        source: 'Coinbase AgentKit',
        version: '1.0.0'
      }),
      balance: 1.2,
      total_transactions: 89,
      total_volume: 12.8,
      deployed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: demoUser.id,
      agent_name: 'Content Creator Assistant',
      description: 'AI-powered content creation and optimization tool that helps creators produce engaging content and maximize their reach. Integrates with social media platforms and analytics tools.',
      wallet_address: '0x9cA8FEC2cF2E7f6c5A3f8B1a2E3d4C5b6A7f8E9d',
      capabilities: JSON.stringify([
        'Content Generation',
        'SEO Optimization',
        'Social Media Management',
        'Analytics Reporting',
        'Trend Analysis'
      ]),
      cdp_agent_id: 'cdp_agent_003',
      network: 'base-sepolia',
      is_active: true,
      is_deployed: true,
      deployment_status: 'active',
      deployment_config: JSON.stringify({
        agent_type: 'content-creator',
        pricing_model: 'performance',
        price_per_call: 0.25,
        source: 'Coinbase AgentKit',
        version: '1.0.0'
      }),
      balance: 0.8,
      total_transactions: 234,
      total_volume: 45.6,
      deployed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('✅ Demo agents created successfully');
  console.log('🤖 Created 3 demo agents:');
  console.log('   1. AI Marketing Guru (ID: 1)');
  console.log('   2. Crypto Trading Bot (ID: 2)');
  console.log('   3. Content Creator Assistant (ID: 3)');
}; 