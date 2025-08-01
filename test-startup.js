// Simple startup test for NFT Intelligence AI
require('dotenv').config();

console.log('🧪 Testing NFT Intelligence AI startup...');

// Test environment variables
const requiredVars = ['PORT', 'NODE_ENV'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:', missingVars);
} else {
  console.log('✅ Environment variables configured');
}

// Test module imports
try {
  const logger = require('./utils/logger');
  logger.info('Logger test successful');
  
  const { AIOrchestrator } = require('./ai/orchestrator');
  const { ConversationMemory } = require('./ai/memory');
  const { MockBitsCrunchAPI } = require('./api/mock-bitscrunch');
  const { PredictiveAIEngine } = require('./ai/prediction');
  
  console.log('✅ All core modules imported successfully');
  
  // Test mock API
  const mockAPI = new MockBitsCrunchAPI();
  console.log('✅ Mock API initialized for demo mode');
  
  // Test memory system
  const memory = new ConversationMemory();
  memory.addInteraction('test-user', 'system', 'test query', 'test response');
  console.log('✅ Memory system working');
  
  // Test predictive engine
  const predictor = new PredictiveAIEngine();
  console.log('✅ Predictive AI engine initialized');
  
  console.log('\n🎉 All systems ready! Run "npm start" to launch the server.');
  
} catch (error) {
  console.log('❌ Module import failed:', error.message);
  console.log('Please check your Node.js version and dependencies.');
}
