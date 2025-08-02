const axios = require('axios');
const logger = require('../utils/logger');

class BitsCrunchAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // CORRECT BASE URL from your example
    this.baseURL = 'https://api.unleashnfts.com/api/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Request logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`BitsCrunch API: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`BitsCrunch Response: ${response.status}`);
        return response;
      },
      (error) => {
        logger.error(`BitsCrunch Error: ${error.response?.status}`);
        if (error.response?.data) {
          logger.error('Error Details:', error.response.data);
        }
        return Promise.reject(error);
      }
    );

    logger.info('BitsCrunch API client initialized');
  }

/**
 * Test API connection using market metrics endpoint
 */
async testConnection() {
  try {
    logger.info('Testing BitsCrunch API connection');
    
    // Use valid metrics from the API error message
    const response = await this.client.get('/market/metrics', {
      params: {
        currency: 'usd',
        time_range: '24h',
        include_washtrade: true,
        metrics: ['volume', 'transactions', 'holders'] // Array format with valid metrics
      }
    });
    
    return {
      success: true,
      status: 'Connected successfully',
      data: response.data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Error testing API connection:', error.message);
    return {
      success: false,
      error: this.formatErrorMessage(error),
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
    
    const response = await this.client.get('/market/metrics', {
      params: {
        currency: options.currency || 'usd',
        time_range: options.timeframe || '24h',
        include_washtrade: options.includeWashTrade || true,
        metrics: options.metrics || 'volume,transactions,unique_wallets,floor_price,market_cap' // Add required metrics
      }
    });
    
    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Error getting market insights:', error.message);
    return {
      success: false,
      error: this.formatErrorMessage(error),
      timestamp: new Date().toISOString()
    };
  }
}

  /**
   * Analyze wallet - need to find correct endpoint
   */
  async analyzeWallet(walletAddress, options = {}) {
    try {
      logger.info(`Analyzing wallet: ${walletAddress}`);
      
      // Try wallet analysis endpoint
      const response = await this.client.get('/wallet/analysis', {
        params: {
          address: walletAddress,
          currency: options.currency || 'usd',
          time_range: options.timeframe || '30d'
        }
      });
      
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
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet risk score
   */
  async getWalletRiskScore(walletAddress, options = {}) {
    try {
      logger.info(`Getting risk score for wallet: ${walletAddress}`);
      
      const response = await this.client.get('/wallet/risk', {
        params: {
          address: walletAddress,
          currency: options.currency || 'usd'
        }
      });
      
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
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze NFT collection
   */
  async analyzeCollection(collectionAddress, options = {}) {
    try {
      logger.info(`Analyzing collection: ${collectionAddress}`);
      
      const response = await this.client.get('/collection/analysis', {
        params: {
          address: collectionAddress,
          currency: options.currency || 'usd',
          time_range: options.timeframe || '30d'
        }
      });
      
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
        error: this.formatErrorMessage(error),
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
      
      const response = await this.client.get('/collection/health', {
        params: {
          address: collectionAddress,
          currency: options.currency || 'usd'
        }
      });
      
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
        error: this.formatErrorMessage(error),
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get collection metrics
   */
  async getCollectionMetrics(collectionAddress, options = {}) {
    try {
      logger.info(`Getting metrics for collection: ${collectionAddress}`);
      
      const response = await this.client.get('/collection/metrics', {
        params: {
          address: collectionAddress,
          currency: options.currency || 'usd',
          time_range: options.timeframe || '7d'
        }
      });
      
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
        error: this.formatErrorMessage(error),
        collection: collectionAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Search for collections
   */
  async searchCollections(query, options = {}) {
    try {
      logger.info(`Searching collections for: ${query}`);
      
      const response = await this.client.get('/collections/search', {
        params: {
          q: query,
          limit: options.limit || 10,
          currency: options.currency || 'usd'
        }
      });
      
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
        error: this.formatErrorMessage(error),
        query,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get fraud alerts
   */
  async getFraudAlerts(options = {}) {
    try {
      logger.info('Getting fraud detection alerts');
      
      const response = await this.client.get('/fraud/alerts', {
        params: {
          time_range: options.timeframe || '24h',
          severity: options.severity || 'all',
          currency: options.currency || 'usd'
        }
      });
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting fraud alerts:', error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(walletAddress, options = {}) {
    try {
      logger.info(`Getting transactions for wallet: ${walletAddress}`);
      
      const response = await this.client.get('/wallet/transactions', {
        params: {
          address: walletAddress,
          limit: options.limit || 50,
          currency: options.currency || 'usd',
          time_range: options.timeframe || '30d'
        }
      });
      
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
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Format error messages
   */
  formatErrorMessage(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return 'Bad request - check parameters';
        case 401:
          return 'Invalid API key';
        case 403:
          return 'Access forbidden';
        case 404:
          return 'Endpoint not found';
        case 429:
          return 'Rate limit exceeded';
        case 500:
          return 'Server error';
        default:
          return data?.message || `API error: ${status}`;
      }
    } else if (error.request) {
      return 'Network error';
    } else {
      return error.message || 'Unknown error';
    }
  }
}

module.exports = { BitsCrunchAPI };