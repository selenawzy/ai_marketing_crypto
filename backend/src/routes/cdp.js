const express = require('express');
const { ethers } = require('ethers');
const CDPAgentKitService = require('../services/cdpAgentKit');
const { protect } = require('../middleware/auth');

const router = express.Router();
const cdpService = new CDPAgentKitService();

// @route   POST /api/cdp/wallet/connect
// @desc    Connect or create CDP wallet
// @access  Public
router.post('/wallet/connect', async (req, res) => {
  try {
    const { name = 'User CDP Wallet', network = 'base-sepolia' } = req.body;

    // Check if CDP is configured
    if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
      return res.status(400).json({
        success: false,
        message: 'CDP credentials not configured. Please add CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY to your .env file.',
        setup_url: 'https://portal.cdp.coinbase.com/'
      });
    }

    // Initialize CDP service
    await cdpService.initialize();

    // Create a new CDP wallet
    const result = await cdpService.createAgentWallet(name);

    if (result.success) {
      const wallet = result.agent;
      
      // Get network info
      const networkInfo = await cdpService.getNetworkInfo();

      res.json({
        success: true,
        message: 'CDP wallet connected successfully',
        data: {
          wallet: {
            address: wallet.address,
            network: wallet.network,
            balance: '0', // New wallets start with 0 balance
            created: wallet.createdAt
          },
          network: networkInfo
        }
      });
    } else {
      throw new Error('Failed to create CDP wallet');
    }
  } catch (error) {
    console.error('CDP wallet connection error:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('CDP API credentials') 
        ? 'CDP credentials not configured. Please set up your Coinbase Developer Platform account.'
        : 'Failed to connect CDP wallet',
      error: error.message
    });
  }
});

// @route   GET /api/cdp/wallet/:address/balance
// @desc    Get CDP wallet balance
// @access  Public
router.get('/wallet/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;

    await cdpService.initialize();
    const networkInfo = await cdpService.getNetworkInfo();
    
    // Get balance from Base network
    const balance = await cdpService.provider.getBalance(address);
    
    res.json({
      success: true,
      data: {
        address,
        balance: balance.toString(),
        balanceEth: ethers.formatEther(balance),
        network: networkInfo
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet balance',
      error: error.message
    });
  }
});

// @route   GET /api/cdp/network/info
// @desc    Get Base network information
// @access  Public
router.get('/network/info', async (req, res) => {
  try {
    await cdpService.initialize();
    const networkInfo = await cdpService.getNetworkInfo();
    
    res.json({
      success: true,
      data: networkInfo
    });
  } catch (error) {
    console.error('Get network info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network information',
      error: error.message
    });
  }
});

// @route   POST /api/cdp/transaction/send
// @desc    Send transaction via CDP
// @access  Private
router.post('/transaction/send', protect, async (req, res) => {
  try {
    const { agentId, transaction } = req.body;

    if (!agentId || !transaction) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and transaction data required'
      });
    }

    await cdpService.initialize();
    
    // Validate transaction
    const validation = await cdpService.validateTransaction(transaction);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Transaction validation failed',
        error: validation.error
      });
    }

    // Execute transaction
    const result = await cdpService.executeOnchainTransaction(agentId, transaction);

    res.json({
      success: true,
      message: 'Transaction sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send transaction',
      error: error.message
    });
  }
});

module.exports = router;