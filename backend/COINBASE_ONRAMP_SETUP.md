# Coinbase Onramp Session Token Setup Guide

## Overview
This guide will help you set up Coinbase Onramp session tokens correctly according to the [official CDP documentation](https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/generating-onramp-url#getting-a-session-token).

## What You Need

### 1. CDP Account & Project
1. Go to [Coinbase Developer Platform (CDP)](https://portal.cdp.coinbase.com)
2. Sign up/Sign in with your Coinbase account
3. Create a new project or select existing one

### 2. Create a Secret API Key (REQUIRED for Session Tokens)
1. In your CDP project, go to "API Keys" section
2. Click "Create API Key"
3. Select "Secret API Key" type
4. Save both the **API Key ID** and **Secret** securely

### 3. Environment Variables
Update your `.env` file with these values:

```bash
# CDP API Credentials (REQUIRED for session tokens)
CDP_API_KEY_NAME=your_api_key_id_from_step_2
CDP_API_KEY_SECRET=your_api_key_secret_from_step_2

# Alternative names (if you prefer)
CDP_API_KEY_ID=your_api_key_id_from_step_2
CDP_API_KEY_PRIVATE_KEY=your_api_key_secret_from_step_2

# Coinbase Onramp Configuration
COINBASE_ONRAMP_APP_ID=your_onramp_app_id
COINBASE_PROJECT_ID=your_project_id
COINBASE_ENVIRONMENT=sandbox
USE_ONRAMP_SANDBOX=true

# JWT Secret for development fallback tokens
JWT_SECRET=your_jwt_secret_here
```

## How Session Tokens Work

### 1. Authentication Flow
```
CDP Secret API Key → JWT Token → CDP API → Session Token → Onramp URL
```

### 2. JWT Generation
- **Algorithm**: ES256 (ECDSA) - REQUIRED by CDP
- **Expiration**: 2 minutes (120 seconds)
- **Claims**: sub, iss, aud, nbf, exp, iat, uris

### 3. API Request
- **Endpoint**: `POST https://api.developer.coinbase.com/onramp/v1/token`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Body**: Addresses and assets configuration

## Testing Your Setup

### 1. Check Environment Variables
```bash
# In your backend directory
node -e "console.log('CDP API Key Name:', process.env.CDP_API_KEY_NAME)"
node -e "console.log('CDP API Key Secret:', process.env.CDP_API_KEY_SECRET ? 'SET' : 'NOT SET')"
```

### 2. Test Session Token Generation
```bash
# Start your backend server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3001/api/onramp/session-token \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x1234567890123456789012345678901234567890"}'
```

### 3. Expected Response
```json
{
  "success": true,
  "data": {
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Invalid sessionToken" Error
**Cause**: Session token not properly formatted or expired
**Solution**: 
- Check CDP credentials are correct
- Verify JWT signing is working
- Check token expiration

#### 2. "Unauthorized" from CDP API
**Cause**: Invalid or missing Secret API Key
**Solution**:
- Verify `CDP_API_KEY_NAME` and `CDP_API_KEY_SECRET` are set
- Check the API key is still active in CDP dashboard
- Ensure you're using Secret API Key, not Public API Key

#### 3. JWT Signing Errors
**Cause**: Private key format issues
**Solution**:
- CDP expects ES256 algorithm
- Private key should be in PEM format or base64
- Check key length (should be 88 chars for base64, 64 for hex)

#### 4. "No token in response"
**Cause**: CDP API didn't return expected response
**Solution**:
- Check request format matches documentation
- Verify addresses and blockchains are valid
- Check CDP API status

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
DEBUG=coinbase:*
```

## Production Checklist

- [ ] CDP Secret API Key created and configured
- [ ] Environment variables set in production
- [ ] JWT signing working with ES256
- [ ] Session token generation successful
- [ ] Onramp URLs working with session tokens
- [ ] Error handling implemented
- [ ] Monitoring/logging configured

## Fallback Mode
If CDP credentials fail, the system will generate a development fallback token. This works for testing but **NOT for production**.

## Support
- [CDP Documentation](https://docs.cdp.coinbase.com)
- [CDP Portal](https://portal.cdp.coinbase.com)
- [CDP Discord](https://discord.gg/coinbase-developers) 