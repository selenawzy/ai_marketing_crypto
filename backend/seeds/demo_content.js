exports.seed = async function(knex) {
  // First, let's create a demo user
  await knex('users').del(); // Clear existing users
  await knex('content').del(); // Clear existing content
  
  const [demoUserId] = await knex('users').insert({
    username: 'demo_creator',
    email: 'demo@example.com',
    password_hash: '$2a$10$demo.hash.for.testing.purposes', // Demo hash
    role: 'content_creator',
    is_active: true,
    email_verified: true,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Insert demo content
  await knex('content').insert([
    {
      creator_id: demoUserId,
      title: 'AI Trading Strategies Guide',
      description: 'Comprehensive guide on using AI for crypto trading strategies and market analysis.',
      url: 'content://demo/ai-trading-guide',
      content_type: 'article',
      price_per_access: 5.99,
      requires_payment: true,
      is_active: true,
      total_views: 1247,
      paid_views: 89,
      total_revenue: 534.11,
      metadata: {
        content_body: 'This is a comprehensive guide on AI trading strategies...',
        tags: ['ai', 'trading', 'crypto', 'analysis']
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      creator_id: demoUserId,
      title: 'Free Blockchain Basics',
      description: 'Learn the fundamentals of blockchain technology and how it powers cryptocurrencies.',
      url: 'content://demo/blockchain-basics',
      content_type: 'video',
      price_per_access: 0,
      requires_payment: false,
      is_active: true,
      total_views: 3421,
      paid_views: 0,
      total_revenue: 0,
      metadata: {
        content_body: 'Free educational content about blockchain basics...',
        tags: ['blockchain', 'education', 'free', 'basics']
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      creator_id: demoUserId,
      title: 'DeFi Investment Dataset',
      description: 'Curated dataset of DeFi protocols with performance metrics and risk analysis.',
      url: 'content://demo/defi-dataset',
      content_type: 'data',
      price_per_access: 12.50,
      requires_payment: true,
      is_active: true,
      total_views: 567,
      paid_views: 45,
      total_revenue: 562.50,
      metadata: {
        content_body: 'Comprehensive DeFi dataset with performance metrics...',
        tags: ['defi', 'data', 'investment', 'analysis']
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      creator_id: demoUserId,
      title: 'Coinbase API Integration Tutorial',
      description: 'Step-by-step guide to integrate Coinbase Pay into your applications.',
      url: 'content://demo/coinbase-tutorial',
      content_type: 'article',
      price_per_access: 8.99,
      requires_payment: true,
      is_active: true,
      total_views: 892,
      paid_views: 156,
      total_revenue: 1402.44,
      metadata: {
        content_body: 'Learn how to integrate Coinbase Pay APIs...',
        tags: ['coinbase', 'api', 'tutorial', 'integration']
      },
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};