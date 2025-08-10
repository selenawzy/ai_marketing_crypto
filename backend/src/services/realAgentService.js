const RealMarketingAgent = require('../agents/RealMarketingAgent');
const { db } = require('../config/database');

class RealAgentService {
  constructor() {
    this.agents = new Map();
  }
  
  /**
   * Deploy a real AI agent with smart contract
   */
  async deployRealAgent(userId, agentConfig) {
    try {
      console.log('🚀 Deploying real AI agent for user:', userId);
      
      // Create agent instance
      const agent = new RealMarketingAgent();
      
      // Initialize agent
      const initResult = await agent.initialize();
      console.log('✅ Agent initialized:', initResult.mode || 'unknown mode');
      
      // Deploy smart contract
      const contractResult = await agent.deploySmartContract();
      console.log('✅ Contract deployed:', contractResult.mode || 'unknown mode');
      
      // Store in database
      const agentData = {
        user_id: userId,
        agent_name: agentConfig.name || 'Real AI Marketing Agent',
        description: agentConfig.description || 'Autonomous AI agent with blockchain capabilities',
        wallet_address: initResult.wallet,
        smart_contract_address: contractResult.contractAddress,
        network: 'base-sepolia',
        capabilities: JSON.stringify(initResult.capabilities),
        is_active: true,
        is_deployed: true,
        deployment_status: contractResult.mode === 'real' ? 'deployed' : 'demo',
        created_at: new Date()
      };
      
      const [agentId] = await db('ai_agents').insert(agentData);
      
      // Store agent instance in memory
      this.agents.set(agentId, agent);
      
      console.log('✅ AI agent deployment completed successfully');
      console.log('📊 Deployment mode:', contractResult.mode || 'unknown');
      
      return {
        success: true,
        agentId,
        walletAddress: initResult.wallet,
        contractAddress: contractResult.contractAddress,
        explorerUrl: contractResult.explorerUrl,
        capabilities: initResult.capabilities,
        mode: contractResult.mode || 'unknown',
        note: contractResult.note || 'Agent deployed successfully',
        message: contractResult.message || 'Deployment completed'
      };
      
    } catch (error) {
      console.error('❌ Real agent deployment failed:', error);
      throw error;
    }
  }
  
  /**
   * Create a marketing campaign using the real agent
   */
  async createCampaign(agentId, campaignData) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error('Agent not found or not active');
      }
      
      const result = await agent.createCampaign(
        campaignData.clientAddress,
        campaignData.campaignType,
        campaignData.budget
      );
      
      // Store campaign in database
      await db('agent_campaigns').insert({
        agent_id: agentId,
        client_address: campaignData.clientAddress,
        campaign_type: campaignData.campaignType,
        budget: campaignData.budget,
        status: 'active',
        transaction_hash: result.transactionHash,
        created_at: new Date()
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Campaign creation failed:', error);
      throw error;
    }
  }
  
  /**
   * Execute autonomous campaign
   */
  async executeAutonomousCampaign(agentId, campaignId) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      const result = await agent.executeCampaign(campaignId);
      
      // Update campaign in database
      await db('agent_campaigns')
        .where('id', campaignId)
        .update({
          performance: result.performance,
          spent: result.spent,
          strategy: result.strategy,
          execution_tx: result.transactionHash,
          updated_at: new Date()
        });
      
      return result;
      
    } catch (error) {
      console.error('❌ Campaign execution failed:', error);
      throw error;
    }
  }
  
  /**
   * Get agent analytics
   */
  async getAgentAnalytics(agentId) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      const blockchainMetrics = await agent.getPerformanceAnalytics();
      
      // Get database metrics
      const dbMetrics = await db('agent_campaigns')
        .where('agent_id', agentId)
        .select(
          db.raw('COUNT(*) as total_campaigns'),
          db.raw('AVG(performance) as avg_performance'),
          db.raw('SUM(spent) as total_spent')
        )
        .first();
      
      return {
        blockchain: blockchainMetrics,
        database: dbMetrics,
        status: agent.getStatus()
      };
      
    } catch (error) {
      console.error('❌ Failed to get analytics:', error);
      throw error;
    }
  }
  
  /**
   * Make autonomous decision
   */
  async makeAutonomousDecision(agentId, marketData) {
    try {
      const agent = this.agents.get(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }
      
      return await agent.makeAutonomousDecision(marketData);
      
    } catch (error) {
      console.error('❌ Autonomous decision failed:', error);
      throw error;
    }
  }
  
  /**
   * Get all real agents for a user
   */
  async getUserAgents(userId) {
    try {
      const agents = await db('ai_agents')
        .where('user_id', userId)
        .where('is_deployed', true)
        .where('is_active', true)
        .select('*');
      
      return agents.map(agent => ({
        ...agent,
        capabilities: JSON.parse(agent.capabilities || '[]'),
        explorerUrl: `https://sepolia.basescan.org/address/${agent.smart_contract_address}`
      }));
      
    } catch (error) {
      console.error('❌ Failed to get user agents:', error);
      throw error;
    }
  }
}

module.exports = new RealAgentService();