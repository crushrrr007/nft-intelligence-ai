const axios = require('axios');
const logger = require('../utils/logger');

class BitsCrunchAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.bitscrunch.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    logger.info('BitsCrunch API client initialized');
  }

  /**
   * Analyze wallet behavior and risk profile
   */
  async analyzeWallet(walletAddress, options = {}) {
    try {
      logger.info(`Analyzing wallet: ${walletAddress}`);
      
      const params = {
        address: walletAddress,
        chain: options.chain || 'ethereum',
        timeframe: options.timeframe || '30d',
        include_transactions: options.includeTransactions || false,
        include_holdings: options.includeHoldings || true,
        include_metrics: options.includeMetrics || true
      };

      const response = await this.client.get('/wallet/analysis', { params });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error analyzing wallet ${walletAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet risk score and assessment
   */
  async getWalletRiskScore(walletAddress, options = {}) {
    try {
      logger.info(`Getting risk score for wallet: ${walletAddress}`);
      
      const params = {
        address: walletAddress,
        chain: options.chain || 'ethereum',
        include_details: options.includeDetails || true
      };

      const response = await this.client.get('/wallet/risk-score', { params });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting risk score for ${walletAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze NFT collection performance
   */
  async analyzeCollection(collectionAddress, options = {}) {
    try {
      logger.info(`Analyzing collection: ${collectionAddress}`);
      
      const params = {
        address: collectionAddress,
        chain: options.chain || 'ethereum',
        timeframe: options.timeframe || '30d',
        include_metrics: options.includeMetrics || true,
        include_trends: options.includeTrends || true,
        include_holders: options.includeHolders || false
      };

      const response = await this.client.get('/collection/analysis', { params });
      
      return {
        success: true,
        data: response.data,
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error analyzing collection ${collectionAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get collection health metrics
   */
  async getCollectionHealth(collectionAddress, options = {}) {
    try {
      logger.info(`Getting health metrics for collection: ${collectionAddress}`);
      
      const params = {
        address: collectionAddress,
        chain: options.chain || 'ethereum',
        include_indicators: options.includeIndicators || true
      };

      const response = await this.client.get('/collection/health', { params });
      
      return {
        success: true,
        data: response.data,
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting health for ${collectionAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get market insights and trends
   */
  async getMarketInsights(options = {}) {
    try {
      logger.info('Getting market insights');
      
      const params = {
        chain: options.chain || 'ethereum',
        timeframe: options.timeframe || '7d',
        category: options.category || 'all',
        include_trends: options.includeTrends || true,
        include_top_collections: options.includeTopCollections || true
      };

      const response = await this.client.get('/market/insights', { params });
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting market insights:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get real-time transaction monitoring
   */
  async getTransactionMonitoring(options = {}) {
    try {
      logger.info('Getting transaction monitoring data');
      
      const params = {
        chain: options.chain || 'ethereum',
        timeframe: options.timeframe || '1h',
        include_suspicious: options.includeSuspicious || true,
        include_large_transactions: options.includeLargeTransactions || true
      };

      const response = await this.client.get('/transactions/monitoring', { params });
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting transaction monitoring:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get fraud detection alerts
   */
  async getFraudAlerts(options = {}) {
    try {
      logger.info('Getting fraud detection alerts');
      
      const params = {
        chain: options.chain || 'ethereum',
        timeframe: options.timeframe || '24h',
        severity: options.severity || 'all',
        include_details: options.includeDetails || true
      };

      const response = await this.client.get('/fraud/alerts', { params });
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting fraud alerts:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search for collections by name or address
   */
  async searchCollections(query, options = {}) {
    try {
      logger.info(`Searching collections for: ${query}`);
      
      const params = {
        q: query,
        chain: options.chain || 'ethereum',
        limit: options.limit || 10,
        include_metrics: options.includeMetrics || true
      };

      const response = await this.client.get('/collections/search', { params });
      
      return {
        success: true,
        data: response.data,
        query,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error searching collections for ${query}:`, error.message);
      return {
        success: false,
        error: error.message,
        query,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(walletAddress, options = {}) {
    try {
      logger.info(`Getting transactions for wallet: ${walletAddress}`);
      
      const params = {
        address: walletAddress,
        chain: options.chain || 'ethereum',
        limit: options.limit || 50,
        offset: options.offset || 0,
        include_details: options.includeDetails || true
      };

      const response = await this.client.get('/wallet/transactions', { params });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting transactions for ${walletAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get collection floor price and volume data
   */
  async getCollectionMetrics(collectionAddress, options = {}) {
    try {
      logger.info(`Getting metrics for collection: ${collectionAddress}`);
      
      const params = {
        address: collectionAddress,
        chain: options.chain || 'ethereum',
        timeframe: options.timeframe || '7d',
        include_price_history: options.includePriceHistory || true,
        include_volume_data: options.includeVolumeData || true
      };

      const response = await this.client.get('/collection/metrics', { params });
      
      return {
        success: true,
        data: response.data,
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting metrics for ${collectionAddress}:`, error.message);
      return {
        success: false,
        error: error.message,
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test API connection and authentication
   */
  async testConnection() {
    try {
      logger.info('Testing BitsCrunch API connection');
      
      const response = await this.client.get('/status');
      
      return {
        success: true,
        status: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error testing API connection:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats() {
    try {
      logger.info('Getting API usage statistics');
      
      const response = await this.client.get('/usage/stats');
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting usage stats:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { BitsCrunchAPI }; 