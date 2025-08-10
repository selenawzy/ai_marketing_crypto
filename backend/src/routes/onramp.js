const express = require('express');
const Joi = require('joi');
const { protect } = require('../middleware/auth');
const coinbaseOnrampService = require('../services/coinbaseOnramp');
const { db } = require('../config/database');

const router = express.Router();

// @route   POST /api/onramp/session-token
// @desc    Generate session token for secure Coinbase Onramp initialization
// @access  Public
router.post('/session-token', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    // For now, we'll generate a simple session token
    // In production, this should be a proper JWT or similar secure token
    const sessionToken = await coinbaseOnrampService.generateSessionToken({
      walletAddress,
      timestamp: Date.now(),
      appId: process.env.COINBASE_ONRAMP_APP_ID || 'de44a0ba-d4ff-432c-85e7-e70336fe4837'
    });

    res.json({
      success: true,
      data: {
        sessionToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      }
    });
  } catch (error) {
    console.error('Generate session token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating session token'
    });
  }
});

// Validation schemas
const generateOnrampUrlSchema = Joi.object({
  destinationWallet: Joi.string().required(),
  presetCryptoAmount: Joi.string().optional(),
  presetFiatAmount: Joi.string().optional(),
  defaultAsset: Joi.string().default('USDC'),
  fiatCurrency: Joi.string().default('USD'),
  defaultNetwork: Joi.string().default('base'),
  partnerUserId: Joi.string().max(50).optional(),
  defaultExperience: Joi.string().valid('buy', 'send').default('buy'),
  defaultPaymentMethod: Joi.string().optional(),
  redirectUrl: Joi.string().optional(),
  handlingRequestUrl: Joi.string().optional(),
  theme: Joi.string().valid('light', 'dark').optional(),
  contentId: Joi.number().integer().optional()
});

const generateQuoteSchema = Joi.object({
  baseCurrency: Joi.string().default('USD'),
  targetCurrency: Joi.string().default('USDC'),
  amount: Joi.number().positive().required(),
  amountType: Joi.string().valid('buy', 'sell').default('buy')
});

// @route   POST /api/onramp/generate-url
// @desc    Generate Coinbase Onramp URL
// @access  Public
router.post('/generate-url', async (req, res) => {
  try {
    const { error, value } = generateOnrampUrlSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if this is a demo wallet or development environment
    const isDemoWallet = value.destinationWallet === '0x1234567890123456789012345678901234567890';
    // Only treat as demo mode if it's the specific demo wallet, not just because it's sandbox
    const isDevMode = isDemoWallet;
    
    console.log(`🔍 Generate URL - Demo wallet: ${isDemoWallet}, Dev mode: ${isDevMode}, wallet: ${value.destinationWallet}, appId: ${process.env.COINBASE_ONRAMP_APP_ID}`);
    
    let onrampUrl;
    if (isDemoWallet) {
      // Return demo mode response only for the specific demo wallet
      return res.json({
        success: true,
        data: {
          onrampUrl: 'demo-mode',
          demo: true,
          message: 'Demo mode - no real transaction',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    // Generate session token first
    const sessionToken = await coinbaseOnrampService.generateSessionToken({
      walletAddress: value.destinationWallet,
      timestamp: Date.now(),
      appId: process.env.COINBASE_ONRAMP_APP_ID || 'de44a0ba-d4ff-432c-85e7-e70336fe4837'
    });
    
    // Include session token in the URL generation
    onrampUrl = coinbaseOnrampService.generateOnrampUrl({
      ...value,
      sessionToken
    });

    // Log the onramp request
    if (value.contentId) {
      await db('access_logs').insert({
        content_id: value.contentId,
        user_id: req.user?.id || null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        access_type: 'onramp_initiated',
        access_details: {
          onramp_url: onrampUrl,
          wallet_address: value.destinationWallet,
          amount: value.presetCryptoAmount || value.presetFiatAmount,
          currency: value.cryptoCurrencyCode,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.json({
      success: true,
      data: {
        onrampUrl,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      }
    });
  } catch (error) {
    console.error('Generate onramp URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/onramp/quote
// @desc    Generate quote for crypto purchase
// @access  Public
router.post('/quote', async (req, res) => {
  try {
    const { error, value } = generateQuoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const quote = await coinbaseOnrampService.generateQuote(value);

    res.json({
      success: true,
      data: { quote }
    });
  } catch (error) {
    console.error('Generate quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/onramp/transaction/:id/status
// @desc    Check transaction status
// @access  Public
router.get('/transaction/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const status = await coinbaseOnrampService.checkTransactionStatus(id);

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    console.error('Check transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/onramp/supported-currencies
// @desc    Get supported countries and currencies
// @access  Public
router.get('/supported-currencies', async (req, res) => {
  try {
    const data = await coinbaseOnrampService.getSupportedCountriesAndCurrencies();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/onramp/options
// @desc    Get Onramp options including asset UUIDs and payment methods
// @access  Public
router.get('/options', async (req, res) => {
  try {
    const options = await coinbaseOnrampService.getOnrampOptions();
    
    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Get Onramp options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Onramp options'
    });
  }
});

// @route   POST /api/onramp/content/:id/buy-config
// @desc    Create one-click buy configuration for content
// @access  Private
router.post('/content/:id/buy-config', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { destinationWallet } = req.body;

    // Get content details
    const content = await db('content')
      .where('id', id)
      .where('is_active', true)
      .first();

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if this is a demo wallet or development environment
    const isDemoWallet = destinationWallet === '0x1234567890123456789012345678901234567890';
    const isDevMode = process.env.COINBASE_ENVIRONMENT === 'sandbox' || !process.env.COINBASE_ONRAMP_APP_ID || process.env.COINBASE_ONRAMP_APP_ID.includes('demo');
    
    console.log(`🔍 Buy Config - Demo wallet: ${isDemoWallet}, Dev mode: ${isDevMode}, wallet: ${destinationWallet}, appId: ${process.env.COINBASE_ONRAMP_APP_ID}`);
    
    if (isDemoWallet || isDevMode) {
      // Return demo mode response
      return res.json({
        success: true,
        data: {
          buyConfig: {
            id: `demo-buy-${Date.now()}`,
            contentId: id,
            amount: content.price_per_access.toString(),
            currency: 'USDC',
            destinationWallet,
            onrampUrl: 'demo-mode',
            demo: true,
            message: 'Demo mode - no real transaction',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        }
      });
    }

    const buyConfig = await coinbaseOnrampService.createOneClickBuyConfig({
      contentId: id,
      amount: content.price_per_access.toString(),
      currency: 'USDC',
      destinationWallet
    });

    res.json({
      success: true,
      data: { buyConfig }
    });
  } catch (error) {
    console.error('Create buy config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/onramp/webhook
// @desc    Handle Coinbase Onramp webhook
// @access  Public (but should be secured with webhook signature verification)
router.post('/webhook', async (req, res) => {
  try {
    const { event_type, data } = req.body;

    // Log webhook event
    console.log('Coinbase Onramp Webhook:', { event_type, data });

    switch (event_type) {
      case 'buy_success':
        // Handle successful purchase
        await handleBuySuccess(data);
        break;
      case 'buy_failure':
        // Handle failed purchase
        await handleBuyFailure(data);
        break;
      default:
        console.log('Unhandled webhook event:', event_type);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing error'
    });
  }
});

// Helper function to handle successful purchase
async function handleBuySuccess(data) {
  try {
    // Create transaction record
    const transactionData = {
      user_id: data.user_id || null,
      content_id: data.content_id || null,
      amount: data.crypto_amount,
      currency: data.crypto_currency || 'USDC',
      payment_method: 'coinbase_onramp',
      transaction_hash: data.transaction_hash,
      status: 'completed',
      confirmed_at: new Date()
    };

    await db('transactions').insert(transactionData);

    // Update content stats if applicable
    if (data.content_id) {
      await db('content')
        .where('id', data.content_id)
        .increment('paid_views', 1)
        .increment('total_revenue', parseFloat(data.crypto_amount));
    }
  } catch (error) {
    console.error('Error handling buy success:', error);
  }
}

// Helper function to handle failed purchase
async function handleBuyFailure(data) {
  try {
    // Log failed transaction
    const transactionData = {
      user_id: data.user_id || null,
      content_id: data.content_id || null,
      amount: data.attempted_amount,
      currency: data.crypto_currency || 'USDC',
      payment_method: 'coinbase_onramp',
      status: 'failed',
      failure_reason: data.failure_reason
    };

    await db('transactions').insert(transactionData);
  } catch (error) {
    console.error('Error handling buy failure:', error);
  }
}

module.exports = router;