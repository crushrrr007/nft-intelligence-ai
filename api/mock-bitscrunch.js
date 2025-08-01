const logger = require('../utils/logger');

/**
 * Mock BitsCrunch API for demo purposes
 * Generates realistic-looking NFT data for testing and demonstrations
 */
class MockBitsCrunchAPI {
  constructor() {
    this.isDemo = process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true';
    
    // Demo wallet addresses with known characteristics
    this.demoWallets = {
      '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6': { type: 'whale', risk: 'low' },
      '0x8ba1f109551bd432803012645hac136c22c55b4d': { type: 'trader', risk: 'medium' },
      '0x1234567890123456789012345678901234567890': { type: 'suspicious', risk: 'high' },
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': { type: 'new', risk: 'medium' }
    };
    
    // Demo collections with varying performance
    this.demoCollections = {
      'bored-ape': { health: 'excellent', trend: 'bullish' },
      'cryptopunks': { health: 'good', trend: 'stable' },
      'azuki': { health: 'moderate', trend: 'bearish' },
      'unknown-collection': { health: 'poor', trend: 'declining' }
    };
    
    logger.info('Mock BitsCrunch API initialized for demo mode');
  }

  /**
   * Generate realistic wallet analysis data
   */
  generateWalletData(address) {
    const walletInfo = this.demoWallets[address] || { type: 'regular', risk: 'medium' };
    const baseData = this.getWalletBaseData(walletInfo);
    
    return {
      address,
      ...baseData,
      analysis: {
        totalTransactions: this.randomBetween(50, 2000),
        totalValue: this.randomFloat(10, 1000).toFixed(2) + ' ETH',
        profitLoss: this.randomFloat(-50, 200).toFixed(2) + ' ETH',
        averageHoldTime: this.randomBetween(7, 365) + ' days',
        collections: this.randomBetween(3, 25),
        lastActivity: this.randomRecentDate()
      },
      patterns: this.generateTradingPatterns(walletInfo.type),
      holdings: this.generateHoldings(walletInfo.type)
    };
  }

  /**
   * Generate wallet base data based on type
   */
  getWalletBaseData(walletInfo) {
    const riskScores = { low: [10, 30], medium: [30, 70], high: [70, 95] };
    const [min, max] = riskScores[walletInfo.risk];
    
    return {
      riskScore: this.randomBetween(min, max),
      walletAge: this.randomBetween(30, 1200) + ' days',
      reputation: walletInfo.risk === 'low' ? 'Trusted' : 
                 walletInfo.risk === 'high' ? 'Suspicious' : 'Neutral'
    };
  }

  /**
   * Generate trading patterns based on wallet type
   */
  generateTradingPatterns(walletType) {
    const patterns = {
      whale: {
        strategy: 'Long-term holder',
        buyFrequency: 'Low',
        sellFrequency: 'Very Low',
        averageTransactionSize: 'Very High',
        gasOptimization: 'Excellent'
      },
      trader: {
        strategy: 'Active trader',
        buyFrequency: 'High',
        sellFrequency: 'High',
        averageTransactionSize: 'Medium',
        gasOptimization: 'Good'
      },
      suspicious: {
        strategy: 'Wash trading suspected',
        buyFrequency: 'Very High',
        sellFrequency: 'Very High',
        averageTransactionSize: 'Variable',
        gasOptimization: 'Poor'
      },
      new: {
        strategy: 'New to NFTs',
        buyFrequency: 'Low',
        sellFrequency: 'Very Low',
        averageTransactionSize: 'Small',
        gasOptimization: 'Learning'
      }
    };
    
    return patterns[walletType] || patterns.regular;
  }

  /**
   * Generate realistic holdings data
   */
  generateHoldings(walletType) {
    const collections = ['Bored Ape Yacht Club', 'CryptoPunks', 'Azuki', 'Doodles', 'Moonbirds'];
    const holdingCount = walletType === 'whale' ? 5 : walletType === 'trader' ? 3 : 2;
    
    return collections.slice(0, holdingCount).map(name => ({
      collection: name,
      quantity: this.randomBetween(1, walletType === 'whale' ? 10 : 3),
      floorValue: this.randomFloat(0.5, 50).toFixed(2) + ' ETH',
      estimatedValue: this.randomFloat(1, 100).toFixed(2) + ' ETH'
    }));
  }

  /**
   * Generate collection analysis data
   */
  generateCollectionData(address) {
    const collectionId = this.extractCollectionId(address);
    const collectionInfo = this.demoCollections[collectionId] || { health: 'moderate', trend: 'stable' };
    
    return {
      address,
      name: this.formatCollectionName(collectionId),
      ...this.getCollectionBaseData(collectionInfo),
      metrics: this.generateCollectionMetrics(collectionInfo),
      activity: this.generateCollectionActivity(),
      rarity: this.generateRarityData()
    };
  }

  /**
   * Extract collection ID from address or return default
   */
  extractCollectionId(address) {
    const knownAddresses = {
      '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d': 'bored-ape',
      '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb': 'cryptopunks',
      '0xed5af388653567af2f388e6224dc7c4b3241c544': 'azuki'
    };
    
    return knownAddresses[address] || 'unknown-collection';
  }

  /**
   * Format collection name for display
   */
  formatCollectionName(collectionId) {
    const names = {
      'bored-ape': 'Bored Ape Yacht Club',
      'cryptopunks': 'CryptoPunks',
      'azuki': 'Azuki',
      'unknown-collection': 'Unknown Collection'
    };
    
    return names[collectionId] || 'NFT Collection';
  }

  /**
   * Generate collection base data
   */
  getCollectionBaseData(collectionInfo) {
    const healthScores = { 
      excellent: [85, 95], 
      good: [70, 85], 
      moderate: [50, 70], 
      poor: [20, 50] 
    };
    
    const [min, max] = healthScores[collectionInfo.health];
    
    return {
      healthScore: this.randomBetween(min, max),
      floorPrice: this.randomFloat(0.1, 100).toFixed(2) + ' ETH',
      marketCap: this.randomFloat(100, 50000).toFixed(0) + ' ETH',
      holders: this.randomBetween(1000, 10000),
      totalSupply: this.randomBetween(5000, 10000)
    };
  }

  /**
   * Generate collection metrics
   */
  generateCollectionMetrics(collectionInfo) {
    const trendMultipliers = { bullish: 1.2, stable: 1.0, bearish: 0.8, declining: 0.6 };
    const multiplier = trendMultipliers[collectionInfo.trend];
    
    return {
      volume24h: (this.randomFloat(10, 500) * multiplier).toFixed(2) + ' ETH',
      volumeChange: ((multiplier - 1) * 100 + this.randomFloat(-10, 10)).toFixed(1) + '%',
      floorChange24h: (this.randomFloat(-20, 20) * multiplier).toFixed(1) + '%',
      averagePrice: this.randomFloat(1, 20).toFixed(2) + ' ETH',
      uniqueTraders: this.randomBetween(50, 500),
      liquidityScore: this.randomBetween(30, 90)
    };
  }

  /**
   * Generate collection activity data
   */
  generateCollectionActivity() {
    return {
      sales24h: this.randomBetween(10, 200),
      listings: this.randomBetween(100, 1000),
      topSale: this.randomFloat(5, 100).toFixed(2) + ' ETH',
      averageSalePrice: this.randomFloat(1, 20).toFixed(2) + ' ETH',
      priceDistribution: this.generatePriceDistribution()
    };
  }

  /**
   * Generate price distribution data
   */
  generatePriceDistribution() {
    return {
      'Below Floor': this.randomBetween(5, 15) + '%',
      'Floor to 2x': this.randomBetween(60, 80) + '%',
      '2x to 5x': this.randomBetween(10, 25) + '%',
      'Above 5x': this.randomBetween(1, 5) + '%'
    };
  }

  /**
   * Generate rarity distribution
   */
  generateRarityData() {
    return {
      common: this.randomBetween(40, 60) + '%',
      uncommon: this.randomBetween(25, 35) + '%',
      rare: this.randomBetween(10, 20) + '%',
      legendary: this.randomBetween(3, 8) + '%',
      mythic: this.randomBetween(1, 3) + '%'
    };
  }

  /**
   * Generate market insights
   */
  generateMarketInsights(options = {}) {
    const timeframe = options.timeframe || '7d';
    
    return {
      timeframe,
      overview: {
        totalVolume: this.randomFloat(1000, 50000).toFixed(0) + ' ETH',
        volumeChange: this.randomFloat(-30, 50).toFixed(1) + '%',
        averagePrice: this.randomFloat(0.5, 5).toFixed(2) + ' ETH',
        priceChange: this.randomFloat(-25, 40).toFixed(1) + '%',
        activeCollections: this.randomBetween(500, 2000),
        uniqueTraders: this.randomBetween(5000, 25000)
      },
      trends: this.generateMarketTrends(),
      sectors: this.generateSectorPerformance(),
      sentiment: this.generateMarketSentiment()
    };
  }

  /**
   * Generate market trends
   */
  generateMarketTrends() {
    return {
      topPerforming: [
        { name: 'Art Collections', change: '+' + this.randomFloat(10, 50).toFixed(1) + '%' },
        { name: 'Gaming NFTs', change: '+' + this.randomFloat(5, 30).toFixed(1) + '%' },
        { name: 'Profile Pictures', change: '+' + this.randomFloat(0, 20).toFixed(1) + '%' }
      ],
      emerging: [
        'AI-Generated Art',
        'Utility NFTs',
        'Cross-Chain Collections'
      ],
      declining: [
        { name: 'Meme Collections', change: '-' + this.randomFloat(5, 25).toFixed(1) + '%' },
        { name: 'Celebrity NFTs', change: '-' + this.randomFloat(10, 40).toFixed(1) + '%' }
      ]
    };
  }

  /**
   * Generate sector performance
   */
  generateSectorPerformance() {
    const sectors = ['Art', 'Gaming', 'PFP', 'Utility', 'Music', 'Sports'];
    
    return sectors.map(sector => ({
      name: sector,
      volume: this.randomFloat(100, 5000).toFixed(0) + ' ETH',
      change: (this.randomFloat(-20, 30) > 0 ? '+' : '') + this.randomFloat(-20, 30).toFixed(1) + '%',
      collections: this.randomBetween(50, 500)
    }));
  }

  /**
   * Generate market sentiment
   */
  generateMarketSentiment() {
    const sentiments = ['Bullish', 'Neutral', 'Bearish'];
    const sentiment = sentiments[this.randomBetween(0, 2)];
    
    return {
      overall: sentiment,
      confidence: this.randomBetween(60, 90) + '%',
      factors: this.getSentimentFactors(sentiment),
      socialMetrics: {
        twitterMentions: this.randomBetween(1000, 10000),
        discordActivity: this.randomBetween(500, 5000),
        redditPosts: this.randomBetween(100, 1000)
      }
    };
  }

  /**
   * Get sentiment factors
   */
  getSentimentFactors(sentiment) {
    const factors = {
      Bullish: ['Increasing institutional adoption', 'New marketplace launches', 'Celebrity endorsements'],
      Neutral: ['Mixed market signals', 'Stable trading volumes', 'Awaiting major announcements'],
      Bearish: ['Market uncertainty', 'Regulatory concerns', 'Declining retail interest']
    };
    
    return factors[sentiment] || factors.Neutral;
  }

  /**
   * Generate fraud alerts
   */
  generateFraudAlerts(options = {}) {
    const timeframe = options.timeframe || '24h';
    const alertCount = this.randomBetween(3, 15);
    
    const alertTypes = [
      'Wash Trading Detected',
      'Suspicious Pricing',
      'Potential Rug Pull',
      'Fake Collection Warning',
      'Unusual Transaction Pattern'
    ];
    
    const alerts = [];
    for (let i = 0; i < alertCount; i++) {
      alerts.push({
        id: 'alert_' + this.randomBetween(1000, 9999),
        type: alertTypes[this.randomBetween(0, alertTypes.length - 1)],
        severity: ['High', 'Medium', 'Low'][this.randomBetween(0, 2)],
        collection: this.formatCollectionName(['bored-ape', 'cryptopunks', 'azuki', 'unknown-collection'][this.randomBetween(0, 3)]),
        address: '0x' + this.generateRandomHex(40),
        timestamp: this.randomRecentDate(),
        description: this.generateAlertDescription()
      });
    }
    
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Generate alert descriptions
   */
  generateAlertDescription() {
    const descriptions = [
      'Multiple transactions between same wallets detected',
      'Price manipulation patterns identified',
      'Unusual liquidity removal activity',
      'Suspicious mint and transfer patterns',
      'Abnormal trading volume spike detected'
    ];
    
    return descriptions[this.randomBetween(0, descriptions.length - 1)];
  }

  /**
   * Utility: Random number between min and max (inclusive)
   */
  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Utility: Random float between min and max
   */
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Utility: Generate random recent date
   */
  randomRecentDate() {
    const now = new Date();
    const hoursAgo = this.randomBetween(1, 168); // 1 hour to 7 days ago
    return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000)).toISOString();
  }

  /**
   * Utility: Generate random hex string
   */
  generateRandomHex(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // Wrapper methods that match the real BitsCrunchAPI interface
  async analyzeWallet(address, options = {}) {
    return {
      success: true,
      data: this.generateWalletData(address),
      timestamp: new Date().toISOString()
    };
  }

  async getWalletRiskScore(address, options = {}) {
    const walletInfo = this.demoWallets[address] || { risk: 'medium' };
    const riskScores = { low: [10, 30], medium: [30, 70], high: [70, 95] };
    const [min, max] = riskScores[walletInfo.risk];
    
    return {
      success: true,
      data: {
        address,
        riskScore: this.randomBetween(min, max),
        riskLevel: walletInfo.risk,
        factors: this.getRiskFactors(walletInfo.risk),
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  async analyzeCollection(address, options = {}) {
    return {
      success: true,
      data: this.generateCollectionData(address),
      timestamp: new Date().toISOString()
    };
  }

  async getCollectionHealth(address, options = {}) {
    const collectionId = this.extractCollectionId(address);
    const collectionInfo = this.demoCollections[collectionId] || { health: 'moderate' };
    
    return {
      success: true,
      data: {
        address,
        healthScore: this.randomBetween(50, 90),
        healthLevel: collectionInfo.health,
        indicators: this.getHealthIndicators(collectionInfo.health),
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }

  async getMarketInsights(options = {}) {
    return {
      success: true,
      data: this.generateMarketInsights(options),
      timestamp: new Date().toISOString()
    };
  }

  async getFraudAlerts(options = {}) {
    return {
      success: true,
      data: this.generateFraudAlerts(options),
      timestamp: new Date().toISOString()
    };
  }

  async searchCollections(query, options = {}) {
    const mockResults = [
      { name: 'Bored Ape Yacht Club', address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', floor_price: '20.5' },
      { name: 'CryptoPunks', address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', floor_price: '45.2' },
      { name: 'Azuki', address: '0xed5af388653567af2f388e6224dc7c4b3241c544', floor_price: '8.1' },
      { name: 'Doodles', address: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e', floor_price: '3.2' },
      { name: 'Moonbirds', address: '0x23581767a106ae21c074b2276d25d5c3e136a68b', floor_price: '12.7' }
    ];
    
    // Filter results based on query
    const filteredResults = mockResults.filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      success: true,
      data: filteredResults.length > 0 ? filteredResults : mockResults.slice(0, 3),
      timestamp: new Date().toISOString()
    };
  }

  async getTransactionMonitoring(options = {}) {
    return {
      success: true,
      data: {
        totalTransactions: this.randomBetween(1000, 5000),
        suspiciousTransactions: this.randomBetween(5, 50),
        largeTransactions: this.randomBetween(10, 100),
        recentActivity: this.generateRecentActivity(),
        patterns: this.generateTransactionPatterns()
      },
      timestamp: new Date().toISOString()
    };
  }

  generateRecentActivity() {
    const activities = [];
    for (let i = 0; i < 10; i++) {
      activities.push({
        type: ['Sale', 'Transfer', 'Mint', 'Burn'][this.randomBetween(0, 3)],
        collection: this.formatCollectionName(['bored-ape', 'cryptopunks', 'azuki'][this.randomBetween(0, 2)]),
        amount: this.randomFloat(0.1, 50).toFixed(2) + ' ETH',
        timestamp: this.randomRecentDate(),
        suspicious: Math.random() < 0.1
      });
    }
    return activities;
  }

  generateTransactionPatterns() {
    return {
      washTrading: this.randomBetween(0, 5),
      priceManipulation: this.randomBetween(0, 3),
      unusualVolume: this.randomBetween(1, 8),
      crossCollectionActivity: this.randomBetween(5, 20)
    };
  }

  getRiskFactors(riskLevel) {
    const factors = {
      low: ['Established trading history', 'Diverse portfolio', 'Consistent behavior'],
      medium: ['Limited trading history', 'Moderate portfolio diversity', 'Some unusual patterns'],
      high: ['Suspicious trading patterns', 'New wallet', 'High-risk transactions', 'Possible wash trading']
    };
    return factors[riskLevel] || factors.medium;
  }

  getHealthIndicators(healthLevel) {
    const indicators = {
      excellent: ['Strong community', 'Active development', 'Stable floor price', 'High liquidity'],
      good: ['Growing community', 'Regular updates', 'Moderate liquidity'],
      moderate: ['Mixed signals', 'Irregular activity', 'Price volatility'],
      poor: ['Declining interest', 'Inactive development', 'Low liquidity', 'Price instability']
    };
    return indicators[healthLevel] || indicators.moderate;
  }

  // Additional utility methods for more comprehensive mock data
  async getCollectionMetrics(address, options = {}) {
    return {
      success: true,
      data: this.generateCollectionMetrics(this.demoCollections[this.extractCollectionId(address)] || { trend: 'stable' }),
      timestamp: new Date().toISOString()
    };
  }

  async getWalletTransactions(address, options = {}) {
    const transactions = [];
    const count = Math.min(options.limit || 50, 50);
    
    for (let i = 0; i < count; i++) {
      transactions.push({
        hash: '0x' + this.generateRandomHex(64),
        type: ['buy', 'sell', 'transfer', 'mint'][this.randomBetween(0, 3)],
        collection: this.formatCollectionName(['bored-ape', 'cryptopunks', 'azuki'][this.randomBetween(0, 2)]),
        tokenId: this.randomBetween(1, 10000),
        price: this.randomFloat(0.1, 100).toFixed(2) + ' ETH',
        timestamp: this.randomRecentDate(),
        gasUsed: this.randomBetween(50000, 200000)
      });
    }
    
    return {
      success: true,
      data: transactions,
      timestamp: new Date().toISOString()
    };
  }

  async testConnection() {
    return {
      success: true,
      status: {
        api: 'Mock API - Demo Mode',
        version: '1.0.0',
        uptime: '100%'
      },
      timestamp: new Date().toISOString()
    };
  }

  async getUsageStats() {
    return {
      success: true,
      data: {
        requestsToday: this.randomBetween(100, 1000),
        requestsThisMonth: this.randomBetween(3000, 30000),
        remainingQuota: this.randomBetween(5000, 50000),
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { MockBitsCrunchAPI };