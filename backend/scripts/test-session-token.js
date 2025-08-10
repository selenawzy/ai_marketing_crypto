#!/usr/bin/env node

/**
 * Test script for Coinbase Onramp session token generation
 * Run this to verify your CDP credentials are working
 */

require('dotenv').config();
const coinbaseOnrampService = require('../src/services/coinbaseOnramp');

async function testSessionToken() {
  console.log('🧪 Testing Coinbase Onramp Session Token Generation\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('CDP_API_KEY_NAME:', process.env.CDP_API_KEY_NAME ? '✅ SET' : '❌ NOT SET');
  console.log('CDP_API_KEY_SECRET:', process.env.CDP_API_KEY_SECRET ? '✅ SET' : '❌ NOT SET');
  console.log('CDP_API_KEY_ID:', process.env.CDP_API_KEY_ID ? '✅ SET' : '❌ NOT SET');
  console.log('CDP_API_KEY_PRIVATE_KEY:', process.env.CDP_API_KEY_PRIVATE_KEY ? '✅ SET' : '❌ NOT SET');
  console.log('COINBASE_ENVIRONMENT:', process.env.COINBASE_ENVIRONMENT || 'sandbox');
  console.log('USE_ONRAMP_SANDBOX:', process.env.USE_ONRAMP_SANDBOX || 'true');
  console.log('');
  
  // Test wallet address
  const testWallet = '0x1234567890123456789012345678901234567890';
  
  try {
    console.log('🚀 Generating session token...');
    const sessionToken = await coinbaseOnrampService.generateSessionToken({
      walletAddress: testWallet,
      timestamp: Date.now(),
      appId: process.env.COINBASE_ONRAMP_APP_ID || 'test-app-id'
    });
    
    console.log('✅ Session token generated successfully!');
    console.log('Token preview:', sessionToken.substring(0, 50) + '...');
    console.log('Token length:', sessionToken.length);
    console.log('');
    
    // Test URL generation
    console.log('🔗 Testing Onramp URL generation...');
    const onrampUrl = coinbaseOnrampService.generateOnrampUrl({
      destinationWallet: testWallet,
      sessionToken: sessionToken,
      presetFiatAmount: 25,
      fiatCurrency: 'USD',
      defaultAsset: 'USDC',
      defaultNetwork: 'base'
    });
    
    console.log('✅ Onramp URL generated successfully!');
    console.log('URL preview:', onrampUrl.substring(0, 100) + '...');
    console.log('');
    
    // Check if token contains required parameters
    if (onrampUrl.includes('sessionToken=')) {
      console.log('✅ sessionToken parameter found in URL');
    } else {
      console.log('❌ sessionToken parameter missing from URL');
    }
    
    if (onrampUrl.includes('defaultAsset=USDC')) {
      console.log('✅ defaultAsset parameter found in URL');
    } else {
      console.log('❌ defaultAsset parameter missing from URL');
    }
    
    if (onrampUrl.includes('defaultNetwork=base')) {
      console.log('✅ defaultNetwork parameter found in URL');
    } else {
      console.log('❌ defaultNetwork parameter missing from URL');
    }
    
    console.log('\n🎉 All tests passed! Your session token generation is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message.includes('CDP credentials not found')) {
      console.log('\n💡 Solution: Set CDP_API_KEY_NAME and CDP_API_KEY_SECRET in your .env file');
      console.log('Get these from: https://portal.cdp.coinbase.com/projects/api-keys');
    }
    
    if (error.message.includes('JWT signing error')) {
      console.log('\n💡 Solution: Check your CDP API key format and ensure it supports ES256 algorithm');
    }
    
    process.exit(1);
  }
}

// Run the test
testSessionToken().catch(console.error); 