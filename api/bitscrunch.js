const axios = require('axios');
const logger = require('../utils/logger');

class BitsCrunchAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Correct base URL from documentation
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
   * Test API connection using market metrics endpoint (known working)
   */
  async testConnection() {
    try {
      logger.info('Testing BitsCrunch API connection');
      
      const response = await this.client.get('/market/metrics', {
        params: {
          currency: 'usd',
          time_range: '24h',
          include_washtrade: true,
          metrics: ['volume', 'transactions', 'holders']
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
   * Get wallet profile - CORRECT ENDPOINT from documentation
   */
  async analyzeWallet(walletAddress, options = {}) {
    try {
      logger.info(`Analyzing wallet: ${walletAddress}`);
      
      // Use correct endpoint: /wallet/{address}/profile
      const response = await this.client.get(`/wallet/${walletAddress}/profile`, {
        params: {
          blockchain: options.blockchain || 1, // 1 for Ethereum
          metrics: ['is_whale', 'is_contract', 'first_transaction', 'last_transaction']
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
   * Get wallet metrics - CORRECT ENDPOINT from documentation
   */
  async getWalletMetrics(walletAddress, options = {}) {
    try {
      logger.info(`Getting wallet metrics: ${walletAddress}`);
      
      // Use correct endpoint: /wallet/{address}/metrics
      const response = await this.client.get(`/wallet/${walletAddress}/metrics`, {
        params: {
          blockchain: options.blockchain || 1,
          currency: options.currency || 'usd',
          metrics: ['minted_value', 'sold_value', 'bought_value', 'current_value'],
          time_range: options.time_range || '30d',
          include_washtrade: true
        }
      });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting wallet metrics ${walletAddress}:`, error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet reputation score - CORRECT ENDPOINT from documentation
   */
  async getWalletRiskScore(walletAddress, options = {}) {
    try {
      logger.info(`Getting reputation score for wallet: ${walletAddress}`);
      
      // Use correct endpoint: /wallet/{blockchain}/{address}/score/reputation
      const blockchain = options.blockchain || 1;
      const response = await this.client.get(`/wallet/${blockchain}/${walletAddress}/score/reputation`, {
        params: {
          metrics: ['reputation_score', 'risk_level', 'activity_score']
        }
      });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting reputation score for ${walletAddress}:`, error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get NFT portfolio - CORRECT ENDPOINT from documentation
   */
  async getWalletNFTs(walletAddress, options = {}) {
    try {
      logger.info(`Getting NFT portfolio for wallet: ${walletAddress}`);
      
      // Use correct endpoint: /wallet/balance/nft
      const response = await this.client.get('/wallet/balance/nft', {
        params: {
          blockchain: options.blockchain || 1,
          address: walletAddress,
          offset: options.offset || 0,
          limit: options.limit || 30
        }
      });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting NFT portfolio for ${walletAddress}:`, error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get market insights (existing working endpoint)
   */
  async getMarketInsights(options = {}) {
    try {
      logger.info('Getting market insights');
      
      const response = await this.client.get('/market/metrics', {
        params: {
          currency: options.currency || 'usd',
          time_range: options.timeframe || '24h',
          include_washtrade: options.includeWashTrade || true,
          metrics: options.metrics || 'volume,transactions,unique_wallets,floor_price,market_cap'
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
   * Comprehensive wallet analysis combining multiple endpoints
   */
  async getCompleteWalletAnalysis(walletAddress, options = {}) {
    try {
      logger.info(`Getting complete analysis for wallet: ${walletAddress}`);
      
      // Call multiple endpoints in parallel
      const [profile, metrics, reputation, nfts] = await Promise.allSettled([
        this.analyzeWallet(walletAddress, options),
        this.getWalletMetrics(walletAddress, options),
        this.getWalletRiskScore(walletAddress, options),
        this.getWalletNFTs(walletAddress, options)
      ]);

      // Combine results
      const result = {
        success: true,
        wallet: walletAddress,
        profile: profile.status === 'fulfilled' ? profile.value : null,
        metrics: metrics.status === 'fulfilled' ? metrics.value : null,
        reputation: reputation.status === 'fulfilled' ? reputation.value : null,
        nfts: nfts.status === 'fulfilled' ? nfts.value : null,
        timestamp: new Date().toISOString()
      };

      return result;

    } catch (error) {
      logger.error(`Error in complete wallet analysis for ${walletAddress}:`, error.message);
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
        case 422:
          return data?.message || 'Validation error';
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