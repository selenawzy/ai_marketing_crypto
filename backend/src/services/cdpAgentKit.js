const { ethers } = require('ethers');
const axios = require('axios');

/**
 * CDP AgentKit Integration Service
 * Based on Base documentation: https://docs.base.org/cookbook/launch-ai-agents
 */
class CDPAgentKitService {
    constructor() {
        this.cdpApiKey = process.env.CDP_API_KEY_NAME;
        this.cdpPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY;
        this.networkId = process.env.NETWORK_ID || 'base-sepolia';
        this.baseUrl = 'https://api.coinbase.com';
        
        // Initialize provider for Base network
        this.provider = new ethers.JsonRpcProvider(
            this.networkId === 'base-mainnet' 
                ? 'https://mainnet.base.org'
                : 'https://sepolia.base.org'
        );
    }

    /**
     * Initialize CDP AgentKit with proper configuration
     */
    async initialize() {
        try {
            // Check if we have fake credentials (for testing)
            const isFakeCredentials = this.cdpApiKey?.includes('fake') || this.cdpPrivateKey?.includes('fake');
            
            if (!this.cdpApiKey || !this.cdpPrivateKey) {
                throw new Error('CDP API credentials not configured');
            }

            if (isFakeCredentials) {
                console.log('🧪 Using fake CDP credentials for testing - creating local testnet wallet');
                return true;
            }

            // Test connection to Base network for real credentials
            const blockNumber = await this.provider.getBlockNumber();
            console.log(`Connected to Base ${this.networkId}, Block: ${blockNumber}`);

            return true;
        } catch (error) {
            console.error('CDP AgentKit initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create a new AI agent wallet
     * @param {string} agentName - Name of the agent
     * @param {string} mnemonic - Optional mnemonic phrase
     */
    async createAgentWallet(agentName, mnemonic = null) {
        try {
            const isFakeCredentials = this.cdpApiKey?.includes('fake');
            let wallet;
            
            if (isFakeCredentials) {
                // Create a deterministic wallet for testing with fake credentials
                console.log('🧪 Creating testnet wallet with fake CDP credentials');
                const testSeed = `${agentName}-${Date.now()}`;
                const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
                wallet = ethers.Wallet.fromPhrase(testMnemonic, this.provider);
                
                // Generate a more realistic address for testing
                wallet = ethers.Wallet.createRandom(this.provider);
            } else {
                if (mnemonic) {
                    wallet = ethers.Wallet.fromPhrase(mnemonic, this.provider);
                } else {
                    wallet = ethers.Wallet.createRandom(this.provider);
                }
            }

            // Get balance for the wallet
            let balance = '0';
            try {
                const balanceWei = await this.provider.getBalance(wallet.address);
                balance = ethers.formatEther(balanceWei);
            } catch (error) {
                console.log('Could not fetch balance, using 0');
            }

            const agentData = {
                name: agentName,
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic?.phrase,
                network: this.networkId,
                balance: balance,
                isFake: isFakeCredentials,
                createdAt: new Date().toISOString()
            };

            // Store agent wallet data securely
            await this.storeAgentWallet(agentData);

            return {
                success: true,
                agent: agentData
            };
        } catch (error) {
            console.error('Failed to create agent wallet:', error);
            throw error;
        }
    }

    /**
     * Register agent with CDP
     * @param {Object} agentData - Agent information
     */
    async registerAgentWithCDP(agentData) {
        try {
            const registrationData = {
                agent_name: agentData.name,
                wallet_address: agentData.address,
                capabilities: agentData.capabilities || ['content-access', 'payment-processing'],
                network: this.networkId,
                api_key_name: this.cdpApiKey
            };

            const response = await axios.post(
                `${this.baseUrl}/api/v1/agents/register`,
                registrationData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.cdpPrivateKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to register agent with CDP:', error);
            throw error;
        }
    }

    /**
     * Execute onchain transaction through CDP
     * @param {string} agentId - Agent identifier
     * @param {Object} transaction - Transaction data
     */
    async executeOnchainTransaction(agentId, transaction) {
        try {
            const txData = {
                agent_id: agentId,
                target_address: transaction.target,
                data: transaction.data,
                value: transaction.value || '0',
                gas_limit: transaction.gasLimit || '300000',
                network: this.networkId
            };

            const response = await axios.post(
                `${this.baseUrl}/api/v1/agents/execute`,
                txData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.cdpPrivateKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to execute onchain transaction:', error);
            throw error;
        }
    }

    /**
     * Get agent balance and status
     * @param {string} agentId - Agent identifier
     */
    async getAgentStatus(agentId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/v1/agents/${agentId}/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.cdpPrivateKey}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to get agent status:', error);
            throw error;
        }
    }

    /**
     * Deploy agent to production
     * @param {string} agentId - Agent identifier
     * @param {Object} deploymentConfig - Deployment configuration
     */
    async deployAgent(agentId, deploymentConfig) {
        try {
            const deploymentData = {
                agent_id: agentId,
                environment: 'production',
                network: this.networkId,
                configuration: deploymentConfig
            };

            const response = await axios.post(
                `${this.baseUrl}/api/v1/agents/deploy`,
                deploymentData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.cdpPrivateKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to deploy agent:', error);
            throw error;
        }
    }

    /**
     * Monitor agent performance
     * @param {string} agentId - Agent identifier
     * @param {string} period - Monitoring period
     */
    async monitorAgentPerformance(agentId, period = '24h') {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/v1/agents/${agentId}/metrics`,
                {
                    params: { period },
                    headers: {
                        'Authorization': `Bearer ${this.cdpPrivateKey}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Failed to get agent metrics:', error);
            throw error;
        }
    }

    /**
     * Store agent wallet data securely
     * @param {Object} agentData - Agent wallet data
     */
    async storeAgentWallet(agentData) {
        // In production, use secure key management
        // For development, store in encrypted format
        const encryptedData = {
            ...agentData,
            privateKey: this.encryptPrivateKey(agentData.privateKey)
        };

        // Store in database or secure storage
        // This is a simplified version - implement proper security in production
        console.log('Agent wallet created:', {
            name: agentData.name,
            address: agentData.address,
            network: agentData.network
        });

        return encryptedData;
    }

    /**
     * Encrypt private key for secure storage
     * @param {string} privateKey - Private key to encrypt
     */
    encryptPrivateKey(privateKey) {
        // Implement proper encryption in production
        // This is a placeholder for demonstration
        return Buffer.from(privateKey).toString('base64');
    }

    /**
     * Decrypt private key for use
     * @param {string} encryptedKey - Encrypted private key
     */
    decryptPrivateKey(encryptedKey) {
        // Implement proper decryption in production
        // This is a placeholder for demonstration
        return Buffer.from(encryptedKey, 'base64').toString();
    }

    /**
     * Get Base network information
     */
    async getNetworkInfo() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            const gasPrice = await this.provider.getFeeData();

            return {
                networkId: network.chainId,
                networkName: this.networkId,
                blockNumber,
                gasPrice: gasPrice.gasPrice?.toString(),
                isConnected: true
            };
        } catch (error) {
            console.error('Failed to get network info:', error);
            throw error;
        }
    }

    /**
     * Validate transaction before execution
     * @param {Object} transaction - Transaction to validate
     */
    async validateTransaction(transaction) {
        try {
            // Check if target address is valid
            if (!ethers.isAddress(transaction.target)) {
                throw new Error('Invalid target address');
            }

            // Check if agent has sufficient balance
            const balance = await this.provider.getBalance(transaction.from);
            const requiredAmount = ethers.parseEther(transaction.value || '0');
            
            if (balance < requiredAmount) {
                throw new Error('Insufficient balance');
            }

            // Simulate transaction
            const simulation = await this.provider.call({
                to: transaction.target,
                data: transaction.data,
                value: requiredAmount
            });

            return {
                valid: true,
                simulation: simulation
            };
        } catch (error) {
            console.error('Transaction validation failed:', error);
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Get recommended gas settings for Base network
     */
    async getGasRecommendations() {
        try {
            const feeData = await this.provider.getFeeData();
            
            return {
                gasPrice: feeData.gasPrice?.toString(),
                maxFeePerGas: feeData.maxFeePerGas?.toString(),
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
                recommended: {
                    gasLimit: '300000',
                    maxFeePerGas: feeData.maxFeePerGas?.toString() || '2000000000',
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '1000000000'
                }
            };
        } catch (error) {
            console.error('Failed to get gas recommendations:', error);
            throw error;
        }
    }
}

module.exports = CDPAgentKitService; 