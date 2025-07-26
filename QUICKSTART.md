# AI Agent Marketplace - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you set up and run the AI Agent Marketplace project locally for development.

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Redis** (optional, for caching)
- **MetaMask** or other Web3 wallet

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/ai-agent-marketplace.git
cd ai-agent-marketplace

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_marketplace
JWT_SECRET=your-super-secret-jwt-key-here

# Blockchain (for testing, use Base Sepolia)
BASE_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your-test-private-key

# Server
PORT=3001
NODE_ENV=development
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb ai_marketplace

# Run migrations
cd backend
npm run migrate
cd ..
```

### 4. Start Development Servers

```bash
# Start both backend and frontend
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend App**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health

## 🧪 Smart Contract Development

### Compile and Test Contracts

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

### Deploy to Base Sepolia (Testnet)

```bash
# Set your private key in .env
PRIVATE_KEY=your-testnet-private-key

# Deploy to Base Sepolia
npm run deploy:testnet
```

## 🌐 Browser Extension

### Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. The extension icon should appear in your toolbar

### Configure Extension

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

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Smart Contract Development

```bash
cd smart-contracts

# Start local Hardhat node
npm run node

# In another terminal, deploy contracts
npm run deploy:local

# Run tests
npm test
```

## 🧪 Testing

### API Testing

```bash
# Test backend API
cd backend
npm test

# Test with specific file
npm test -- --grep "auth"
```

### Frontend Testing

```bash
# Test React components
cd frontend
npm test

# Run tests in watch mode
npm test -- --watch
```

### Smart Contract Testing

```bash
# Test smart contracts
cd smart-contracts
npm test

# Test with coverage
npm run coverage
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Create database if it doesn't exist
createdb ai_marketplace
```

**Port Already in Use**
```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

**Smart Contract Compilation Error**
```bash
# Clean and recompile
cd smart-contracts
npm run clean
npm run compile
```

**Extension Not Loading**
```bash
# Check manifest.json syntax
# Ensure all files exist in extension folder
# Check Chrome console for errors
```

### Getting Help

1. **Check Logs**
   - Backend: `backend/logs/`
   - Frontend: Browser console
   - Smart contracts: `smart-contracts/logs/`

2. **Verify Environment**
   ```bash
   # Check environment variables
   node -e "console.log(require('dotenv').config())"
   ```

3. **Reset Database**
   ```bash
   cd backend
   npm run migrate:rollback
   npm run migrate
   ```

## 🚀 Production Deployment

### Quick Production Setup

```bash
# Build all components
npm run build

# Deploy to production
npm run deploy:prod
```

### Environment Variables for Production

```bash
# Production environment
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=your-production-secret
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=your-production-private-key
```

## 📚 Next Steps

1. **Read Documentation**
   - [API Documentation](docs/API_DOCUMENTATION.md)
   - [Hackathon Submission](docs/HACKATHON_SUBMISSION.md)

2. **Explore Codebase**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`
   - Smart contracts: `smart-contracts/contracts/`
   - Extension: `extension/`

3. **Contribute**
   - Fork the repository
   - Create feature branch
   - Submit pull request

4. **Join Community**
   - Report issues on GitHub
   - Discuss on Discord
   - Follow updates on Twitter

## 🎯 Demo Scenarios

### Scenario 1: Content Creator Journey
1. Register account and connect wallet
2. Create content with pricing
3. Install browser extension
4. Enable protection on website
5. Monitor AI bot access and revenue

### Scenario 2: AI Agent Journey
1. Browse content marketplace
2. Select high-quality content
3. Pay micro-transaction
4. Access content immediately
5. Use content for AI training

### Scenario 3: Extension Protection
1. Install extension
2. Visit any website
3. Enable protection
4. Set pricing strategy
5. Monitor real-time protection status

## 🏆 Hackathon Ready

This project is fully configured for hackathon submission with:
- ✅ Complete Web3 integration
- ✅ AI bot detection
- ✅ Real-time analytics
- ✅ Production-ready code
- ✅ Comprehensive documentation
- ✅ Demo scenarios

**Ready to present!** 🚀 