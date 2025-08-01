const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Main chat endpoint for AI conversations
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, platform = 'web' } = req.body;
    const { aiOrchestrator } = req.app.locals;

    if (!message || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: message and userId'
      });
    }

    logger.info(`Chat request from ${platform} user ${userId}`);

    // Process the query through AI orchestrator
    const result = await aiOrchestrator.processQuery(message, userId, platform);

    res.json({
      success: true,
      response: result.response,
      intent: result.intent,
      confidence: result.confidence,
      suggestedActions: result.suggestedActions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Wallet analysis endpoint
 */
router.post('/analyze/wallet', async (req, res) => {
  try {
    const { walletAddress, options = {} } = req.body;
    const { bitsCrunchAPI, aiOrchestrator } = req.app.locals;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'Missing required field: walletAddress'
      });
    }

    logger.info(`Wallet analysis request for: ${walletAddress}`);

    // Get wallet data from bitsCrunch
    const walletData = await bitsCrunchAPI.analyzeWallet(walletAddress, options);
    const riskData = await bitsCrunchAPI.getWalletRiskScore(walletAddress, options);

    if (!walletData.success) {
      return res.status(400).json({
        error: 'Failed to analyze wallet',
        details: walletData.error
      });
    }

    // Synthesize the data using AI
    const synthesis = await aiOrchestrator.synthesizeData(
      { wallet: walletData.data, risk: riskData.data },
      { type: 'wallet_analysis', confidence: 0.9 },
      `Analyze wallet ${walletAddress}`
    );

    res.json({
      success: true,
      wallet: walletAddress,
      analysis: synthesis,
      data: {
        wallet: walletData.data,
        risk: riskData.data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in wallet analysis:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Collection analysis endpoint
 */
router.post('/analyze/collection', async (req, res) => {
  try {
    const { collectionAddress, options = {} } = req.body;
    const { bitsCrunchAPI, aiOrchestrator } = req.app.locals;

    if (!collectionAddress) {
      return res.status(400).json({
        error: 'Missing required field: collectionAddress'
      });
    }

    logger.info(`Collection analysis request for: ${collectionAddress}`);

    // Get collection data from bitsCrunch
    const collectionData = await bitsCrunchAPI.analyzeCollection(collectionAddress, options);
    const healthData = await bitsCrunchAPI.getCollectionHealth(collectionAddress, options);
    const metricsData = await bitsCrunchAPI.getCollectionMetrics(collectionAddress, options);

    if (!collectionData.success) {
      return res.status(400).json({
        error: 'Failed to analyze collection',
        details: collectionData.error
      });
    }

    // Synthesize the data using AI
    const synthesis = await aiOrchestrator.synthesizeData(
      { 
        collection: collectionData.data, 
        health: healthData.data, 
        metrics: metricsData.data 
      },
      { type: 'collection_analysis', confidence: 0.9 },
      `Analyze collection ${collectionAddress}`
    );

    res.json({
      success: true,
      collection: collectionAddress,
      analysis: synthesis,
      data: {
        collection: collectionData.data,
        health: healthData.data,
        metrics: metricsData.data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in collection analysis:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Market insights endpoint
 */
router.post('/market/insights', async (req, res) => {
  try {
    const { options = {} } = req.body;
    const { bitsCrunchAPI, aiOrchestrator } = req.app.locals;

    logger.info('Market insights request');

    // Get market data from bitsCrunch
    const marketData = await bitsCrunchAPI.getMarketInsights(options);
    const transactionData = await bitsCrunchAPI.getTransactionMonitoring(options);

    if (!marketData.success) {
      return res.status(400).json({
        error: 'Failed to get market insights',
        details: marketData.error
      });
    }

    // Synthesize the data using AI
    const synthesis = await aiOrchestrator.synthesizeData(
      { market: marketData.data, transactions: transactionData.data },
      { type: 'market_insights', confidence: 0.8 },
      'Provide market insights and trends'
    );

    res.json({
      success: true,
      analysis: synthesis,
      data: {
        market: marketData.data,
        transactions: transactionData.data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in market insights:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Risk assessment endpoint
 */
router.post('/risk/assessment', async (req, res) => {
  try {
    const { walletAddress, collectionAddress, options = {} } = req.body;
    const { bitsCrunchAPI, aiOrchestrator } = req.app.locals;

    if (!walletAddress && !collectionAddress) {
      return res.status(400).json({
        error: 'Missing required field: walletAddress or collectionAddress'
      });
    }

    logger.info(`Risk assessment request for wallet: ${walletAddress}, collection: ${collectionAddress}`);

    const data = {};

    // Get wallet risk data if provided
    if (walletAddress) {
      const walletData = await bitsCrunchAPI.analyzeWallet(walletAddress, options);
      const riskData = await bitsCrunchAPI.getWalletRiskScore(walletAddress, options);
      data.wallet = { analysis: walletData.data, risk: riskData.data };
    }

    // Get collection risk data if provided
    if (collectionAddress) {
      const collectionData = await bitsCrunchAPI.analyzeCollection(collectionAddress, options);
      const healthData = await bitsCrunchAPI.getCollectionHealth(collectionAddress, options);
      data.collection = { analysis: collectionData.data, health: healthData.data };
    }

    // Get market context
    const marketData = await bitsCrunchAPI.getMarketInsights({ timeframe: '7d' });
    data.market = marketData.data;

    // Synthesize risk assessment using AI
    const synthesis = await aiOrchestrator.synthesizeData(
      data,
      { type: 'risk_assessment', confidence: 0.9 },
      `Assess risk for wallet: ${walletAddress}, collection: ${collectionAddress}`
    );

    res.json({
      success: true,
      assessment: synthesis,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in risk assessment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Search collections endpoint
 */
router.get('/search/collections', async (req, res) => {
  try {
    const { q, options = {} } = req.query;
    const { bitsCrunchAPI } = req.app.locals;

    if (!q) {
      return res.status(400).json({
        error: 'Missing required query parameter: q'
      });
    }

    logger.info(`Collection search request for: ${q}`);

    const searchData = await bitsCrunchAPI.searchCollections(q, options);

    res.json({
      success: true,
      query: q,
      results: searchData.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in collection search:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Fraud alerts endpoint
 */
router.get('/fraud/alerts', async (req, res) => {
  try {
    const { options = {} } = req.query;
    const { bitsCrunchAPI } = req.app.locals;

    logger.info('Fraud alerts request');

    const alertsData = await bitsCrunchAPI.getFraudAlerts(options);

    res.json({
      success: true,
      alerts: alertsData.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error in fraud alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Conversation history endpoint
 */
router.get('/conversation/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform = 'web' } = req.query;
    const { aiOrchestrator } = req.app.locals;

    logger.info(`Conversation history request for user: ${userId}`);

    const history = aiOrchestrator.getConversationHistory(userId, platform);

    res.json({
      success: true,
      userId,
      platform,
      history,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting conversation history:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Clear conversation memory endpoint
 */
router.delete('/conversation/memory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform = 'web' } = req.query;
    const { aiOrchestrator } = req.app.locals;

    logger.info(`Clear memory request for user: ${userId}`);

    aiOrchestrator.clearMemory(userId, platform);

    res.json({
      success: true,
      message: 'Conversation memory cleared',
      userId,
      platform,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error clearing conversation memory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * API status and health check
 */
router.get('/status', async (req, res) => {
  try {
    const { bitsCrunchAPI } = req.app.locals;

    // Test bitsCrunch API connection
    const apiStatus = await bitsCrunchAPI.testConnection();

    res.json({
      success: true,
      status: 'operational',
      services: {
        web_api: true,
        bitscrunch_api: apiStatus.success,
        ai_orchestrator: true
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });

  } catch (error) {
    logger.error('Error in status check:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router; 