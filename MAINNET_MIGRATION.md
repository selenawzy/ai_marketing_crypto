# Base Mainnet Migration Guide

This guide explains how to migrate your AI Marketing Crypto project from Base Sepolia testnet to Base mainnet for production deployment.

## Overview

Your project is currently configured to work exclusively with Base Sepolia testnet (Chain ID: 84532). To deploy to production, you'll need to update several configuration values to use Base mainnet (Chain ID: 8453).

## Pre-Migration Checklist

- [ ] Thoroughly test all functionality on Base Sepolia testnet
- [ ] Ensure you have sufficient ETH on Base mainnet for gas fees
- [ ] Update your wallet to connect to Base mainnet
- [ ] Verify all smart contract addresses for mainnet deployment
- [ ] Test with small amounts first before full deployment

## Configuration Changes Required

### 1. Frontend Web3 Context (`frontend/src/contexts/Web3Context.tsx`)

**Current (Testnet):**
```typescript
// Line 87: Auto-switch to Base Sepolia
if (Number(network.chainId) !== 84532) {
  await switchNetwork(84532);
}

// Line 136: Base Sepolia configuration
chainId: '0x14a34', // 84532 in hex
chainName: 'Base Sepolia',
rpcUrls: ['https://chain-proxy.wallet.coinbase.com?targetName=base-sepolia'],
blockExplorerUrls: ['https://sepolia.basescan.org'],
```

**Update to (Mainnet):**
```typescript
// Line 87: Auto-switch to Base Mainnet
if (Number(network.chainId) !== 8453) {
  await switchNetwork(8453);
}

// Line 136: Base Mainnet configuration
chainId: '0x2105', // 8453 in hex
chainName: 'Base',
rpcUrls: ['https://mainnet.base.org'],
blockExplorerUrls: ['https://basescan.org'],
```

### 2. Wallet Connection (`frontend/src/components/WalletConnect.tsx`)

**Current (Testnet):**
```typescript
// Line 36: Switch to Base Sepolia
if (window.ethereum && web3State?.switchNetwork && chainId !== 84532) {
  await web3State.switchNetwork(84532);
}

// Line 56: Switch network function
await web3State.switchNetwork(84532);

// Line 75: Network detection
const networkName = chainId === 84532 ? 'Base Sepolia' : chainId === 8453 ? 'Base' : chainId ? `Chain ${chainId}` : 'Unknown';

// Line 102: Network check
{chainId !== 84532 && (
```

**Update to (Mainnet):**
```typescript
// Line 36: Switch to Base Mainnet
if (window.ethereum && web3State?.switchNetwork && chainId !== 8453) {
  await web3State.switchNetwork(8453);
}

// Line 56: Switch network function
await web3State.switchNetwork(8453);

// Line 75: Network detection
const networkName = chainId === 8453 ? 'Base' : chainId === 84532 ? 'Base Sepolia' : chainId ? `Chain ${chainId}` : 'Unknown';

// Line 102: Network check
{chainId !== 8453 && (
```

### 3. Transaction Processing (`frontend/src/components/CoinbaseOnramp.tsx`)

**Current (Testnet):**
```typescript
// Line 334: Chain ID check
if (chainId !== 84532) {
  setError('Please switch to Base Sepolia testnet (Chain ID: 84532)');
}

// Line 468: BaseScan URL
href="https://sepolia.basescan.org/tx/${receipt!.hash}"

// Line 437: Transaction data
baseScanUrl: `https://sepolia.basescan.org/tx/${receipt!.hash}`
```

**Update to (Mainnet):**
```typescript
// Line 334: Chain ID check
if (chainId !== 8453) {
  setError('Please switch to Base mainnet (Chain ID: 8453)');
}

// Line 468: BaseScan URL
href="https://basescan.org/tx/${receipt!.hash}"

// Line 437: Transaction data
baseScanUrl: `https://basescan.org/tx/${receipt!.hash}`
```

### 4. UI Updates (`frontend/src/components/CoinbaseOnramp.tsx`)

**Current (Testnet):**
```typescript
// Line 519: Network badge
<span className="text-sm font-bold">Base Sepolia</span>

// Line 564: Faucet link (remove for mainnet)
• Get free testnet ETH: <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" rel="noreferrer" className="underline">Coinbase Faucet</a><br/>
• Network: Base Sepolia (Chain ID: 84532)<br/>
• All transactions use real testnet blockchain

// Line 639: Help text (update for mainnet)
• Get Base Sepolia ETH: <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" className="underline">Coinbase Faucet</a><br/>
• Ensure you're on Base Sepolia network (Chain ID: 84532)<br/>
```

**Update to (Mainnet):**
```typescript
// Line 519: Network badge
<span className="text-sm font-bold">Base Mainnet</span>

// Line 564: Mainnet info (remove faucet)
• Network: Base Mainnet (Chain ID: 8453)<br/>
• All transactions use real mainnet blockchain<br/>
• ⚠️ Real ETH and gas fees apply

// Line 639: Help text (update for mainnet)
• Ensure you're on Base Mainnet network (Chain ID: 8453)<br/>
• ⚠️ This will transfer real ETH - gas fees apply<br/>
• Test with small amounts first
```

## Token Contract Addresses

When working with tokens on mainnet, you'll need to update contract addresses:

### Base Mainnet Token Addresses:
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **WETH**: `0x4200000000000000000000000000000000000006`

### Base Sepolia Testnet Token Addresses (current):
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **WETH**: `0x4200000000000000000000000000000000000006`

## Environment Variables

Create a `.env.production` file in your frontend directory:

```env
# Base Mainnet Configuration
REACT_APP_CHAIN_ID=8453
REACT_APP_NETWORK_NAME="Base"
REACT_APP_RPC_URL="https://mainnet.base.org"
REACT_APP_BLOCK_EXPLORER="https://basescan.org"

# Mainnet Token Addresses
REACT_APP_USDC_ADDRESS="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
REACT_APP_WETH_ADDRESS="0x4200000000000000000000000000000000000006"
```

## Backend Configuration

If you have backend services, update the following:

### 1. Database Migrations
Update any database seedings that reference testnet addresses or chain IDs.

### 2. API Endpoints
Ensure all API endpoints that interact with blockchain use mainnet configurations.

### 3. Contract Integration
Update smart contract addresses and ABIs for mainnet deployment.

## Testing Strategy

### Phase 1: Pre-Deployment Testing
1. Deploy contracts to Base mainnet testnet environment first
2. Test all wallet connections with mainnet RPC
3. Verify all UI components show correct network information
4. Test small transaction amounts

### Phase 2: Production Testing
1. Start with minimal amounts (e.g., 0.001 ETH)
2. Test complete user flow from wallet connection to transaction completion
3. Verify all block explorer links work correctly
4. Test error handling for insufficient funds, network switches, etc.

## Security Considerations

⚠️ **Important Security Notes:**

1. **Real Money**: Mainnet uses real ETH and tokens with real monetary value
2. **Gas Fees**: All transactions will incur real gas fees
3. **Irreversible**: Mainnet transactions cannot be reversed
4. **Testing**: Always test thoroughly on testnet before mainnet deployment
5. **Contract Auditing**: Ensure all smart contracts are properly audited
6. **Private Keys**: Never commit private keys or mnemonics to code

## Deployment Checklist

Before deploying to mainnet:

- [ ] Update all chain IDs from 84532 to 8453
- [ ] Update all RPC URLs to mainnet endpoints
- [ ] Update all block explorer URLs to basescan.org
- [ ] Remove testnet faucet references
- [ ] Update network names in UI
- [ ] Test wallet connections with mainnet
- [ ] Verify contract addresses are correct for mainnet
- [ ] Update environment variables
- [ ] Test with small amounts first
- [ ] Monitor gas fees and optimize if necessary

## Rollback Plan

Keep your testnet configuration as a backup:

1. Create a git branch for mainnet changes: `git checkout -b mainnet-config`
2. Keep testnet configuration in a separate branch: `testnet-config`
3. Document all changes for easy rollback if needed

## Support Resources

- **Base Documentation**: https://docs.base.org/
- **BaseScan (Mainnet)**: https://basescan.org
- **Base RPC Status**: https://status.base.org/
- **Coinbase Wallet Support**: https://help.coinbase.com/en/wallet

---

## Summary

This migration involves updating chain IDs, RPC URLs, block explorer URLs, and removing testnet-specific features like faucet links. The key change is switching from Chain ID 84532 (Base Sepolia) to Chain ID 8453 (Base Mainnet).

**Remember**: Always test thoroughly on testnet before deploying to mainnet, and start with small amounts when testing on mainnet to minimize risk.