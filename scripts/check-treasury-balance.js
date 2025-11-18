/**
 * Check Treasury Wallet Balance
 * 
 * Run: node scripts/check-treasury-balance.js
 */

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function checkBalance() {
  console.log('\n💰 CHECKING TREASURY BALANCE\n');
  console.log('='.repeat(60));

  // Read .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ No .env.local file found!');
    console.log('Run: node scripts/setup-treasury.js');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const secretKeyMatch = envContent.match(/TREASURY_SECRET_KEY=\[(.*?)\]/);
  const publicKeyMatch = envContent.match(/NEXT_PUBLIC_TREASURY_PUBLIC_KEY=(.*)/);

  if (!secretKeyMatch || !publicKeyMatch) {
    console.log('❌ Treasury keys not found in .env.local');
    console.log('Run: node scripts/setup-treasury.js');
    return;
  }

  const publicKey = publicKeyMatch[1].trim();
  console.log('📍 Treasury Address:', publicKey);
  console.log('🔗 Explorer:', `https://explorer.solana.com/address/${publicKey}?cluster=devnet`);

  try {
    const secretKeyArray = JSON.parse('[' + secretKeyMatch[1] + ']');
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
    
    const balance = await connection.getBalance(keypair.publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    console.log('\n💰 Balance:', solBalance, 'SOL');

    if (solBalance === 0) {
      console.log('\n❌ TREASURY HAS NO SOL!');
      console.log('\n📝 To fund your treasury:');
      console.log('1. Go to: https://faucet.solana.com');
      console.log('2. Paste address:', publicKey);
      console.log('3. Request 1-2 SOL');
      console.log('4. Wait for confirmation');
      console.log('5. Restart your dev server');
    } else if (solBalance < 0.1) {
      console.log('\n⚠️  Low balance! Consider adding more SOL');
      console.log('Fund at: https://faucet.solana.com');
    } else {
      console.log('\n✅ Treasury is funded and ready!');
      console.log(`📊 Can send ~${Math.floor(solBalance / 0.000005)} transactions`);
    }

  } catch (error) {
    console.error('\n❌ Error checking balance:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

checkBalance().catch(console.error);
