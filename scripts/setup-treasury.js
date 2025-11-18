/**
 * Treasury Wallet Setup Script
 * 
 * This script:
 * 1. Generates a new treasury wallet
 * 2. Requests airdrop from Solana devnet
 * 3. Saves the private key to .env.local
 * 
 * Run: node scripts/setup-treasury.js
 */

const { 
  Connection, 
  Keypair, 
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Connect to devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function setupTreasury() {
  console.log('\n🏦 TREASURY WALLET SETUP\n');
  console.log('='.repeat(60));

  // Generate new keypair
  const treasuryWallet = Keypair.generate();
  const publicKey = treasuryWallet.publicKey.toString();
  
  // Convert secret key to array format for storage
  const secretKeyArray = Array.from(treasuryWallet.secretKey);
  
  console.log('\n✅ Treasury Wallet Generated!');
  console.log('Public Key:', publicKey);
  console.log('\n⚠️  IMPORTANT: Keep the private key secure!\n');

  // Request airdrop
  console.log('💰 Requesting 2 SOL airdrop from devnet...');
  try {
    const signature = await connection.requestAirdrop(
      treasuryWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    
    console.log('⏳ Waiting for confirmation...');
    await connection.confirmTransaction(signature);
    
    console.log('✅ Airdrop successful!');
    console.log('🔗 https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    
    // Check balance
    const balance = await connection.getBalance(treasuryWallet.publicKey);
    console.log(`\n💰 Treasury Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    console.log('⚠️  Airdrop failed:', error.message);
    console.log('You can manually fund this wallet at: https://faucet.solana.com');
    console.log('Wallet address:', publicKey);
  }

  // Save to .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = `
# Treasury Wallet for Solana Transactions
# Generated: ${new Date().toISOString()}
# Public Key: ${publicKey}
TREASURY_SECRET_KEY=[${secretKeyArray.join(',')}]
NEXT_PUBLIC_TREASURY_PUBLIC_KEY=${publicKey}
`;

  try {
    // Check if .env.local exists
    let existingContent = '';
    if (fs.existsSync(envPath)) {
      existingContent = fs.readFileSync(envPath, 'utf8');
      
      // Remove old treasury keys if they exist
      existingContent = existingContent
        .split('\n')
        .filter(line => 
          !line.includes('TREASURY_SECRET_KEY') && 
          !line.includes('NEXT_PUBLIC_TREASURY_PUBLIC_KEY') &&
          !line.includes('Treasury Wallet for Solana') &&
          !line.includes('Generated:') &&
          !line.includes('Public Key:')
        )
        .join('\n')
        .trim();
    }

    // Append new treasury config
    const finalContent = existingContent 
      ? existingContent + '\n' + envContent 
      : envContent;

    fs.writeFileSync(envPath, finalContent);
    console.log('\n✅ Treasury configuration saved to .env.local');
  } catch (error) {
    console.error('\n❌ Failed to save to .env.local:', error.message);
    console.log('\n📋 Please manually add this to your .env.local file:');
    console.log(envContent);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ SETUP COMPLETE!');
  console.log('\n📝 Next Steps:');
  console.log('1. Restart your development server');
  console.log('2. Transactions will now be sent to Solana devnet');
  console.log('3. Check explorer links to verify memos');
  console.log('\n💡 Treasury Info:');
  console.log('   Public Key:', publicKey);
  console.log('   Balance: Check at https://explorer.solana.com/address/' + publicKey + '?cluster=devnet');
  console.log('\n⚠️  Security:');
  console.log('   - Never commit .env.local to git');
  console.log('   - Keep your private key secure');
  console.log('   - Use different wallet for mainnet');
  console.log('='.repeat(60) + '\n');
}

setupTreasury().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
