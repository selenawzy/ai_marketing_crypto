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
   * Generate Onramp URL for users to purchase crypto
   * @param {Object} params - Onramp parameters
   * @param {string} params.destinationWallet - User's wallet address
   * @param {string} params.presetCryptoAmount - Amount of crypto to purchase
   * @param {string} params.presetFiatAmount - Amount of fiat to spend
   * @param {string} params.cryptoCurrencyCode - Crypto currency code (e.g., 'USDC', 'ETH')
   * @param {string} params.fiatCurrencyCode - Fiat currency code (e.g., 'USD', 'EUR')
   * @param {string} params.country - Country code (e.g., 'US', 'GB')
   * @param {string} params.redirectUrl - URL to redirect after purchase
   * @returns {string} Onramp URL
   */
  generateOnrampUrl(params) {
    const {
      destinationWallet,
      presetCryptoAmount,
      presetFiatAmount,
      cryptoCurrencyCode = 'USDC',
      fiatCurrencyCode = 'USD',
      country = 'US',
      redirectUrl = `${process.env.CORS_ORIGIN}/payment/success`
    } = params;

    const baseUrl = 'https://pay.coinbase.com/buy/select-asset';
    const urlParams = new URLSearchParams({
      appId: this.appId,
      destinationWallet,
      presetCryptoAmount: presetCryptoAmount || '',
      presetFiatAmount: presetFiatAmount || '',
      defaultPaymentMethod: 'ach_bank_account',
      defaultNetwork: 'base',
      cryptoCurrencyCode,
      fiatCurrencyCode,
      country,
      redirectUrl
    });

    return `${baseUrl}?${urlParams.toString()}`;
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