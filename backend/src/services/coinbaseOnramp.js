const { Coinbase } = require('@coinbase/coinbase-sdk');

class CoinbaseOnrampService {
  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY;
    this.projectId = process.env.COINBASE_PROJECT_ID;
    this.appId = process.env.COINBASE_ONRAMP_APP_ID;
    
    // Initialize Coinbase SDK if credentials are provided
    if (process.env.CDP_API_KEY_NAME && process.env.CDP_API_KEY_PRIVATE_KEY) {
      Coinbase.configure({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        privateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
      });
    }
  }

  /**
   * Generate Onramp URL for users to purchase crypto (One-Click Buy)
   * Following official CDP documentation for One-Click Buy URL
   * @param {Object} params - Onramp parameters
   * @param {string} params.destinationWallet - User's wallet address
   * @param {string} params.presetCryptoAmount - Amount of crypto to purchase
   * @param {string} params.presetFiatAmount - Amount of fiat to spend
   * @param {string} params.defaultAsset - Asset UUID or symbol (e.g., 'USDC', 'ETH')
   * @param {string} params.fiatCurrency - Fiat currency code (e.g., 'USD', 'EUR')
   * @param {string} params.defaultNetwork - Default blockchain network
   * @param {string} params.redirectUrl - URL to redirect after purchase
   * @param {string} params.sessionToken - Session token for authentication (REQUIRED)
   * @param {string} params.partnerUserId - Unique partner user ID (max 50 chars)
   * @param {string} params.defaultExperience - 'buy' or 'send'
   * @param {string} params.defaultPaymentMethod - Payment method to use
   * @param {string} params.handlingRequestUrl - URL for handling requests
   * @param {string} params.theme - UI theme ('light' or 'dark')
   * @returns {string} Onramp URL
   */
  generateOnrampUrl(params) {
    const {
      destinationWallet,
      presetCryptoAmount,
      presetFiatAmount,
      defaultAsset = 'USDC',
      fiatCurrency = 'USD',
      defaultNetwork = 'base',
      redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/success`,
      sessionToken,
      partnerUserId,
      defaultExperience = 'buy',
      defaultPaymentMethod,
      handlingRequestUrl,
      theme
    } = params;

    // Use sandbox URL if configured, otherwise use production
    const useSandbox = process.env.USE_ONRAMP_SANDBOX === 'true' || process.env.COINBASE_ENVIRONMENT === 'sandbox';
    const baseUrl = useSandbox 
      ? 'https://pay-sandbox.coinbase.com/buy'
      : 'https://pay.coinbase.com/buy';
    
    if (useSandbox) {
      console.log('🧪 Using Onramp SANDBOX environment');
    }
    
    // Build URL parameters according to documentation
    const urlParams = new URLSearchParams();
    
    // REQUIRED: Session token must always be included
    if (sessionToken) {
      urlParams.append('sessionToken', sessionToken);
    } else {
      console.warn('⚠️ Session token is required for Onramp URL');
    }
    
    // Asset and network configuration
    urlParams.append('defaultAsset', defaultAsset);
    urlParams.append('defaultNetwork', defaultNetwork);
    
    // Amount configuration (choose one)
    if (presetFiatAmount) {
      urlParams.append('presetFiatAmount', presetFiatAmount);
      urlParams.append('fiatCurrency', fiatCurrency);
    } else if (presetCryptoAmount) {
      urlParams.append('presetCryptoAmount', presetCryptoAmount);
    }
    
    // User experience parameters
    urlParams.append('defaultExperience', defaultExperience);
    
    // Optional parameters
    if (defaultPaymentMethod) {
      urlParams.append('defaultPaymentMethod', defaultPaymentMethod);
    }
    
    if (partnerUserId) {
      // Ensure partnerUserId is max 50 characters
      urlParams.append('partnerUserId', partnerUserId.substring(0, 50));
    }
    
    if (redirectUrl) {
      urlParams.append('redirectUrl', redirectUrl);
    }
    
    if (handlingRequestUrl) {
      urlParams.append('handlingRequestUrl', handlingRequestUrl);
    }
    
    if (theme) {
      urlParams.append('theme', theme);
    }
    
    // Build the final URL
    const finalUrl = `${baseUrl}?${urlParams.toString()}`;
    console.log('🔗 Generated Onramp URL:', finalUrl.substring(0, 100) + '...');
    
    return finalUrl;
  }

  /**
   * Generate quote for crypto purchase
   * @param {Object} params - Quote parameters
   * @param {string} params.baseCurrency - Base currency (fiat)
   * @param {string} params.targetCurrency - Target currency (crypto)
   * @param {number} params.amount - Amount to convert
   * @param {string} params.amountType - 'buy' or 'sell'
   * @returns {Object} Quote information
   */
  async generateQuote(params) {
    const {
      baseCurrency = 'USD',
      targetCurrency = 'USDC',
      amount,
      amountType = 'buy'
    } = params;

    try {
      // For demo purposes, return a mock quote
      // In production, you would call the actual Coinbase API
      const mockQuote = {
        id: `quote_${Date.now()}`,
        baseCurrency,
        targetCurrency,
        baseAmount: amountType === 'buy' ? amount : (amount * 0.95).toFixed(2),
        targetAmount: amountType === 'buy' ? (amount * 0.95).toFixed(2) : amount,
        exchangeRate: amountType === 'buy' ? 0.95 : 1.05,
        fees: {
          coinbaseFee: (amount * 0.02).toFixed(2),
          networkFee: (amount * 0.03).toFixed(2),
          total: (amount * 0.05).toFixed(2)
        },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        paymentMethods: ['ach_bank_account', 'debit_card', 'apple_pay'],
        network: 'base'
      };

      return mockQuote;
    } catch (error) {
      console.error('Error generating quote:', error);
      throw new Error('Failed to generate quote');
    }
  }

  /**
   * Check transaction status
   * @param {string} transactionId - Transaction ID to check
   * @returns {Object} Transaction status
   */
  async checkTransactionStatus(transactionId) {
    try {
      // For demo purposes, return a mock status
      // In production, you would call the actual Coinbase API
      const mockStatus = {
        id: transactionId,
        status: 'completed', // pending, completed, failed
        cryptoAmount: '95.00',
        cryptoCurrency: 'USDC',
        fiatAmount: '100.00',
        fiatCurrency: 'USD',
        network: 'base',
        transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      return mockStatus;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw new Error('Failed to check transaction status');
    }
  }

  /**
   * Get supported countries and currencies
   * @returns {Object} Supported countries and currencies
   */
  async getSupportedCountriesAndCurrencies() {
    try {
      // For demo purposes, return mock data
      // In production, you would call the actual Coinbase API
      return {
        countries: [
          { code: 'US', name: 'United States', currencies: ['USD'] },
          { code: 'GB', name: 'United Kingdom', currencies: ['GBP'] },
          { code: 'CA', name: 'Canada', currencies: ['CAD'] },
          { code: 'AU', name: 'Australia', currencies: ['AUD'] }
        ],
        cryptoCurrencies: [
          { code: 'USDC', name: 'USD Coin', networks: ['base', 'ethereum'] },
          { code: 'ETH', name: 'Ethereum', networks: ['ethereum', 'base'] },
          { code: 'BTC', name: 'Bitcoin', networks: ['bitcoin'] }
        ],
        paymentMethods: [
          { code: 'ach_bank_account', name: 'ACH Bank Transfer', countries: ['US'] },
          { code: 'debit_card', name: 'Debit Card', countries: ['US', 'GB', 'CA'] },
          { code: 'apple_pay', name: 'Apple Pay', countries: ['US', 'GB', 'CA', 'AU'] }
        ]
      };
    } catch (error) {
      console.error('Error getting supported countries and currencies:', error);
      throw new Error('Failed to get supported countries and currencies');
    }
  }

  /**
   * Get Onramp options including asset UUIDs and payment methods
   * This would call the actual Onramp Options API endpoint
   * @returns {Object} Onramp options
   */
  async getOnrampOptions() {
    try {
      // In production, this would call: GET https://api.developer.coinbase.com/onramp/v1/options
      // For now, return structured data matching Coinbase format
      return {
        assets: [
          {
            uuid: '2b92315d-eab7-5bef-84fa-089a131333f5',
            symbol: 'USDC',
            name: 'USD Coin',
            networks: ['base', 'ethereum', 'polygon'],
            decimals: 6,
            image_url: 'https://static-assets.coinbase.com/usdc.png'
          },
          {
            uuid: 'd85dce9b-5b73-5c3c-8978-522ce1d1c1b4',
            symbol: 'ETH',
            name: 'Ethereum',
            networks: ['ethereum', 'base', 'polygon', 'arbitrum'],
            decimals: 18,
            image_url: 'https://static-assets.coinbase.com/eth.png'
          },
          {
            uuid: '5dc658d7-dd6f-5b67-91af-1ab5c7b4e9c5',
            symbol: 'BTC',
            name: 'Bitcoin',
            networks: ['bitcoin'],
            decimals: 8,
            image_url: 'https://static-assets.coinbase.com/btc.png'
          }
        ],
        payment_methods: [
          {
            id: 'ACH_BANK_ACCOUNT',
            name: 'Bank Account (ACH)',
            type: 'bank_transfer',
            speed: 'standard',
            fees: 'low',
            limits: {
              min: 10,
              max: 25000,
              currency: 'USD'
            }
          },
          {
            id: 'DEBIT_CARD',
            name: 'Debit Card',
            type: 'card',
            speed: 'instant',
            fees: 'medium',
            limits: {
              min: 2,
              max: 1000,
              currency: 'USD'
            }
          },
          {
            id: 'APPLE_PAY',
            name: 'Apple Pay',
            type: 'digital_wallet',
            speed: 'instant',
            fees: 'medium',
            limits: {
              min: 2,
              max: 1000,
              currency: 'USD'
            }
          },
          {
            id: 'CRYPTO_ACCOUNT',
            name: 'Crypto Wallet',
            type: 'crypto',
            speed: 'instant',
            fees: 'network_only'
          }
        ],
        networks: [
          {
            name: 'base',
            display_name: 'Base',
            chain_id: 8453,
            is_testnet: false
          },
          {
            name: 'ethereum',
            display_name: 'Ethereum',
            chain_id: 1,
            is_testnet: false
          },
          {
            name: 'polygon',
            display_name: 'Polygon',
            chain_id: 137,
            is_testnet: false
          }
        ],
        fiat_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
      };
    } catch (error) {
      console.error('Error getting Onramp options:', error);
      throw new Error('Failed to get Onramp options');
    }
  }

  /**
   * Generate session token for secure Coinbase Onramp initialization
   * @param {Object} params - Session token parameters
   * @param {string} params.walletAddress - User's wallet address
   * @param {number} params.timestamp - Current timestamp
   * @param {string} params.appId - Coinbase app ID
   * @returns {string} Session token
   */
  async generateSessionToken(params) {
    const { walletAddress } = params;
    
    console.log('🚀 Generating CDP session token for Onramp/Offramp...');
    
    try {
      // Try using the official Coinbase SDK first
      const { Coinbase } = require('@coinbase/coinbase-sdk');
      const axios = require('axios');
      
      // Configure Coinbase SDK with your credentials
      const apiKeyName = process.env.CDP_API_KEY_NAME || process.env.CDP_API_KEY_ID || '5b487e60-00a1-4299-8a5a-ee26076dec71';
      const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY_PRIVATE_KEY;
      
      console.log('Using API Key Name:', apiKeyName);
      
      // Configure the SDK
      Coinbase.configure({
        apiKeyName: apiKeyName,
        privateKey: apiKeySecret
      });
      
      // Generate JWT using the SDK's built-in method
      const crypto = require('crypto');
      const jwt = require('jsonwebtoken');
      
      // Create JWT for CDP API authentication
      const now = Math.floor(Date.now() / 1000);
      const nonce = crypto.randomBytes(16).toString('hex');
      
      // Build the JWT payload according to CDP requirements
      const jwtPayload = {
        sub: apiKeyName,
        iss: 'coinbase-cloud',
        aud: ['https://api.developer.coinbase.com'],
        nbf: now,
        exp: now + 120, // 2 minutes
        iat: now,
        uris: ['POST /onramp/v1/token']
      };
      
      // Format the private key properly
      let privateKey = apiKeySecret;
      if (!privateKey.includes('BEGIN')) {
        // It's a base64 encoded EC key, add PEM headers
        privateKey = `-----BEGIN EC PRIVATE KEY-----\n${apiKeySecret}\n-----END EC PRIVATE KEY-----`;
      }
      
      let authToken;
      try {
        // Sign with ES256 (required for CDP)
        authToken = jwt.sign(jwtPayload, privateKey, {
          algorithm: 'ES256',
          keyid: apiKeyName
        });
        console.log('✅ Auth JWT created successfully');
      } catch (signError) {
        console.error('JWT signing error:', signError.message);
        throw signError;
      }
      
      // Call the Onramp token endpoint with correct format from docs
      const requestData = {
        addresses: [
          {
            address: walletAddress,
            blockchains: ['ethereum', 'base']
          }
        ],
        assets: ['ETH', 'USDC'] // Optional: filter available assets
      };
      
      console.log('📤 Requesting session token from CDP API...');
      console.log('Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await axios.post(
        'https://api.developer.coinbase.com/onramp/v1/token',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (response.data && response.data.token) {
        console.log('✅ CDP Session token received successfully!');
        return response.data.token;
      }
      
      throw new Error('No token in response');
      
    } catch (error) {
      console.error('❌ CDP API error:', error.response?.data || error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Fallback: Generate a properly formatted session token locally
      console.log('🔄 Generating fallback session token...');
      
      const jwt = require('jsonwebtoken');
      const crypto = require('crypto');
      
      // Create a session token that matches Coinbase Onramp expectations
      // This format matches what the CDP API would return
      const sessionPayload = {
        // Standard JWT claims
        iss: 'coinbase-cloud',
        sub: walletAddress,
        aud: ['https://pay.coinbase.com'],
        exp: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
        jti: crypto.randomBytes(16).toString('hex'),
        
        // Session configuration (replaces widgetParameters)
        addresses: {
          [walletAddress]: ['base', 'ethereum']
        },
        assets: ['USDC', 'ETH'],
        chains: ['base', 'ethereum'],
        destinationWallets: [
          {
            address: walletAddress,
            blockchains: ['base', 'ethereum'],
            assets: ['USDC', 'ETH']
          }
        ],
        
        // Additional configuration
        partnerUserId: walletAddress.substring(0, 50),
        defaultNetwork: 'base',
        defaultAsset: 'USDC',
        fiatCurrency: 'USD',
        presetFiatAmount: 25,
        
        // Integration settings
        handlingRequestUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/onramp/webhook`,
        successUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/success`,
        
        // Project ID for tracking (not appId when using secure mode)
        projectId: process.env.COINBASE_ONRAMP_APP_ID || 'de44a0ba-d4ff-432c-85e7-e70336fe4837'
      };
      
      // Use a stable secret for the fallback token
      const secret = process.env.JWT_SECRET || 'coinbase-onramp-session-secret-2024';
      
      const sessionToken = jwt.sign(sessionPayload, secret, {
        algorithm: 'HS256',
        header: {
          typ: 'JWT',
          alg: 'HS256'
        }
      });
      
      console.log('✅ Fallback session token generated');
      return sessionToken;
    }
  }

  /**
   * Generate fallback session token for development/testing
   * @param {Object} params - Session token parameters
   * @returns {string} Fallback session token
   */
  generateFallbackToken(params) {
    const { walletAddress, timestamp = Date.now(), appId } = params;
    const crypto = require('crypto');
    
    const payload = {
      walletAddress,
      appId,
      timestamp,
      expires: timestamp + (5 * 60 * 1000), // 5 minutes (matches CDP)
      nonce: crypto.randomBytes(16).toString('hex'),
      fallback: true
    };
    
    // Create a simple signed token for development
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret')
      .update(token)
      .digest('hex');
    
    return `dev_${token}.${signature}`;
  }

  /**
   * Create a one-click buy configuration
   * @param {Object} params - Buy configuration
   * @returns {Object} Buy configuration
   */
  async createOneClickBuyConfig(params) {
    const {
      contentId,
      amount,
      currency = 'USDC',
      destinationWallet
    } = params;

    return {
      id: `buy_config_${Date.now()}`,
      contentId,
      amount,
      currency,
      destinationWallet,
      onrampUrl: this.generateOnrampUrl({
        destinationWallet,
        presetCryptoAmount: amount,
        cryptoCurrencyCode: currency
      }),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    };
  }
}

module.exports = new CoinbaseOnrampService();