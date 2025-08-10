const express = require('express');
const { protect } = require('../middleware/auth');
const CDPAgentKitService = require('../services/cdpAgentKit');
const CuratorTraderAgent = require('../agents/CuratorTraderAgent');
const { db } = require('../config/database');

const router = express.Router();
const cdpService = new CDPAgentKitService();

// Store active curator agents
const activeCurators = new Map();

// @route   POST /api/curator-agent/deploy
// @desc    Deploy the AI Content Curator & Trader Agent
// @access  Private
router.post('/deploy', protect, async (req, res) => {
  try {
    console.log('🚀 Deploying AI Content Curator & Trader Agent...');
    
    // Initialize CDP service
    await cdpService.initialize();
    
    // Create a new agent wallet
    const agentName = `Curator-Trader-${Date.now()}`;
    const walletResult = await cdpService.createAgentWallet(agentName);
    
    if (!walletResult.success) {
      throw new Error('Failed to create agent wallet');
    }
    
    // Store agent in database
    const agentData = {
      user_id: req.user.id,
      agent_name: agentName,
      description: 'AI Content Curator & Trader - Autonomously discovers valuable content, manages crypto portfolio, and executes DeFi trades',
      wallet_address: walletResult.agent.address,
      capabilities: JSON.stringify([
        'content-curation', 
        'autonomous-trading', 
        'defi-interaction', 
        'market-analysis', 
        'portfolio-management',
        'revenue-optimization'
      ]),
      network: walletResult.agent.network,
      balance: walletResult.agent.balance,
      is_active: true,
      deployment_status: 'active',
      created_at: new Date()
    };
    
    const [agentId] = await db('ai_agents').insert(agentData);
    
    // Create and initialize the curator agent
    const curatorAgent = new CuratorTraderAgent({
      agentId: agentId,
      name: agentName,
      wallet: {
        address: walletResult.agent.address,
        privateKey: walletResult.agent.privateKey
      }
    });
    
    // Initialize the agent (this starts autonomous operations)
    const initResult = await curatorAgent.initialize();
    
    // Store the active agent instance
    activeCurators.set(agentId, curatorAgent);
    
    // Log deployment
    console.log(`✅ Curator Agent deployed successfully!`);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   Wallet: ${walletResult.agent.address}`);
    console.log(`   Network: ${walletResult.agent.network}`);
    
    res.json({
      success: true,
      message: 'AI Content Curator & Trader Agent deployed successfully',
      data: {
        agentId: agentId,
        name: agentName,
        wallet: {
          address: walletResult.agent.address,
          network: walletResult.agent.network,
          balance: walletResult.agent.balance
        },
        capabilities: agentData.capabilities,
        status: 'active',
        initResult: initResult
      }
    });
    
  } catch (error) {
    console.error('❌ Curator agent deployment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy curator agent',
      error: error.message
    });
  }
});

// @route   GET /api/curator-agent/:id/status
// @desc    Get detailed status of curator agent
// @access  Private
router.get('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Curator agent not found'
      });
    }
    
    // Get active agent instance
    const curatorAgent = activeCurators.get(parseInt(id));
    
    if (!curatorAgent) {
      return res.status(404).json({
        success: false,
        message: 'Curator agent is not active'
      });
    }
    
    // Get detailed agent status
    const agentStatus = await curatorAgent.getAgentStatus();
    
    // Get recent transactions
    const recentTransactions = await db('agent_transactions')
      .where('agent_id', id)
      .orderBy('created_at', 'desc')
      .limit(10);
    
    // Get purchased content
    const purchasedContent = await db('agent_transactions')
      .join('access_logs', function() {
        this.on('access_logs.agent_id', '=', 'agent_transactions.agent_id')
            .andOn('access_logs.access_details->>"$.transaction_hash"', '=', 'agent_transactions.transaction_hash');
      })
      .join('content', 'access_logs.content_id', 'content.id')
      .select(
        'content.title',
        'content.category',
        'content.price_per_access',
        'content.view_count',
        'content.average_rating',
        'agent_transactions.created_at as purchase_date'
      )
      .where('agent_transactions.agent_id', id)
      .where('agent_transactions.transaction_data', 'like', '%"type":"content_purchase"%')
      .orderBy('agent_transactions.created_at', 'desc')
      .limit(5);
    
    res.json({
      success: true,
      data: {
        agent: agentStatus,
        recentTransactions,
        purchasedContent,
        realTimeMetrics: {
          totalContentPurchased: purchasedContent.length,
          totalSpent: recentTransactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0),
          averageContentRating: purchasedContent.length > 0 
            ? purchasedContent.reduce((sum, c) => sum + c.average_rating, 0) / purchasedContent.length 
            : 0,
          lastActivity: recentTransactions[0]?.created_at || null
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Get curator agent status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get curator agent status'
    });
  }
});

// @route   POST /api/curator-agent/:id/fund
// @desc    Fund the curator agent wallet
// @access  Private
router.post('/:id/fund', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Curator agent not found'
      });
    }
    
    // This is a demo funding mechanism
    // In production, this would involve actual ETH transfer
    console.log(`💰 Funding agent ${agent.agent_name} with ${amount} ETH`);
    
    // Update agent balance in database
    await db('ai_agents')
      .where('id', id)
      .increment('balance', parseFloat(amount));
    
    // Log the funding transaction
    await db('agent_transactions').insert({
      agent_id: id,
      transaction_hash: `funding_${Date.now()}`,
      target_address: agent.wallet_address,
      amount: amount,
      currency: 'ETH',
      status: 'completed',
      transaction_data: JSON.stringify({
        type: 'funding',
        source: 'user_deposit',
        note: 'Agent wallet funding'
      }),
      created_at: new Date()
    });
    
    res.json({
      success: true,
      message: `Successfully funded agent with ${amount} ETH`,
      data: {
        agentId: id,
        amount: amount,
        newBalance: parseFloat(agent.balance) + parseFloat(amount)
      }
    });
    
  } catch (error) {
    console.error('❌ Fund curator agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund curator agent'
    });
  }
});

// @route   POST /api/curator-agent/:id/pause
// @desc    Pause/resume curator agent operations
// @access  Private
router.post('/:id/pause', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'pause' or 'resume'
    
    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .first();
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Curator agent not found'
      });
    }
    
    // Get active agent instance
    const curatorAgent = activeCurators.get(parseInt(id));
    
    if (!curatorAgent) {
      return res.status(404).json({
        success: false,
        message: 'Curator agent is not active'
      });
    }
    
    if (action === 'pause') {
      curatorAgent.isActive = false;
      await db('ai_agents')
        .where('id', id)
        .update({ deployment_status: 'paused' });
      
      console.log(`⏸️ Curator agent ${agent.agent_name} paused`);
    } else if (action === 'resume') {
      curatorAgent.isActive = true;
      await db('ai_agents')
        .where('id', id)
        .update({ deployment_status: 'active' });
      
      console.log(`▶️ Curator agent ${agent.agent_name} resumed`);
    }
    
    res.json({
      success: true,
      message: `Curator agent ${action}d successfully`,
      data: {
        agentId: id,
        status: action === 'pause' ? 'paused' : 'active'
      }
    });
    
  } catch (error) {
    console.error('❌ Pause/resume curator agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause/resume curator agent'
    });
  }
});

// @route   GET /api/curator-agent/demo
// @desc    Get demo information about the curator agent
// @access  Public
router.get('/demo', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        name: 'AI Content Curator & Trader',
        description: 'An advanced AI agent that showcases the full power of Coinbase CDP Agent Kit',
        capabilities: [
          {
            name: 'Autonomous Content Curation',
            description: 'Discovers and purchases high-value content based on AI-powered analysis',
            features: [
              'Quality scoring algorithm',
              'Trend analysis',
              'Price efficiency optimization',
              'Category preference learning'
            ]
          },
          {
            name: 'Portfolio Management',
            description: 'Manages its own crypto portfolio with advanced trading strategies',
            features: [
              'Risk-adjusted position sizing',
              'Automated rebalancing',
              'Stop-loss and take-profit orders',
              'Performance tracking'
            ]
          },
          {
            name: 'DeFi Integration',
            description: 'Interacts with DeFi protocols to maximize yield',
            features: [
              'Liquidity provision',
              'Yield farming',
              'Cross-protocol arbitrage',
              'Gas optimization'
            ]
          },
          {
            name: 'Market Analysis',
            description: 'Provides real-time market insights and predictions',
            features: [
              'Content market trends',
              'DeFi yield analysis',
              'Risk assessment',
              'Opportunity identification'
            ]
          },
          {
            name: 'Revenue Optimization',
            description: 'Continuously optimizes strategies for maximum ROI',
            features: [
              'Performance analytics',
              'Strategy adjustment',
              'Cost analysis',
              'Profit maximization'
            ]
          }
        ],
        technicalDetails: {
          blockchain: 'Base Sepolia',
          protocols: ['Uniswap', 'Compound', 'Yearn'],
          updateFrequency: {
            contentCuration: '30 minutes',
            portfolioManagement: '15 minutes',
            marketAnalysis: '5 minutes',
            revenueOptimization: '1 hour'
          },
          riskManagement: {
            maxSpendPerContent: '0.01 ETH',
            maxPositionSize: '10% of portfolio',
            stopLoss: '5%',
            takeProfit: '15%'
          }
        },
        demoMetrics: {
          averageROI: '15-25%',
          successRate: '87%',
          contentAccuracy: '92%',
          uptime: '99.8%'
        }
      }
    });
  } catch (error) {
    console.error('❌ Get demo info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get demo information'
    });
  }
});

module.exports = router;