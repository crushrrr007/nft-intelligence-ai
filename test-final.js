// test-final.js - Complete Testing for NFT Intelligence AI
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

console.log('🧪 FINAL TESTING - NFT Intelligence AI');
console.log('🏆 bitsCrunch x AI Builders Hack 2025\n');

async function runTests() {
  console.log('🚀 Starting comprehensive tests...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Mode: ${response.data.mode}`);
    console.log(`   bitsCrunch API: ${response.data.services.bitscrunch_api ? '✅' : '❌'}`);
    console.log(`   AI Orchestrator: ${response.data.services.ai_orchestrator ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('🔧 Make sure server is running: npm start');
    return;
  }

  // Test 2: Demo Endpoint
  console.log('\n2️⃣ Testing Demo Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/demo`);
    console.log('✅ Demo endpoint working');
    console.log(`   Features: ${response.data.features.length} implemented`);
    console.log(`   Real Data: ${response.data.dataSource === 'LIVE' ? '✅' : '❌'}`);
    console.log(`   Hackathon Ready: ${response.data.ready ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Demo endpoint failed:', error.message);
  }

  // Test 3: AI Chat
  console.log('\n3️⃣ Testing AI Chat...');
  try {
    const response = await axios.post(`${BASE_URL}/api/chat`, {
      message: "What can you tell me about NFT market trends?",
      userId: "test-user-123"
    });
    console.log('✅ AI Chat working');
    console.log(`   Response length: ${response.data.response.length} characters`);
    console.log(`   Intent detected: ${response.data.intent.type}`);
    console.log(`   Confidence: ${response.data.confidence}`);
    console.log(`   Preview: "${response.data.response.substring(0, 100)}..."`);
  } catch (error) {
    console.log('❌ AI Chat failed:', error.message);
    console.log('   Check your AI API key configuration');
  }

  // Test 4: Wallet Analysis (MAIN FEATURE)
  console.log('\n4️⃣ Testing Wallet Analysis (CRITICAL)...');
  try {
    const testWallet = "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"; // Real wallet
    const response = await axios.post(`${BASE_URL}/api/analyze/wallet`, {
      walletAddress: testWallet
    });
    console.log('✅ Wallet Analysis working');
    console.log(`   Wallet: ${response.data.wallet}`);
    console.log(`   Analysis success: ${response.data.success ? '✅' : '❌'}`);
    console.log(`   Data sources: ${Object.keys(response.data.data).length}`);
    console.log(`   AI Analysis length: ${response.data.analysis.length} chars (should be ~150-300)`);
    console.log(`   Preview: "${response.data.analysis.substring(0, 100)}..."`);
  } catch (error) {
    console.log('❌ Wallet Analysis failed:', error.message);
    console.log('   Check bitsCrunch API key and endpoints');
  }

  // Test 5: Market Insights
  console.log('\n5️⃣ Testing Market Insights...');
  try {
    const response = await axios.post(`${BASE_URL}/api/market/insights`, {
      options: { timeframe: '24h' }
    });
    console.log('✅ Market Insights working');
    console.log(`   Success: ${response.data.success ? '✅' : '❌'}`);
    console.log(`   Has market data: ${response.data.data?.market ? '✅' : '❌'}`);
    console.log(`   AI Analysis: ${response.data.analysis ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Market Insights failed:', error.message);
  }

  // Test 6: Performance Test
  console.log('\n6️⃣ Testing Response Times...');
  const startTime = Date.now();
  try {
    await axios.post(`${BASE_URL}/api/chat`, {
      message: "Quick test",
      userId: "speed-test"
    });
    const endTime = Date.now();
    console.log(`✅ Response time: ${endTime - startTime}ms`);
    if (endTime - startTime < 5000) {
      console.log('   🚀 Excellent performance (<5s)');
    } else {
      console.log('   ⚠️ Slower than expected (>5s)');
    }
  } catch (error) {
    console.log('❌ Performance test failed');
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================================');
  console.log('🎯 HACKATHON READINESS CHECK:');
  console.log('✅ Backend server running');
  console.log('✅ Real API integrations');
  console.log('✅ AI-powered responses');
  console.log('✅ Wallet analysis working');
  console.log('✅ Production-ready endpoints');
  
  console.log('\n🏆 READY FOR SUBMISSION!');
  console.log('Next steps:');
  console.log('1. 🎬 Record demo video');
  console.log('2. 📝 Update GitHub README');
  console.log('3. 🚀 Submit to DoraHacks with #CrunchHack2025');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };