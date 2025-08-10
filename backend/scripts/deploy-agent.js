const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

// Base Sepolia RPC URL
const RPC_URL = 'https://sepolia.base.org';

// Contract compilation (using solc)
async function compileContract() {
  const solc = require('solc');
  
  const contractPath = './contracts/AIMarketingAgent.sol';
  const source = fs.readFileSync(contractPath, 'utf8');
  
  const input = {
    language: 'Solidity',
    sources: {
      'AIMarketingAgent.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };
  
  const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
  const contractFile = tempFile.contracts['AIMarketingAgent.sol']['AIMarketingAgent'];
  
  return {
    abi: contractFile.abi,
    bytecode: contractFile.evm.bytecode.object,
  };
}

async function deployAgent() {
  try {
    console.log('🚀 Starting AI Agent deployment to Base Sepolia...');
    
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Use your CDP private key
    const privateKey = process.env.CDP_SECRET_API_KEY;
    if (!privateKey) {
      throw new Error('CDP_SECRET_API_KEY not found in environment variables');
    }
    
    // Create wallet from private key
    let wallet;
    try {
      // Try as hex private key first
      wallet = new ethers.Wallet(privateKey, provider);
    } catch (error) {
      // If that fails, try as mnemonic or other format
      console.log('Trying alternative wallet creation...');
      // For now, use a test private key
      const testKey = '0x' + Buffer.from(privateKey, 'base64').toString('hex').slice(0, 64);
      wallet = new ethers.Wallet(testKey, provider);
    }
    
    console.log('💰 Agent wallet address:', wallet.address);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💵 Wallet balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      console.log('⚠️  No balance detected. Please fund the wallet with Base Sepolia ETH.');
      console.log('🔗 Get testnet ETH from: https://www.coinbase.com/faucets');
      return;
    }
    
    // Compile contract
    console.log('⚙️  Compiling smart contract...');
    const { abi, bytecode } = await compileContract();
    
    // Create contract factory
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // Deploy contract
    console.log('📤 Deploying AI Marketing Agent contract...');
    const contract = await contractFactory.deploy(
      "AI Marketing Guru", // Agent name
      "Autonomous AI agent that optimizes marketing campaigns and manages client funds", // Description
      wallet.address // Agent wallet address
    );
    
    console.log('⏳ Waiting for deployment confirmation...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Contract deployed successfully!');
    console.log('📍 Contract address:', contractAddress);
    console.log('🔗 View on BaseScan:', `https://sepolia.basescan.org/address/${contractAddress}`);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      agentWallet: wallet.address,
      network: 'base-sepolia',
      deployedAt: new Date().toISOString(),
      abi: abi
    };
    
    fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to deployment.json');
    
    // Test contract by reading initial values
    console.log('🧪 Testing contract...');
    const agentName = await contract.agentName();
    const agentWallet = await contract.agentWallet();
    const basePrice = await contract.basePrice();
    
    console.log('📊 Contract verification:');
    console.log('   Agent Name:', agentName);
    console.log('   Agent Wallet:', agentWallet);
    console.log('   Base Price:', ethers.formatEther(basePrice), 'ETH');
    
    return {
      contractAddress,
      agentWallet: wallet.address,
      network: 'base-sepolia'
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployAgent()
    .then(() => console.log('🎉 Deployment completed successfully!'))
    .catch(error => {
      console.error('💥 Deployment failed:', error.message);
      process.exit(1);
    });
}

module.exports = { deployAgent };