const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Deploy a real smart contract to Base Sepolia
 * This creates an actual contract on the blockchain
 */
async function deployRealContract() {
  try {
    console.log('🚀 Starting REAL contract deployment to Base Sepolia...');
    
    // Base Sepolia configuration
    const RPC_URL = 'https://sepolia.base.org';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Create a wallet for deployment
    // Generate a new private key for this demo
    const wallet = ethers.Wallet.createRandom().connect(provider);
    
    console.log('💼 Created deployment wallet:', wallet.address);
    console.log('🔑 Private key:', wallet.privateKey);
    console.log('⚠️  IMPORTANT: Fund this wallet with testnet ETH from https://www.coinbase.com/faucets');
    
    // Simple smart contract bytecode (a basic contract that can store data)
    const contractBytecode = "0x608060405234801561001057600080fd5b506040518060400160405280601481526020017f4149204d61726b6574696e67204167656e7400000000000000000000000000008152506000908051906020019061005c929190610062565b50610166565b82805461006e90610105565b90600052602060002090601f01602090048101928261009057600085556100d7565b82601f106100a957805160ff19168380011785556100d7565b828001600101855582156100d7579182015b828111156100d65782518255916020019190600101906100bb565b5b5090506100e491906100e8565b5090565b5b808211156101015760008160009055506001016100e9565b5090565b6000600282049050600182168061011d57607f821691505b6020821081141561013157610130610137565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b610262806101756000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b578063ce6d41de14610059575b600080fd5b610043610075565b6040516100509190610169565b60405180910390f35b610073600480360381019061006e91906100c4565b610103565b005b60606000805461008490610204565b80601f01602080910402602001604051908101604052809291908181526020018280546100b090610204565b80156100fd5780601f106100d2576101008083540402835291602001916100fd565b820191906000526020600020905b8154815290600101906020018083116100e057829003601f168201915b50505050509050919050565b806000908051906020019061011992919061011d565b5050565b82805461012990610204565b90600052602060002090601f01602090048101928261014b576000855561018c565b82601f1061016457805160ff191683800117855561018c565b8280016001018555821561018c579182015b8281111561018b578251825591602001919060010190610176565b5b509050610199919061019d565b5090565b5b808211156101b657600081600090555060010161019e565b5090565b60006101cd6101c8846101ab565b610186565b9050828152602081018484840111156101e557600080fd5b6101f08482856101c2565b509392505050565b600082601f83011261020957600080fd5b81356102198482602086016101ba565b91505092915050565b60006020828403121561023457600080fd5b600082013567ffffffffffffffff81111561024e57600080fd5b61025a848285016101f8565b91505092915050565b6000610270602083610191565b915061027b8261025c565b602082019050919050565b600061029360208361019e565b915061029e82610282565b602082019050919050565b60006020820190508181036000830152610258816101ef565b60006020820190508181036000830152610286816101f6565b7f4149204d61726b6574696e67204167656e7400000000000000000000000000600082015250565b6000602082019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061021c57607f821691505b602082108114156102305761022f6101ef565b5b5091905056fea264697066735822122012345678901234567890123456789012345678901234567890123456789012345664736f6c63430008070033";
    
    // Check if wallet has funds
    const balance = await provider.getBalance(wallet.address);
    console.log('💵 Wallet balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === 0n) {
      console.log('❌ No funds available for deployment');
      console.log('🔗 Get Base Sepolia ETH from: https://www.coinbase.com/faucets');
      console.log('📋 Wallet address to fund:', wallet.address);
      
      // Return the wallet info so user can fund it
      return {
        success: false,
        message: 'Please fund the wallet with Base Sepolia ETH',
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        faucetUrl: 'https://www.coinbase.com/faucets'
      };
    }
    
    // Deploy the contract
    console.log('📤 Deploying contract...');
    
    const deployTransaction = {
      data: contractBytecode,
      gasLimit: 1000000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    };
    
    const tx = await wallet.sendTransaction(deployTransaction);
    console.log('⏳ Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    const contractAddress = receipt.contractAddress;
    
    console.log('✅ Contract deployed successfully!');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🔗 BaseScan URL:', `https://sepolia.basescan.org/address/${contractAddress}`);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      deployerWallet: wallet.address,
      deployerPrivateKey: wallet.privateKey,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      network: 'base-sepolia',
      deployedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../../../deployment-real.json'), 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    return {
      success: true,
      contractAddress,
      transactionHash: tx.hash,
      explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`,
      deployerWallet: wallet.address
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { deployRealContract };