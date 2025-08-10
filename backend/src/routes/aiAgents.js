const express = require('express');
const Joi = require('joi');
const { db } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const CDPAgentKitService = require('../services/cdpAgentKit');

const router = express.Router();
const cdpService = new CDPAgentKitService();

// Validation schemas
const registerAgentSchema = Joi.object({
    agent_name: Joi.string().required().min(3).max(50),
    description: Joi.string().optional().max(500),
    capabilities: Joi.array().items(Joi.string()).default(['content-access', 'payment-processing']),
    mnemonic_phrase: Joi.string().optional(),
    deployment_config: Joi.object().optional()
});

const executeTransactionSchema = Joi.object({
    target_address: Joi.string().required(),
    data: Joi.string().required(),
    value: Joi.string().default('0'),
    gas_limit: Joi.string().default('300000'),
    agent_id: Joi.string().required()
});

// @route   POST /api/ai-agents/register
// @desc    Register a new AI agent with CDP AgentKit
// @access  Private
router.post('/register', protect, async (req, res) => {
    try {
        const { error, value } = registerAgentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { agent_name, description, capabilities, mnemonic_phrase, deployment_config } = value;

        // Initialize CDP AgentKit
        await cdpService.initialize();

        // Create agent wallet
        const walletResult = await cdpService.createAgentWallet(agent_name, mnemonic_phrase);
        
        if (!walletResult.success) {
            throw new Error('Failed to create agent wallet');
        }

        const agentData = {
            ...walletResult.agent,
            description,
            capabilities,
            user_id: req.user.id
        };

        // Register agent with CDP
        const cdpRegistration = await cdpService.registerAgentWithCDP(agentData);

        // Store agent in database
        const [agentId] = await db('ai_agents').insert({
            user_id: req.user.id,
            agent_name,
            description,
            wallet_address: agentData.address,
            capabilities: JSON.stringify(capabilities),
            cdp_agent_id: cdpRegistration.agent_id,
            network: cdpService.networkId,
            is_active: true,
            deployment_config: JSON.stringify(deployment_config || {}),
            created_at: new Date()
        });

        const agent = await db('ai_agents')
            .where('id', agentId)
            .first();

        res.status(201).json({
            success: true,
            message: 'AI agent registered successfully',
            data: {
                agent,
                wallet: {
                    address: agentData.address,
                    network: agentData.network
                },
                cdp_registration: cdpRegistration
            }
        });
    } catch (error) {
        console.error('Agent registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register AI agent'
        });
    }
});

// @route   GET /api/ai-agents
// @desc    Get all AI agents
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, network, is_active } = req.query;
        const offset = (page - 1) * limit;

        let query = db('ai_agents')
            .leftJoin('users', 'ai_agents.user_id', 'users.id')
            .select(
                'ai_agents.*',
                'users.username as owner_username'
            );

        // Apply filters
        if (network) {
            query = query.where('ai_agents.network', network);
        }
        if (is_active !== undefined) {
            query = query.where('ai_agents.is_active', is_active === 'true');
        }

        const total = await query.clone().count('* as count').first();
        const agents = await query
            .orderBy('ai_agents.created_at', 'desc')
            .limit(limit)
            .offset(offset);

        // Fix BigInt serialization
        const serializedAgents = agents.map(agent => 
            JSON.parse(JSON.stringify(agent, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ))
        );

        res.json({
            success: true,
            data: {
                agents: serializedAgents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(total.count),
                    pages: Math.ceil(total.count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/ai-agents/:id
// @desc    Get specific AI agent
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await db('ai_agents')
            .join('users', 'ai_agents.user_id', 'users.id')
            .select(
                'ai_agents.*',
                'users.username as owner_username'
            )
            .where('ai_agents.id', id)
            .first();

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'AI agent not found'
            });
        }

        // Get agent status from CDP
        let cdpStatus = null;
        try {
            cdpStatus = await cdpService.getAgentStatus(agent.cdp_agent_id);
        } catch (error) {
            console.warn('Failed to get CDP status:', error);
        }

        res.json({
            success: true,
            data: {
                agent,
                cdp_status: cdpStatus
            }
        });
    } catch (error) {
        console.error('Get agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/ai-agents/:id/execute
// @desc    Execute onchain transaction through AI agent
// @access  Private
router.post('/:id/execute', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = executeTransactionSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Get agent
        const agent = await db('ai_agents')
            .where('id', id)
            .first();

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'AI agent not found'
            });
        }

        // Check if user owns the agent
        if (agent.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to execute transactions for this agent'
            });
        }

        // Validate transaction
        const validation = await cdpService.validateTransaction({
            from: agent.wallet_address,
            target: value.target_address,
            data: value.data,
            value: value.value
        });

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: `Transaction validation failed: ${validation.error}`
            });
        }

        // Execute transaction through CDP
        const result = await cdpService.executeOnchainTransaction(agent.cdp_agent_id, {
            target: value.target_address,
            data: value.data,
            value: value.value,
            gasLimit: value.gas_limit
        });

        // Log transaction
        await db('transactions').insert({
            transaction_hash: result.transaction_hash,
            from_user_id: req.user.id,
            to_user_id: null,
            content_id: null,
            amount: value.value,
            currency: 'ETH',
            status: 'pending',
            transaction_data: JSON.stringify({
                agent_id: agent.id,
                target_address: value.target_address,
                gas_limit: value.gas_limit
            }),
            created_at: new Date()
        });

        res.json({
            success: true,
            message: 'Transaction executed successfully',
            data: {
                transaction_hash: result.transaction_hash,
                status: result.status,
                gas_used: result.gas_used
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

// @route   GET /api/ai-agents/:id/status
// @desc    Get AI agent status and metrics
// @access  Private
router.get('/:id/status', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { period = '24h' } = req.query;

        const agent = await db('ai_agents')
            .where('id', id)
            .first();

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'AI agent not found'
            });
        }

        // Check authorization
        if (agent.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this agent status'
            });
        }

        // Get CDP status and metrics
        const [cdpStatus, cdpMetrics] = await Promise.all([
            cdpService.getAgentStatus(agent.cdp_agent_id),
            cdpService.monitorAgentPerformance(agent.cdp_agent_id, period)
        ]);

        // Get transaction history
        const transactions = await db('transactions')
            .where('transaction_data', 'like', `%"agent_id":${agent.id}%`)
            .orderBy('created_at', 'desc')
            .limit(10);

        res.json({
            success: true,
            data: {
                agent,
                cdp_status: cdpStatus,
                metrics: cdpMetrics,
                recent_transactions: transactions
            }
        });
    } catch (error) {
        console.error('Get agent status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get agent status'
        });
    }
});

// @route   POST /api/ai-agents/:id/deploy
// @desc    Deploy AI agent to production
// @access  Private
router.post('/:id/deploy', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { deployment_config } = req.body;

        const agent = await db('ai_agents')
            .where('id', id)
            .first();

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'AI agent not found'
            });
        }

        // Check authorization
        if (agent.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to deploy this agent'
            });
        }

        // Deploy agent through CDP
        const deployment = await cdpService.deployAgent(agent.cdp_agent_id, deployment_config);

        // Update agent status
        await db('ai_agents')
            .where('id', id)
            .update({
                is_deployed: true,
                deployment_status: 'active',
                deployment_config: JSON.stringify(deployment_config),
                deployed_at: new Date()
            });

        res.json({
            success: true,
            message: 'AI agent deployed successfully',
            data: {
                deployment,
                agent_id: agent.id
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

// @route   PUT /api/ai-agents/:id
// @desc    Update AI agent
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { agent_name, description, capabilities, is_active } = req.body;

        const agent = await db('ai_agents')
            .where('id', id)
            .first();

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'AI agent not found'
            });
        }

        // Check authorization
        if (agent.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this agent'
            });
        }

        const updateData = {};
        if (agent_name) updateData.agent_name = agent_name;
        if (description) updateData.description = description;
        if (capabilities) updateData.capabilities = JSON.stringify(capabilities);
        if (is_active !== undefined) updateData.is_active = is_active;

        await db('ai_agents')
            .where('id', id)
            .update(updateData);

        const updatedAgent = await db('ai_agents')
            .where('id', id)
            .first();

        res.json({
            success: true,
            message: 'AI agent updated successfully',
            data: { agent: updatedAgent }
        });
    } catch (error) {
        console.error('Update agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update agent'
        });
    }
});

// @route   GET /api/ai-agents/network/info
// @desc    Get Base network information
// @access  Public
router.get('/network/info', async (req, res) => {
    try {
        const networkInfo = await cdpService.getNetworkInfo();
        const gasRecommendations = await cdpService.getGasRecommendations();

        res.json({
            success: true,
            data: {
                network: networkInfo,
                gas_recommendations: gasRecommendations
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

module.exports = router; 