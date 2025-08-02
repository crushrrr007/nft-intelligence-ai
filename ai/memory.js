/**
 * Conversation Memory System
 * Manages conversation context and history across platforms
 */

const logger = require('../utils/logger');

class ConversationMemory {
  constructor() {
    // In-memory storage for conversation data
    // Format: { userId: { platform: { interactions: [], context: {} } } }
    this.memory = new Map();
    this.maxInteractionsPerUser = 50; // Limit memory usage
    this.contextWindowSize = 10; // Number of recent interactions to consider for context
  }

  /**
   * Add a new interaction to user's memory
   */
  addInteraction(userId, platform, userQuery, aiResponse, intent = {}) {
    try {
      // Initialize user memory if it doesn't exist
      if (!this.memory.has(userId)) {
        this.memory.set(userId, new Map());
      }

      const userMemory = this.memory.get(userId);

      // Initialize platform memory if it doesn't exist
      if (!userMemory.has(platform)) {
        userMemory.set(platform, {
          interactions: [],
          context: {
            totalInteractions: 0,
            lastInteractionTime: null,
            commonTopics: new Map(),
            preferredAnalysisTypes: new Map(),
            riskTolerance: 'unknown'
          }
        });
      }

      const platformMemory = userMemory.get(platform);

      // Create interaction record
      const interaction = {
        timestamp: new Date().toISOString(),
        userQuery,
        aiResponse,
        intent,
        id: this.generateInteractionId()
      };

      // Add interaction to memory
      platformMemory.interactions.push(interaction);

      // Update context
      this.updateContext(platformMemory, interaction);

      // Trim memory if it exceeds limit
      if (platformMemory.interactions.length > this.maxInteractionsPerUser) {
        platformMemory.interactions = platformMemory.interactions.slice(-this.maxInteractionsPerUser);
      }

      logger.info(`Added interaction for ${userId} on ${platform}. Total: ${platformMemory.context.totalInteractions}`);

    } catch (error) {
      logger.error('Error adding interaction to memory:', error);
    }
  }

  /**
   * Get conversation context for a user
   */
  getContext(userId, platform) {
    try {
      const userMemory = this.memory.get(userId);
      if (!userMemory || !userMemory.has(platform)) {
        return {
          hasHistory: false,
          totalInteractions: 0,
          recentInteractions: [],
          commonTopics: [],
          preferredAnalysisTypes: [],
          riskTolerance: 'unknown'
        };
      }

      const platformMemory = userMemory.get(platform);
      const recentInteractions = platformMemory.interactions.slice(-this.contextWindowSize);

      return {
        hasHistory: platformMemory.interactions.length > 0,
        totalInteractions: platformMemory.context.totalInteractions,
        recentInteractions,
        commonTopics: Array.from(platformMemory.context.commonTopics.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([topic]) => topic),
        preferredAnalysisTypes: Array.from(platformMemory.context.preferredAnalysisTypes.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type]) => type),
        riskTolerance: platformMemory.context.riskTolerance,
        lastInteractionTime: platformMemory.context.lastInteractionTime
      };

    } catch (error) {
      logger.error('Error getting context from memory:', error);
      return {
        hasHistory: false,
        totalInteractions: 0,
        recentInteractions: [],
        commonTopics: [],
        preferredAnalysisTypes: [],
        riskTolerance: 'unknown'
      };
    }
  }

  /**
   * Get conversation history for a user
   */
  getHistory(userId, platform, limit = 10) {
    try {
      const userMemory = this.memory.get(userId);
      if (!userMemory || !userMemory.has(platform)) {
        return [];
      }

      const platformMemory = userMemory.get(platform);
      return platformMemory.interactions.slice(-limit);

    } catch (error) {
      logger.error('Error getting history from memory:', error);
      return [];
    }
  }

  /**
   * Clear memory for a user on a specific platform
   */
  clear(userId, platform) {
    try {
      const userMemory = this.memory.get(userId);
      if (userMemory && userMemory.has(platform)) {
        userMemory.delete(platform);
        
        // If no platforms left for this user, remove user entirely
        if (userMemory.size === 0) {
          this.memory.delete(userId);
        }
      }

      logger.info(`Cleared memory for ${userId} on ${platform}`);

    } catch (error) {
      logger.error('Error clearing memory:', error);
    }
  }

  /**
   * Update context based on new interaction
   */
  updateContext(platformMemory, interaction) {
    const context = platformMemory.context;
    
    // Update basic stats
    context.totalInteractions += 1;
    context.lastInteractionTime = interaction.timestamp;

    // Extract and count topics from user query
    const topics = this.extractTopics(interaction.userQuery);
    topics.forEach(topic => {
      const count = context.commonTopics.get(topic) || 0;
      context.commonTopics.set(topic, count + 1);
    });

    // Track preferred analysis types
    if (interaction.intent && interaction.intent.type) {
      const type = interaction.intent.type;
      const count = context.preferredAnalysisTypes.get(type) || 0;
      context.preferredAnalysisTypes.set(type, count + 1);
    }

    // Infer risk tolerance from queries
    this.updateRiskTolerance(context, interaction.userQuery);
  }

  /**
   * Extract topics from user query
   */
  extractTopics(query) {
    const topics = [];
    const lowerQuery = query.toLowerCase();

    // NFT collection topics
    const collections = [
      'bored ape', 'bayc', 'cryptopunks', 'azuki', 'mutant ape',
      'pudgy penguins', 'clone x', 'moonbirds', 'otherdeed', 'doodles'
    ];
    
    collections.forEach(collection => {
      if (lowerQuery.includes(collection)) {
        topics.push(collection);
      }
    });

    // Analysis type topics
    const analysisTypes = [
      'wallet', 'collection', 'market', 'risk', 'fraud', 'trading',
      'investment', 'portfolio', 'trends', 'price'
    ];

    analysisTypes.forEach(type => {
      if (lowerQuery.includes(type)) {
        topics.push(type);
      }
    });

    // Blockchain topics
    const blockchainTerms = [
      'ethereum', 'polygon', 'solana', 'bitcoin', 'defi', 'nft',
      'token', 'smart contract', 'gas', 'opensea'
    ];

    blockchainTerms.forEach(term => {
      if (lowerQuery.includes(term)) {
        topics.push(term);
      }
    });

    return topics;
  }

  /**
   * Update risk tolerance based on query patterns
   */
  updateRiskTolerance(context, query) {
    const lowerQuery = query.toLowerCase();

    // Risk-averse indicators
    const riskAverseTerms = ['safe', 'secure', 'low risk', 'conservative', 'stable'];
    const riskSeekingTerms = ['risky', 'high return', 'volatile', 'speculative', 'gamble'];

    let riskAverseScore = 0;
    let riskSeekingScore = 0;

    riskAverseTerms.forEach(term => {
      if (lowerQuery.includes(term)) riskAverseScore++;
    });

    riskSeekingTerms.forEach(term => {
      if (lowerQuery.includes(term)) riskSeekingScore++;
    });

    // Update risk tolerance
    if (riskAverseScore > riskSeekingScore) {
      context.riskTolerance = 'conservative';
    } else if (riskSeekingScore > riskAverseScore) {
      context.riskTolerance = 'aggressive';
    } else if (context.riskTolerance === 'unknown') {
      context.riskTolerance = 'moderate';
    }
  }

  /**
   * Generate unique interaction ID
   */
  generateInteractionId() {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return {
      totalUsers: this.memory.size,
      totalInteractions: Array.from(this.memory.values())
        .reduce((total, userMemory) => {
          return total + Array.from(userMemory.values())
            .reduce((userTotal, platformMemory) => {
              return userTotal + platformMemory.interactions.length;
            }, 0);
        }, 0),
      memoryUsage: `${this.memory.size} users tracked`
    };
  }

  /**
   * Clean up old memory (for production use)
   */
  cleanup(maxAgeHours = 24) {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    let cleanedCount = 0;

    for (const [userId, userMemory] of this.memory.entries()) {
      for (const [platform, platformMemory] of userMemory.entries()) {
        const originalLength = platformMemory.interactions.length;
        
        platformMemory.interactions = platformMemory.interactions.filter(
          interaction => new Date(interaction.timestamp) > cutoffTime
        );

        cleanedCount += originalLength - platformMemory.interactions.length;

        // Remove platform if no interactions left
        if (platformMemory.interactions.length === 0) {
          userMemory.delete(platform);
        }
      }

      // Remove user if no platforms left
      if (userMemory.size === 0) {
        this.memory.delete(userId);
      }
    }

    logger.info(`Cleaned up ${cleanedCount} old interactions`);
    return cleanedCount;
  }
}

module.exports = { ConversationMemory };