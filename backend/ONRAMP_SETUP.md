# Coinbase Onramp Setup Guide

## Current Status
The Onramp integration is set up but requires valid CDP API credentials to work fully.

## What You Need

### 1. Create a Secret API Key (Required for Session Tokens)
1. Go to [CDP Dashboard](https://portal.cdp.coinbase.com/projects/api-keys)
2. Select your project
3. Go to "Secret API Keys" tab
4. Click "Create API key"
5. Save the API Key ID and Secret

### 2. Update Your .env File
Replace the placeholder values in `/backend/.env`:
```
CDP_API_KEY_NAME=<Your API Key ID from step 1>
CDP_API_KEY_SECRET=<Your API Key Secret from step 1>
```

## How It Works

### Authentication Flow:
1. **Secret API Key** → Generates **Bearer Token (JWT)**
2. **Bearer Token** → Authenticates request to `/onramp/v1/token`
3. **Session Token** → Used in Onramp URL

### Current Implementation:
- ✅ Bearer token generation with ES256 algorithm
- ✅ Proper request format to CDP API
- ✅ Sandbox URL configuration
- ❌ Missing: Valid Secret API Key credentials

## Sandbox Testing

For sandbox testing without real API credentials:

### Option 1: Use Direct Sandbox URL (No Session Token Required)
```
https://pay-sandbox.coinbase.com/buy/select-asset?appId=<your-app-id>&...
```

### Option 2: Get Real CDP Credentials
1. Sign up at [Coinbase Developer Platform](https://portal.cdp.coinbase.com)
2. Create a project
3. Generate Secret API Key
4. Update .env file

## Test Credentials for Sandbox
- **Card**: 4242 4242 4242 4242
- **Email**: Any valid email
- **Phone**: Any US 10-digit number
- **Verification Code**: 000000

## Troubleshooting

### "Invalid sessionToken" Error
This means the session token is not in the correct format. Possible causes:
1. Invalid or missing Secret API Key
2. JWT generation failed
3. CDP API returned an error

### "Unauthorized" Error from CDP API
This means your Secret API Key is invalid or missing. You need to:
1. Create a valid Secret API Key in CDP Dashboard
2. Update the .env file with correct credentials

## Your Wallet Secret
The key you provided:
```
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgzNg5w/uo7BPTC0Qj1v753dRsU42AUSHEtbVGNRDh3PihRANCAATeavqj1RB6Tg6vrt5axJ3qfXsIPAoZBij6vNU0/EEvaqf2NTGmqz6I8zGwT69q/osqr2dinNnUaAT5Xi7KnSj5
```

This is a **Wallet Secret** used for wallet operations (signing transactions), NOT for generating Onramp session tokens. Keep this secure but note it's different from the Secret API Key needed for Onramp.