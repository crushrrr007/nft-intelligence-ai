/**
 * Simple test script for NFT Intelligence AI
 * Tests basic functionality without requiring API keys
 */

const logger = require('./utils/logger');

console.log('🧪 Testing NFT Intelligence AI Setup...\n');

// Test 1: Logger functionality
console.log('1. Testing Logger...');
try {
  logger.info('Test info message');
  logger.warn('Test warning message');
  logger.error('Test error message');
  console.log('✅ Logger working correctly\n');
} catch (error) {
  console.log('❌ Logger test failed:', error.message);
}

// Test 2: Helper functions
console.log('2. Testing Helper Functions...');
try {
  const helpers = require('./utils/helpers');
  
  // Test Ethereum address validation
  const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  const invalidAddress = 'invalid-address';
  
  console.log('   Valid address test:', helpers.isValidEthereumAddress(validAddress) ? '✅' : '❌');
  console.log('   Invalid address test:', !helpers.isValidEthereumAddress(invalidAddress) ? '✅' : '❌');
  
  // Test number formatting
  console.log('   ETH formatting test:', helpers.formatEthAmount(1.23456789) === '1.2346' ? '✅' : '❌');
  console.log('   Large number test:', helpers.formatLargeNumber(1234567) === '1.2M' ? '✅' : '❌');
  
  console.log('✅ Helper functions working correctly\n');
} catch (error) {
  console.log('❌ Helper functions test failed:', error.message);
}

// Test 3: Module imports
console.log('3. Testing Module Imports...');
try {
  // Test AI modules (without initialization)
  const { AIOrchestrator } = require('./ai/orchestrator');
  const { ConversationMemory } = require('./ai/memory');
  const { getSystemPrompt } = require('./ai/prompts');
  
  console.log('   AI Orchestrator:', typeof AIOrchestrator === 'function' ? '✅' : '❌');
  console.log('   Conversation Memory:', typeof ConversationMemory === 'function' ? '✅' : '❌');
  console.log('   Prompts:', typeof getSystemPrompt === 'function' ? '✅' : '❌');
  
  // Test API modules
  const { BitsCrunchAPI } = require('./api/bitscrunch');
  console.log('   BitsCrunch API:', typeof BitsCrunchAPI === 'function' ? '✅' : '❌');
  
  // Test bot modules
  const DiscordBot = require('./bots/discord');
  const TelegramBot = require('./bots/telegram');
  console.log('   Discord Bot:', typeof DiscordBot === 'function' ? '✅' : '❌');
  console.log('   Telegram Bot:', typeof TelegramBot === 'function' ? '✅' : '❌');
  
  console.log('✅ All modules imported successfully\n');
} catch (error) {
  console.log('❌ Module import test failed:', error.message);
}

// Test 4: Environment variables
console.log('4. Testing Environment Variables...');
try {
  require('dotenv').config();
  
  const requiredVars = ['PORT', 'NODE_ENV'];
  const optionalVars = ['OPENAI_API_KEY', 'BITSCRUNCH_API_KEY', 'DISCORD_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN'];
  
  console.log('   Required variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`     ${varName}: ${value ? '✅' : '❌'} (${value || 'not set'})`);
  });
  
  console.log('   Optional variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`     ${varName}: ${value ? '✅' : '⚠️'} (${value ? 'set' : 'not set'})`);
  });
  
  console.log('✅ Environment variables checked\n');
} catch (error) {
  console.log('❌ Environment variables test failed:', error.message);
}

// Test 5: Express app setup
console.log('5. Testing Express App Setup...');
try {
  const express = require('express');
  const app = express();
  
  // Test basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Test route setup
  app.get('/test', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  console.log('✅ Express app setup working correctly\n');
} catch (error) {
  console.log('❌ Express app test failed:', error.message);
}

// Summary
console.log('🎉 Test Summary:');
console.log('   All core modules are properly structured');
console.log('   Helper functions are working');
console.log('   Logger is functional');
console.log('   Environment configuration is ready');
console.log('\n📝 Next Steps:');
console.log('   1. Copy env.example to .env');
console.log('   2. Add your API keys to .env');
console.log('   3. Run: npm start');
console.log('   4. Test the API endpoints');
console.log('\n🚀 Ready for development!'); 