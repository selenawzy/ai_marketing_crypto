const express = require('express');
const Joi = require('joi');
const { protect } = require('../middleware/auth');
const CDPAgentKitService = require('../services/cdpAgentKit');
const { db } = require('../config/database');

const router = express.Router();

// Initialize CDP AgentKit service
const cdpAgentKit = new CDPAgentKitService();

// Validation schemas
const createAgentSchema = Joi.object({
  title: Joi.string().min(2).max(50).required(),
  name: Joi.string().min(2).max(50).optional(), // For backward compatibility
  description: Joi.string().max(500).allow('').optional(), // Allow empty strings
  capabilities: Joi.string().max(1000).allow('').optional(), // Allow empty strings
  agentType: Joi.string().optional(),
  pricingModel: Joi.string().optional(),
  pricePerCall: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  pricePerMonth: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  performanceThreshold: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  stakeRequired: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  smartContractFeatures: Joi.object().optional(),
  nftMetadata: Joi.object().optional(),
  trainingData: Joi.string().allow('').optional(), // Allow empty strings
  creator_wallet: Joi.string().optional(),
  mint_as_nft: Joi.boolean().optional(),
  smart_contract_address: Joi.string().allow(null).optional(),
  blockchain_network: Joi.string().optional(),
  mnemonic: Joi.string().optional()
});

const executeTransactionSchema = Joi.object({
  target: Joi.string().required(),
  data: Joi.string().optional(),
  value: Joi.string().optional(),
  gasLimit: Joi.string().optional()
});

// @route   POST /api/agents/create
// @desc    Create a new AI agent with CDP wallet
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    console.log('🔍 Agent create request body:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = createAgentSchema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details[0].message);
      console.log('❌ Received data:', req.body);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Initialize CDP AgentKit if not already done
    await cdpAgentKit.initialize();

    // Use title or name for agent name and make it unique
    const baseAgentName = value.title || value.name;
    const timestamp = Date.now();
    const agentName = `${baseAgentName}-${timestamp}`;
    
    // Create agent wallet through CDP
    const agentResult = await cdpAgentKit.createAgentWallet(
      agentName, 
      value.mnemonic
    );

    if (!agentResult.success) {
      throw new Error('Failed to create agent wallet');
    }

    // Parse capabilities if it's a string
    let capabilitiesArray = ['content-access', 'payment-processing'];
    if (value.capabilities && value.capabilities.trim() !== '') {
      if (typeof value.capabilities === 'string') {
        // Try to parse as JSON first, if that fails, split by comma
        try {
          capabilitiesArray = JSON.parse(value.capabilities);
        } catch (e) {
          // Split by comma and filter out empty values
          capabilitiesArray = value.capabilities.split(',')
            .map(cap => cap.trim())
            .filter(cap => cap.length > 0);
          
          // If no valid capabilities, use defaults
          if (capabilitiesArray.length === 0) {
            capabilitiesArray = ['content-access', 'payment-processing'];
          }
        }
      } else if (Array.isArray(value.capabilities)) {
        capabilitiesArray = value.capabilities;
      }
    }
    
    // Add agent type-specific capabilities
    if (value.agentType) {
      switch (value.agentType) {
        case 'content':
          capabilitiesArray.push('content-generation', 'content-analysis');
          break;
        case 'analysis':
          capabilitiesArray.push('data-analysis', 'reporting');
          break;
        case 'optimization':
          capabilitiesArray.push('performance-optimization', 'efficiency-analysis');
          break;
        case 'automation':
          capabilitiesArray.push('task-automation', 'workflow-management');
          break;
      }
      // Remove duplicates
      capabilitiesArray = [...new Set(capabilitiesArray)];
    }

    // Store agent information in database
    const agentData = {
      user_id: req.user.id,
      agent_name: agentName, // Use agent_name field to match existing schema
      description: value.description,
      wallet_address: agentResult.agent.address,
      network: agentResult.agent.network,
      capabilities: JSON.stringify(capabilitiesArray),
      balance: agentResult.agent.balance,
      is_active: true,
      created_at: new Date()
    };

    const [agentId] = await db('ai_agents').insert(agentData);

    // Try to register with CDP (optional - may not work with fake credentials)
    try {
      if (!agentResult.agent.isFake) {
        await cdpAgentKit.registerAgentWithCDP({
          ...agentResult.agent,
          capabilities: value.capabilities
        });
      }
    } catch (cdpError) {
      console.log('CDP registration failed (expected with test credentials):', cdpError.message);
    }

    res.json({
      success: true,
      data: {
        agentId,
        name: agentName,
        walletAddress: agentResult.agent.address,
        network: agentResult.agent.network,
        balance: agentResult.agent.balance,
        capabilities: capabilitiesArray,
        isFake: agentResult.agent.isFake || false
      }
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create AI agent'
    });
  }
});

// @route   GET /api/agents
// @desc    Get all user's AI agents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const agents = await db('ai_agents')
      .where('user_id', req.user.id)
      .where('is_active', true)
      .select('*');

    // Get current balances for each agent and fix BigInt serialization
    const agentsWithBalances = await Promise.all(
      agents.map(async (agent) => {
        try {
          const networkInfo = await cdpAgentKit.getNetworkInfo();
          
          // Convert BigInt values to strings for JSON serialization
          const serializedAgent = JSON.parse(JSON.stringify(agent, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          ));
          
          return {
            ...serializedAgent,
            capabilities: JSON.parse(agent.capabilities || '[]'),
            currentBalance: agent.balance,
            networkInfo
          };
        } catch (error) {
          // Convert BigInt values to strings for JSON serialization
          const serializedAgent = JSON.parse(JSON.stringify(agent, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          ));
          
          return {
            ...serializedAgent,
            capabilities: JSON.parse(agent.capabilities || '[]'),
            currentBalance: agent.balance,
            error: 'Could not fetch current balance'
          };
        }
      })
    );

    res.json({
      success: true,
      data: { agents: agentsWithBalances }
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agents'
    });
  }
});

// @route   GET /api/agents/:id
// @desc    Get specific agent details
// @access  Public (temporarily for demo)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await db('ai_agents')
      .where('id', id)
      .where('is_active', true)
      .first();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent status from CDP
    try {
      let cdpStatus = null;
      if (!agent.wallet_address.includes('fake')) {
        cdpStatus = await cdpAgentKit.getAgentStatus(id);
      }

      const networkInfo = await cdpAgentKit.getNetworkInfo();
      
      // Convert BigInt values to strings for JSON serialization
      const serializedAgent = JSON.parse(JSON.stringify(agent, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      res.json({
        success: true,
        data: {
          agent: {
            ...serializedAgent,
            capabilities: JSON.parse(agent.capabilities || '[]'),
            cdpStatus,
            networkInfo
          }
        }
      });

    } catch (error) {
      // Convert BigInt values to strings for JSON serialization
      const serializedAgent = JSON.parse(JSON.stringify(agent, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      // Return agent data without CDP status if it fails
      res.json({
        success: true,
        data: {
          agent: {
            ...serializedAgent,
            capabilities: JSON.parse(agent.capabilities || '[]'),
            cdpError: 'Could not fetch CDP status'
          }
        }
      });
    }

  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agent'
    });
  }
});

// @route   POST /api/agents/:id/execute-transaction
// @desc    Execute onchain transaction through agent
// @access  Private
router.post('/:id/execute-transaction', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = executeTransactionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .where('is_active', true)
      .first();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Validate transaction
    const validation = await cdpAgentKit.validateTransaction({
      ...value,
      from: agent.wallet_address
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Execute transaction through CDP
    const txResult = await cdpAgentKit.executeOnchainTransaction(id, value);

    // Log transaction
    await db('agent_transactions').insert({
      agent_id: id,
      transaction_hash: txResult.transaction_hash || 'pending',
      target_address: value.target,
      amount: value.value || '0',
      status: 'pending',
      created_at: new Date()
    });

    res.json({
      success: true,
      data: {
        transactionHash: txResult.transaction_hash,
        status: 'pending',
        gasUsed: txResult.gas_used,
        blockExplorerUrl: `https://sepolia.basescan.org/tx/${txResult.transaction_hash}`
      }
    });

  } catch (error) {
    console.error('Execute transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute transaction'
    });
  }
});

// @route   POST /api/agents/:id/deploy
// @desc    Deploy agent to production
// @access  Private
router.post('/:id/deploy', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { environment = 'testnet', configuration = {} } = req.body;

    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .where('is_active', true)
      .first();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Deploy through CDP
    const deploymentResult = await cdpAgentKit.deployAgent(id, {
      environment,
      ...configuration
    });

    // Update agent status
    await db('ai_agents')
      .where('id', id)
      .update({
        deployment_status: 'deployed',
        deployment_environment: environment,
        updated_at: new Date()
      });

    res.json({
      success: true,
      data: {
        deploymentId: deploymentResult.deployment_id,
        status: 'deployed',
        environment,
        endpoints: deploymentResult.endpoints
      }
    });

  } catch (error) {
    console.error('Deploy agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy agent'
    });
  }
});

// @route   GET /api/agents/:id/performance
// @desc    Get agent performance metrics
// @access  Private
router.get('/:id/performance', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;

    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .where('is_active', true)
      .first();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get performance metrics from CDP
    const metrics = await cdpAgentKit.monitorAgentPerformance(id, period);

    // Get local transaction statistics
    const transactionStats = await db('agent_transactions')
      .where('agent_id', id)
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as successful_transactions'),
        db.raw('SUM(CAST(amount as DECIMAL(18,8))) as total_volume')
      )
      .first();

    res.json({
      success: true,
      data: {
        metrics: metrics || {},
        localStats: transactionStats,
        period
      }
    });

  } catch (error) {
    console.error('Get agent performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agent performance'
    });
  }
});

// @route   GET /api/agents/network-info
// @desc    Get Base network information
// @access  Public
router.get('/network-info', async (req, res) => {
  try {
    const networkInfo = await cdpAgentKit.getNetworkInfo();
    const gasRecommendations = await cdpAgentKit.getGasRecommendations();

    res.json({
      success: true,
      data: {
        network: networkInfo,
        gas: gasRecommendations
      }
    });

  } catch (error) {
    console.error('Get network info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network information'
    });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Deactivate an AI agent
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify agent ownership
    const agent = await db('ai_agents')
      .where('id', id)
      .where('user_id', req.user.id)
      .where('is_active', true)
      .first();

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Deactivate agent (don't delete, just mark as inactive)
    await db('ai_agents')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: new Date()
      });

    res.json({
      success: true,
      message: 'Agent deactivated successfully'
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate agent'
    });
  }
});

module.exports = router;