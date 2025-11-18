/**
 * Arcium Integration Test Suite
 * Verifies all Arcium features are properly implemented
 */

import { getArciumClient, ArciumClient } from '@/lib/arcium/client';
import { getArciumMXE, ArciumMXE } from '@/lib/arcium';
import { createPrivateAuction } from '@/lib/arcium/features/privateAuction';
import { createPrivateIdentity } from '@/lib/arcium/features/privateIdentity';
import { createPrivateAnalytics } from '@/lib/arcium/features/privateAnalytics';
import { PublicKey } from '@solana/web3.js';

/**
 * Test 1: Arcium Client Initialization
 */
export async function testArciumClientInit(): Promise<boolean> {
  try {
    console.log('🧪 Test 1: Arcium Client Initialization');
    
    const client = getArciumClient();
    const publicKey = client.getPublicKey();
    const status = await client.getMXEStatus();
    
    console.log('  ✅ Client initialized');
    console.log('  ✅ Public key:', publicKey.substring(0, 20) + '...');
    console.log('  ✅ MXE Status:', status);
    
    return status.online && status.nodes > 0;
  } catch (error) {
    console.error('  ❌ Client initialization failed:', error);
    return false;
  }
}

/**
 * Test 2: Encryption & Decryption
 */
export async function testEncryption(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 2: Encryption & Decryption');
    
    const client = getArciumClient();
    
    const testData = {
      stationId: 'test_station',
      kwh: 25.5,
      cost: 12.75,
      location: { lat: 40.7128, lng: -74.0060 },
      timestamp: Date.now()
    };
    
    // Encrypt
    const encrypted = await client.encryptForMXE(testData);
    console.log('  ✅ Data encrypted');
    console.log('  ✅ Ciphertext:', encrypted.ciphertext.substring(0, 20) + '...');
    
    // Decrypt
    const decrypted = await client.decryptFromMXE(encrypted);
    console.log('  ✅ Data decrypted');
    
    const match = JSON.stringify(testData) === JSON.stringify(decrypted);
    console.log('  ✅ Data integrity:', match ? 'PASS' : 'FAIL');
    
    return match;
  } catch (error) {
    console.error('  ❌ Encryption test failed:', error);
    return false;
  }
}

/**
 * Test 3: Zero-Knowledge Proof Generation
 */
export async function testZKProof(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 3: Zero-Knowledge Proof Generation');
    
    const client = getArciumClient();
    const testWallet = new PublicKey('11111111111111111111111111111111');
    
    const proof = await client.generateZKProof(
      { secret: 'hidden_value' },
      { public: 'visible_value' },
      'test_circuit'
    );
    
    console.log('  ✅ ZK Proof generated');
    console.log('  ✅ Proof:', proof.proof.substring(0, 20) + '...');
    console.log('  ✅ Public inputs:', proof.publicInputs);
    
    // Verify proof
    const verified = await client.verifyZKProofOnChain(proof, testWallet);
    console.log('  ✅ Proof verified:', verified ? 'PASS' : 'FAIL');
    
    return verified;
  } catch (error) {
    console.error('  ❌ ZK Proof test failed:', error);
    return false;
  }
}

/**
 * Test 4: Private Charging Session
 */
export async function testPrivateCharging(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 4: Private Charging Session');
    
    const mxe = getArciumMXE();
    
    const sessionData = {
      stationId: 'station_001',
      kwh: 25.5,
      cost: 12.75,
      location: { lat: 40.7128, lng: -74.0060 },
      timestamp: Date.now()
    };
    
    // Encrypt
    const encrypted = mxe.encryptChargingData(sessionData);
    console.log('  ✅ Session data encrypted');
    
    // Compute rewards
    const rewards = await mxe.computePrivateRewards(encrypted);
    console.log('  ✅ Rewards computed:', rewards);
    
    // Generate proof
    const proof = await mxe.generateZKProof(sessionData, rewards);
    console.log('  ✅ ZK Proof generated');
    
    // Verify
    const testWallet = new PublicKey('11111111111111111111111111111111');
    const verified = await mxe.verifyZKProofOnChain(proof, testWallet);
    console.log('  ✅ Proof verified:', verified ? 'PASS' : 'FAIL');
    
    return verified && rewards.evTokens === 25.5;
  } catch (error) {
    console.error('  ❌ Private charging test failed:', error);
    return false;
  }
}

/**
 * Test 5: Private Auction
 */
export async function testPrivateAuction(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 5: Private Auction');
    
    const client = getArciumClient();
    const auction = createPrivateAuction(client);
    const testWallet = new PublicKey('11111111111111111111111111111111');
    
    // Create auction
    const auctionId = await auction.createAuction(
      'fast_charge',
      'Test auction',
      30,
      25
    );
    console.log('  ✅ Auction created:', auctionId);
    
    // Submit bid
    const bidId = await auction.submitSealedBid(auctionId, testWallet, 40);
    console.log('  ✅ Sealed bid submitted:', bidId);
    
    // End auction
    const result = await auction.endAuction(auctionId);
    console.log('  ✅ Auction ended, winner:', result.winner.substring(0, 8) + '...');
    
    // Check win status
    const status = await auction.checkWinStatus(auctionId, testWallet);
    console.log('  ✅ Win status checked:', status.won ? 'WON' : 'LOST');
    
    return result.settled && status.proof !== undefined;
  } catch (error) {
    console.error('  ❌ Private auction test failed:', error);
    return false;
  }
}

/**
 * Test 6: Private Identity
 */
export async function testPrivateIdentity(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 6: Private Identity');
    
    const client = getArciumClient();
    const identity = createPrivateIdentity(client);
    const testWallet = new PublicKey('11111111111111111111111111111111');
    
    // Add attributes
    await identity.addAttribute('age', 25);
    console.log('  ✅ Age attribute added (encrypted)');
    
    await identity.addAttribute('location', { country: 'USA' });
    console.log('  ✅ Location attribute added (encrypted)');
    
    // Prove age
    const ageProof = await identity.proveAgeOver(18, testWallet);
    console.log('  ✅ Age proof generated:', ageProof.claim);
    console.log('  ✅ Verified:', ageProof.verified ? 'PASS' : 'FAIL');
    
    // Prove location
    const locationProof = await identity.proveLocationInRegion('USA', testWallet);
    console.log('  ✅ Location proof generated:', locationProof.claim);
    console.log('  ✅ Verified:', locationProof.verified ? 'PASS' : 'FAIL');
    
    return ageProof.verified && locationProof.verified;
  } catch (error) {
    console.error('  ❌ Private identity test failed:', error);
    return false;
  }
}

/**
 * Test 7: Private Analytics
 */
export async function testPrivateAnalytics(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 7: Private Analytics');
    
    const client = getArciumClient();
    const analytics = createPrivateAnalytics(client);
    
    // Add data points
    await analytics.addDataPoint('user1', 'kwh_charged', 25.5);
    await analytics.addDataPoint('user2', 'kwh_charged', 30.2);
    await analytics.addDataPoint('user3', 'kwh_charged', 18.7);
    console.log('  ✅ Data points added (encrypted)');
    
    // Compute aggregate
    const aggregate = await analytics.computeAggregate('kwh_charged');
    console.log('  ✅ Aggregate computed:', aggregate);
    console.log('  ✅ Average:', aggregate.average?.toFixed(2));
    console.log('  ✅ Count:', aggregate.count);
    
    // Compare user
    const comparison = await analytics.compareToAggregate('user1', 'kwh_charged');
    console.log('  ✅ User comparison:', comparison);
    console.log('  ✅ Above average:', comparison.aboveAverage);
    console.log('  ✅ Percentile:', comparison.percentile);
    
    return aggregate.count === 3 && aggregate.proof.length > 0;
  } catch (error) {
    console.error('  ❌ Private analytics test failed:', error);
    return false;
  }
}

/**
 * Test 8: MXE Compute Job
 */
export async function testMXEComputeJob(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 8: MXE Compute Job');
    
    const client = getArciumClient();
    
    const testData = { value: 12345 };
    const encrypted = await client.encryptForMXE(testData);
    
    // Submit job
    const job = await client.submitComputeJob(encrypted, 'test_computation');
    console.log('  ✅ Compute job submitted:', job.jobId);
    console.log('  ✅ Status:', job.status);
    console.log('  ✅ MXE Node:', encrypted.mxeNodeId);
    
    // Get result
    const result = await client.getComputeResult(job.jobId);
    console.log('  ✅ Result retrieved:', result.status);
    
    return result.status === 'completed';
  } catch (error) {
    console.error('  ❌ MXE compute job test failed:', error);
    return false;
  }
}

/**
 * Test 9: Confidential Transaction
 */
export async function testConfidentialTransaction(): Promise<boolean> {
  try {
    console.log('\n🧪 Test 9: Confidential Transaction');
    
    const client = getArciumClient();
    const from = new PublicKey('11111111111111111111111111111111');
    const to = new PublicKey('22222222222222222222222222222222');
    
    const { transaction, proof } = await client.createConfidentialTransaction(
      from,
      to,
      100,
      'USD'
    );
    
    console.log('  ✅ Confidential transaction created');
    console.log('  ✅ Proof generated:', proof.proof.substring(0, 20) + '...');
    console.log('  ✅ Transaction ready');
    
    return proof.proof.length > 0;
  } catch (error) {
    console.error('  ❌ Confidential transaction test failed:', error);
    return false;
  }
}

/**
 * Run All Tests
 */
export async function runAllTests(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     🔐 ARCIUM INTEGRATION TEST SUITE                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const tests = [
    { name: 'Client Initialization', fn: testArciumClientInit },
    { name: 'Encryption & Decryption', fn: testEncryption },
    { name: 'Zero-Knowledge Proofs', fn: testZKProof },
    { name: 'Private Charging', fn: testPrivateCharging },
    { name: 'Private Auction', fn: testPrivateAuction },
    { name: 'Private Identity', fn: testPrivateIdentity },
    { name: 'Private Analytics', fn: testPrivateAnalytics },
    { name: 'MXE Compute Job', fn: testMXEComputeJob },
    { name: 'Confidential Transaction', fn: testConfidentialTransaction },
  ];
  
  const results: { name: string; passed: boolean }[] = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`\n❌ Test "${test.name}" threw an error:`, error);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     📊 TEST RESULTS                                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`  ${icon} ${result.name}: ${status}`);
  });
  
  console.log(`\n  Total: ${passed}/${total} tests passed`);
  console.log(`  Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (passed === total) {
    console.log('  🎉 All tests passed! Arcium is properly integrated.\n');
  } else {
    console.log('  ⚠️  Some tests failed. Please review the errors above.\n');
  }
}

// Export for use in other files
export default {
  runAllTests,
  testArciumClientInit,
  testEncryption,
  testZKProof,
  testPrivateCharging,
  testPrivateAuction,
  testPrivateIdentity,
  testPrivateAnalytics,
  testMXEComputeJob,
  testConfidentialTransaction,
};
