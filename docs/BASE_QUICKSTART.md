# Base Network Quick Start Guide

## 🚀 Launch AI Agents on Base

This guide follows the official Base documentation for launching AI agents: [https://docs.base.org/cookbook/launch-ai-agents](https://docs.base.org/cookbook/launch-ai-agents)

## 📋 Prerequisites

### 1. Development Environment
- **Node.js 18+** or **Python 3.10+**
- **Git** for repository management
- **Code editor** (VS Code recommended)

### 2. API Keys and Credentials
- **Coinbase Developer Platform (CDP) API Key**: [Get your CDP credentials](https://docs.base.org/cookbook/launch-ai-agents#prerequisites)
- **OpenAI API Key**: Create an OpenAI account for AI capabilities
- **Base Network Access**: Your agent will operate on Base Sepolia testnet initially

### 3. Understanding Agent Frameworks
- **CDP AgentKit**: Full-featured framework with extensive integrations
- **LangChain**: Comprehensive framework with custom tools
- **Eliza**: Lightweight, fast setup for simple agents

## 🛠 Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/ai-agent-marketplace.git
cd ai-agent-marketplace

# Install all dependencies
npm run install:all
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```bash
# CDP AgentKit Configuration
CDP_API_KEY_NAME=your_cdp_key_name
CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key
NETWORK_ID=base-sepolia
MNEMONIC_PHRASE=your_mnemonic_phrase

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ai_marketplace
JWT_SECRET=your-super-secret-jwt-key-here

# Blockchain Configuration
BASE_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your-test-private-key

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb ai_marketplace

# Run migrations
cd backend
npm run migrate
cd ..
```

### 4. Start Development Environment

```bash
# Use Base deployment script
./scripts/deploy-base.sh dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend App**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health

## 🤖 AI Agent Development

### 1. Register AI Agent

```bash
# Register a new AI agent with CDP AgentKit
curl -X POST http://localhost:3001/api/ai-agents/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "agent_name": "ContentCrawler",
    "description": "AI agent for content analysis",
    "capabilities": ["content-access", "payment-processing"],
    "deployment_config": {
      "environment": "development",
      "auto_deploy": true
    }
  }'
```

### 2. Deploy Agent to Base Sepolia

```bash
# Deploy to Base Sepolia testnet
./scripts/deploy-base.sh testnet
```

### 3. Monitor Agent Performance

```bash
# Get agent status and metrics
curl -X GET http://localhost:3001/api/ai-agents/1/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Smart Contract Development

### 1. Compile and Test Contracts

```bash
cd smart-contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run deploy:local
```

### 2. Deploy to Base Sepolia (Testnet)

```bash
# Set your private key in .env
PRIVATE_KEY=your-testnet-private-key

# Deploy to Base Sepolia
npm run deploy:testnet
```

### 3. Verify Contracts on BaseScan

```bash
# Verify contracts on BaseScan
npm run verify -- --contract-address YOUR_CONTRACT_ADDRESS
```

## 🌐 Browser Extension

### 1. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. The extension icon should appear in your toolbar

### 2. Configure Extension

1. Click the extension icon
2. Click "Connect Wallet"
3. Configure API endpoint (default: http://localhost:3001)
4. Enable content protection

## 📱 Using the Application

### For Content Creators

1. **Register Account**
   - Go to http://localhost:3000/register
   - Create account with email and password
   - Connect your Web3 wallet

2. **Register Content**
   - Go to http://localhost:3000/create-content
   - Add your website URL and set pricing
   - Content is now protected

3. **Monitor Revenue**
   - Check dashboard for analytics
   - View payment history
   - Track AI bot access

### For AI Agents

1. **Browse Marketplace**
   - Visit http://localhost:3000/marketplace
   - Browse available content
   - Check pricing and descriptions

2. **Access Content**
   - Select content to access
   - Pay required amount in ETH
   - Get immediate access to content

### Browser Extension Usage

1. **Install Extension**
   - Load extension in Chrome
   - Connect wallet
   - Enable protection

2. **Protect Content**
   - Visit any website
   - Click extension icon
   - Enable protection for current site
   - Set pricing and access rules

## 🧪 Testing Your AI Agent

### 1. Testnet Validation

**Test all functions on Base Sepolia testnet:**
1. **Wallet Operations**: Create wallets, check balances, transfer tokens
2. **DeFi Interactions**: Test swaps, liquidity provision, lending
3. **NFT Operations**: Mint, transfer, and trade NFTs
4. **Error Handling**: Ensure graceful handling of failed transactions

### 2. Performance Testing

**Evaluate agent performance under various conditions:**
- Response time to market changes
- Transaction success rates
- Gas optimization effectiveness
- Resource utilization

### 3. Security Audit

**Verify security measures are in place:**
- API keys are properly secured
- Wallet private keys are encrypted
- Rate limiting is implemented
- Transaction limits are configured

## 🚀 Deployment and Monitoring

### 1. Production Deployment

**Deploy your agent to a production environment:**

```bash
# Deploy to Base Mainnet
./scripts/deploy-base.sh mainnet
```

### 2. Monitoring and Alerts

**Set up comprehensive monitoring:**
- **Transaction Monitoring**: Track success rates and gas usage
- **Performance Metrics**: Monitor response times and throughput
- **Financial Tracking**: Watch portfolio performance and P&L
- **System Health**: Monitor server resources and uptime

## 🔧 Advanced Use Cases

### Arbitrage Bot

Build agents that identify and execute arbitrage opportunities across DEXs:

```javascript
// Example arbitrage detection
const arbitrageOpportunity = await detectArbitrage();
if (arbitrageOpportunity.profitable) {
    await executeArbitrage(arbitrageOpportunity);
}
```

### Portfolio Manager

Create agents that rebalance portfolios based on market conditions:

```javascript
// Example portfolio rebalancing
const portfolio = await getPortfolio();
const targetAllocation = calculateTargetAllocation(portfolio);
await rebalancePortfolio(portfolio, targetAllocation);
```

### Yield Optimizer

Deploy agents that automatically find and compound the best yields:

```javascript
// Example yield optimization
const yieldOpportunities = await findYieldOpportunities();
const bestOpportunity = selectBestYield(yieldOpportunities);
await optimizeYield(bestOpportunity);
```

## 🐛 Troubleshooting

### Common Issues

**Agent Not Responding**
```bash
# Check API key validity and permissions
# Verify network connectivity to Base RPC endpoints
# Ensure sufficient gas funds in agent wallet
# Review agent logs for error messages
# Confirm OpenAI API quota and rate limits
```

**Transaction Failures**
```bash
# Verify sufficient token balance for operations
# Check gas price settings and network congestion
# Confirm smart contract addresses are correct
# Review transaction simulation results
# Validate slippage tolerance settings
```

**Performance Issues**
```bash
# Implement request batching for multiple operations
# Use connection pooling for database operations
# Cache frequently accessed data
# Optimize trading frequency to reduce gas costs
# Review and tune AI model parameters
```

## 📚 Resources and Community

- **[CDP AgentKit Documentation](https://docs.base.org/cookbook/launch-ai-agents)**: Complete documentation for building agents with CDP
- **[Base Developer Discord](https://discord.gg/base)**: Connect with other developers building AI agents on Base
- **[GitHub Repository](https://github.com/base-org)**: Access source code, examples, and contribute to the project
- **[Video Tutorials](https://www.youtube.com/@Base)**: Watch step-by-step tutorials for agent development

## 🎯 Next Steps

### 1. Integrate Additional Protocols

Connect your agent to more DeFi protocols:
- **Uniswap** for advanced trading strategies
- **Aave** for lending and borrowing
- **Compound** for yield generation
- **1inch** for optimal trade routing

### 2. Implement Advanced Strategies

Build sophisticated trading and management strategies:
- Dollar-cost averaging (DCA) algorithms
- Mean reversion trading
- Momentum-based strategies
- Risk-adjusted portfolio rebalancing

### 3. Add Cross-Chain Capabilities

Extend your agent across multiple chains:
- **Ethereum** for additional DeFi access
- **Polygon** for low-cost operations
- **Arbitrum** for advanced trading
- Cross-chain bridging automation

## 🏆 Conclusion

Congratulations! You've successfully launched an AI agent on Base with full onchain capabilities. Your agent can now:

✅ **Execute autonomous transactions** with real-world financial impact  
✅ **Interact with DeFi protocols** for advanced financial operations  
✅ **Manage digital assets** including tokens and NFTs  
✅ **Respond intelligently** to market conditions and opportunities  

**Ready for production?** Consider implementing advanced monitoring, security audits, and gradual scaling as your agent proves its effectiveness in live markets.

Your AI agent is now part of the onchain economy, ready to operate 24/7 in the world of decentralized finance. Happy building on Base! 