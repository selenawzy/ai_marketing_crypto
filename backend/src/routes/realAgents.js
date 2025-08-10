const express = require('express');
const { protect } = require('../middleware/auth');
const realAgentService = require('../services/realAgentService');

const router = express.Router();

// @route   POST /api/real-agents/deploy
// @desc    Deploy a real AI agent with smart contract
// @access  Private
router.post('/deploy', protect, async (req, res) => {
  try {
    console.log('🚀 Real agent deployment request from user:', req.user.id);
    
    const agentConfig = {
      name: req.body.name || 'Real AI Marketing Agent',
      description: req.body.description || 'Autonomous AI agent with blockchain capabilities',
      capabilities: req.body.capabilities || []
    };
    
    const result = await realAgentService.deployRealAgent(req.user.id, agentConfig);
    
    res.json({
      success: true,
      message: 'Real AI agent deployed successfully!',
      data: result
    });
    
  } catch (error) {
    console.error('Real agent deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy real AI agent',
      error: error.message
    });
  }
});

// @route   POST /api/real-agents/:id/campaign
// @desc    Create a campaign using real agent
// @access  Private
router.post('/:id/campaign', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const campaignData = {
      clientAddress: req.body.clientAddress || req.user.wallet_address,
      campaignType: req.body.campaignType,
      budget: req.body.budget
    };
    
    const result = await realAgentService.createCampaign(parseInt(id), campaignData);
    
    res.json({
      success: true,
      message: 'Campaign created successfully!',
      data: result
    });
    
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
});

// @route   POST /api/real-agents/:id/execute/:campaignId
// @desc    Execute autonomous campaign
// @access  Private
router.post('/:id/execute/:campaignId', protect, async (req, res) => {
  try {
    const { id, campaignId } = req.params;
    
    const result = await realAgentService.executeAutonomousCampaign(
      parseInt(id), 
      parseInt(campaignId)
    );
    
    res.json({
      success: true,
      message: 'Campaign executed autonomously!',
      data: result
    });
    
  } catch (error) {
    console.error('Campaign execution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute campaign',
      error: error.message
    });
  }
});

// @route   GET /api/real-agents/:id/analytics
// @desc    Get real agent analytics
// @access  Private
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const analytics = await realAgentService.getAgentAnalytics(parseInt(id));
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

// @route   POST /api/real-agents/:id/decision
// @desc    Make autonomous decision
// @access  Private
router.post('/:id/decision', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const marketData = req.body.marketData || {};
    
    const decision = await realAgentService.makeAutonomousDecision(
      parseInt(id), 
      marketData
    );
    
    res.json({
      success: true,
      message: 'Autonomous decision made!',
      data: decision
    });
    
  } catch (error) {
    console.error('Decision making error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make decision',
      error: error.message
    });
  }
});

// @route   GET /api/real-agents/
// @desc    Get all real agents for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const agents = await realAgentService.getUserAgents(req.user.id);
    
    res.json({
      success: true,
      data: { agents }
    });
    
  } catch (error) {
    console.error('Get real agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real agents',
      error: error.message
    });
  }
});

// @route   GET /api/real-agents/demo
// @desc    Deploy a demo real agent (public for testing)
// @access  Public
router.get('/demo', async (req, res) => {
  try {
    console.log('🎯 Creating DEMO real AI agent...');
    
    // Create a demo user entry if needed
    const demoUserId = 999;
    
    const agentConfig = {
      name: 'DEMO AI Marketing Agent',
      description: 'Demo autonomous AI agent with real smart contract on Base Sepolia',
      capabilities: [
        'Smart Contract Management',
        'Autonomous Campaigns',
        'Blockchain Transactions',
        'Performance Analytics'
      ]
    };
    
    const result = await realAgentService.deployRealAgent(demoUserId, agentConfig);
    
    res.json({
      success: true,
      message: '🎉 DEMO Real AI agent deployed successfully!',
      data: {
        ...result,
        notice: 'This is a demo agent with real blockchain functionality',
        explorerUrl: `https://sepolia.basescan.org/address/${result.contractAddress}`
      }
    });
    
  } catch (error) {
    console.error('Demo agent deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy demo real agent',
      error: error.message
    });
  }
});

module.exports = router;