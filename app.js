require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import our core modules
const { AIOrchestrator } = require('./ai/orchestrator');
const { BitsCrunchAPI } = require('./api/bitscrunch');
const { MockBitsCrunchAPI } = require('./api/mock-bitscrunch'); // Add this
const webRoutes = require('./api/routes');
const DiscordBot = require('./bots/discord');
const TelegramBot = require('./bots/telegram');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize core services - USE MOCK API IN DEMO MODE
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.BITSCRUNCH_API_KEY;

let bitsCrunchAPI;
if (isDemoMode) {
  console.log('🎬 Running in DEMO MODE with Mock API');
  bitsCrunchAPI = new MockBitsCrunchAPI();
} else {
  console.log('🔗 Running with Real bitsCrunch API');
  bitsCrunchAPI = new BitsCrunchAPI(process.env.BITSCRUNCH_API_KEY);
}

const aiOrchestrator = new AIOrchestrator({
  provider: process.env.AI_PROVIDER || 'openai',
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  model: process.env.AI_MODEL || 'gpt-3.5-turbo'
});

// Make services available to routes
app.locals.bitsCrunchAPI = bitsCrunchAPI;
app.locals.aiOrchestrator = aiOrchestrator;

// Routes
app.use('/api', webRoutes);

// Add demo route for hackathon judges
app.get('/demo', (req, res) => {
  res.json({
    message: '🎉 NFT Intelligence AI - Hackathon Demo',
    features: [
      '🤖 Advanced AI Orchestration',
      '🔮 Predictive Market Analysis',
      '💬 Cross-Platform Memory',
      '🚨 Real-time Fraud Detection',
      '📊 Multi-Model Predictions'
    ],
    endpoints: {
      chat: 'POST /api/chat',
      analyze_wallet: 'POST /api/analyze/wallet',
      analyze_collection: 'POST /api/analyze/collection',
      market_insights: 'POST /api/market/insights',
      risk_assessment: 'POST /api/risk/assessment'
    },
    demo_queries: [
      'Analyze wallet 0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
      'What\'s the market trend for NFTs?',
      'Predict floor price for Bored Ape Yacht Club',
      'Is wallet 0x1234567890123456789012345678901234567890 safe?'
    ],
    mode: isDemoMode ? 'DEMO (Mock Data)' : 'PRODUCTION (Real API)',
    status: 'Ready for bitsCrunch x AI Builders Hack 2025! 🚀'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: isDemoMode ? 'demo' : 'production',
    services: {
      web_api: true,
      discord_bot: process.env.ENABLE_DISCORD_BOT === 'true',
      telegram_bot: process.env.ENABLE_TELEGRAM_BOT === 'true',
      ai_orchestrator: true,
      bitscrunch_api: true,
      mock_api: isDemoMode
    },
    hackathon: 'bitsCrunch x AI Builders Hack 2025',
    ready_for_demo: true
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize bots if enabled
if (process.env.ENABLE_DISCORD_BOT === 'true' && process.env.DISCORD_BOT_TOKEN) {
  const discordBot = new DiscordBot(process.env.DISCORD_BOT_TOKEN, {
    bitsCrunchAPI,
    aiOrchestrator
  });
  discordBot.initialize();
  console.log('✅ Discord bot initialized');
}

if (process.env.ENABLE_TELEGRAM_BOT === 'true' && process.env.TELEGRAM_BOT_TOKEN) {
  const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    bitsCrunchAPI,
    aiOrchestrator
  });
  telegramBot.initialize();
  console.log('✅ Telegram bot initialized');
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NFT Intelligence AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎬 Demo page: http://localhost:${PORT}/demo`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);
  console.log(`🔗 bitsCrunch API: ${isDemoMode ? 'Mock (Demo Mode)' : 'Connected'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 Environment: Development`);
    console.log(`🔧 Available endpoints:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /demo - Demo information`);
    console.log(`   POST /api/analyze/wallet - Wallet analysis`);
    console.log(`   POST /api/analyze/collection - Collection analysis`);
    console.log(`   POST /api/chat - AI conversation`);
  }
  
  console.log(`\n🏆 Ready for bitsCrunch x AI Builders Hack 2025!`);
});

module.exports = app;