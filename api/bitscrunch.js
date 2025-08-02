const axios = require('axios');
const logger = require('../utils/logger');

class BitsCrunchAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.bitscrunch.com/v2';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`BitsCrunch API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('BitsCrunch API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`BitsCrunch API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`BitsCrunch API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
        } else {
          logger.error('BitsCrunch API Network Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Format error messages consistently
   */
  formatErrorMessage(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'API request failed',
        details: error.response.data
      };
    } else if (error.request) {
      return {
        status: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: 'No response received from server'
      };
    } else {
      return {
        status: 'UNKNOWN_ERROR',
        message: error.message || 'Unknown error occurred',
        details: 'Request setup failed'
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      logger.info('Testing BitsCrunch API connection');
      const response = await this.client.get('/market/metrics', {
        params: {
          currency: 'usd'
          }
      });
      
      return {
        success: true,
        message: 'API connection successful',
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
   * Get wallet profile - CORRECT ENDPOINT
   */
  async analyzeWallet(walletAddress, options = {}) {
    try {
      logger.info(`Analyzing wallet: ${walletAddress}`);
      
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
   * Get wallet metrics - CORRECT ENDPOINT
   */
  async getWalletMetrics(walletAddress, options = {}) {
    try {
      logger.info(`Getting wallet metrics: ${walletAddress}`);
      
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
      logger.error(`Error getting wallet metrics for ${walletAddress}:`, error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet risk score - CORRECT ENDPOINT
   */
  async getWalletRiskScore(walletAddress, options = {}) {
    try {
      logger.info(`Getting wallet risk score: ${walletAddress}`);
      
      const blockchain = options.blockchain || 'ethereum';
      const response = await this.client.get(`/wallet/${blockchain}/${walletAddress}/score/reputation`, {
        params: {
          include_washtrade: true,
          time_range: options.time_range || '30d'
        }
      });
      
      return {
        success: true,
        data: response.data,
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error getting wallet risk score for ${walletAddress}:`, error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        wallet: walletAddress,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get wallet NFT portfolio - CORRECT ENDPOINT
   */
  async getWalletNFTs(walletAddress, options = {}) {
    try {
      logger.info(`Getting NFT portfolio for wallet: ${walletAddress}`);
      
      const response = await this.client.get('/wallet/balance/nft', {
        params: {
          owner: walletAddress,
          blockchain: options.blockchain || 1,
          limit: options.limit || 20,
          offset: options.offset || 0,
          include_metadata: true
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

      // Check if at least one endpoint succeeded
      const hasData = result.profile?.success || result.metrics?.success || 
                     result.reputation?.success || result.nfts?.success;

      if (!hasData) {
        return {
          success: false,
          error: 'All wallet analysis endpoints failed',
          wallet: walletAddress,
          details: {
            profile: profile.reason,
            metrics: metrics.reason,
            reputation: reputation.reason,
            nfts: nfts.reason
          },
          timestamp: new Date().toISOString()
        };
      }

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
   * Search collections
   */
  async searchCollections(query, options = {}) {
    try {
      logger.info(`Searching collections: ${query}`);
      
      const response = await this.client.get('/collection/search', {
        params: {
          query: query,
          blockchain: options.blockchain || 1,
          limit: options.limit || 10,
          offset: options.offset || 0
        }
      });
      
      return {
        success: true,
        data: response.data,
        query: query,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Error searching collections for "${query}":`, error.message);
      return {
        success: false,
        error: this.formatErrorMessage(error),
        query: query,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get fraud alerts
   */
  async getFraudAlerts(options = {}) {
    try {
      logger.info('Getting fraud alerts');
      
      const response = await this.client.get('/fraud/alerts', {
        params: {
          time_range: options.timeframe || '24h',
          limit: options.limit || 20,
          severity: options.severity || 'all'
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
}

module.exports = BitsCrunchAPI;