const logger = require('../utils/logger');

class ConversationMemory {
  constructor() {
    // In-memory storage for conversation history
    // In production, this would be replaced with Redis or a database
    this.conversations = new Map();
    this.maxHistoryPerUser = 20;
    this.maxContextLength = 2000;
  }

  /**
   * Add a new interaction to the conversation memory
   */
  addInteraction(userId, platform, userQuery, aiResponse, intent = null) {
    const key = this.getMemoryKey(userId, platform);
    
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        userId,
        platform,
        interactions: [],
        metadata: {
          firstInteraction: new Date().toISOString(),
          lastInteraction: new Date().toISOString(),
          totalInteractions: 0,
          preferredTopics: new Set(),
          averageQueryLength: 0
        }
      });
    }

    const conversation = this.conversations.get(key);
    const interaction = {
      timestamp: new Date().toISOString(),
      userQuery,
      aiResponse,
      intent,
      queryLength: userQuery.length,
      responseLength: aiResponse.length
    };

    conversation.interactions.push(interaction);
    conversation.metadata.lastInteraction = interaction.timestamp;
    conversation.metadata.totalInteractions++;

    // Update metadata
    if (intent && intent.type) {
      conversation.metadata.preferredTopics.add(intent.type);
    }

    // Calculate average query length
    const totalLength = conversation.interactions.reduce((sum, i) => sum + i.queryLength, 0);
    conversation.metadata.averageQueryLength = totalLength / conversation.interactions.length;

    // Maintain conversation history limit
    if (conversation.interactions.length > this.maxHistoryPerUser) {
      conversation.interactions = conversation.interactions.slice(-this.maxHistoryPerUser);
    }

    logger.info(`Added interaction for ${userId} on ${platform}. Total: ${conversation.metadata.totalInteractions}`);
  }

  /**
   * Get conversation context for a user
   */
  getContext(userId, platform, limit = 5) {
    const key = this.getMemoryKey(userId, platform);
    const conversation = this.conversations.get(key);

    if (!conversation) {
      return {
        hasHistory: false,
        recentInteractions: [],
        metadata: null,
        contextSummary: null
      };
    }

    const recentInteractions = conversation.interactions.slice(-limit);
    const contextSummary = this.generateContextSummary(conversation);

    return {
      hasHistory: true,
      recentInteractions,
      metadata: conversation.metadata,
      contextSummary,
      totalInteractions: conversation.metadata.totalInteractions
    };
  }

  /**
   * Get conversation history for a user
   */
  getHistory(userId, platform, limit = 10) {
    const key = this.getMemoryKey(userId, platform);
    const conversation = this.conversations.get(key);

    if (!conversation) {
      return [];
    }

    return conversation.interactions.slice(-limit);
  }

  /**
   * Generate a summary of conversation context
   */
  generateContextSummary(conversation) {
    const { interactions, metadata } = conversation;
    
    if (interactions.length === 0) {
      return null;
    }

    // Analyze recent interactions for context
    const recentInteractions = interactions.slice(-3);
    const topics = Array.from(metadata.preferredTopics);
    
    const summary = {
      userEngagement: this.calculateEngagementScore(interactions),
      preferredTopics: topics,
      averageQueryLength: Math.round(metadata.averageQueryLength),
      recentFocus: this.analyzeRecentFocus(recentInteractions),
      interactionPattern: this.analyzeInteractionPattern(interactions)
    };

    return summary;
  }

  /**
   * Calculate user engagement score
   */
  calculateEngagementScore(interactions) {
    if (interactions.length < 2) return 'new';
    
    const recentInteractions = interactions.slice(-5);
    const avgQueryLength = recentInteractions.reduce((sum, i) => sum + i.queryLength, 0) / recentInteractions.length;
    const avgResponseLength = recentInteractions.reduce((sum, i) => sum + i.responseLength, 0) / recentInteractions.length;
    
    if (avgQueryLength > 100 && avgResponseLength > 200) return 'high';
    if (avgQueryLength > 50 && avgResponseLength > 100) return 'medium';
    return 'low';
  }

  /**
   * Analyze recent conversation focus
   */
  analyzeRecentFocus(recentInteractions) {
    const intentTypes = recentInteractions
      .filter(i => i.intent && i.intent.type)
      .map(i => i.intent.type);
    
    if (intentTypes.length === 0) return 'general';
    
    // Find most common intent type
    const counts = {};
    intentTypes.forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Analyze interaction pattern
   */
  analyzeInteractionPattern(interactions) {
    if (interactions.length < 3) return 'developing';
    
    const recent = interactions.slice(-3);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      const interval = new Date(recent[i].timestamp) - new Date(recent[i-1].timestamp);
      intervals.push(interval);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const avgMinutes = avgInterval / (1000 * 60);
    
    if (avgMinutes < 5) return 'rapid';
    if (avgMinutes < 30) return 'moderate';
    return 'sporadic';
  }

  /**
   * Get memory key for user-platform combination
   */
  getMemoryKey(userId, platform) {
    return `${userId}:${platform}`;
  }

  /**
   * Clear conversation memory for a user
   */
  clear(userId, platform) {
    const key = this.getMemoryKey(userId, platform);
    const deleted = this.conversations.delete(key);
    
    if (deleted) {
      logger.info(`Cleared conversation memory for ${userId} on ${platform}`);
    }
    
    return deleted;
  }

  /**
   * Get conversation statistics
   */
  getStats() {
    const stats = {
      totalConversations: this.conversations.size,
      totalInteractions: 0,
      platforms: new Set(),
      averageInteractionsPerUser: 0
    };

    for (const [key, conversation] of this.conversations) {
      stats.totalInteractions += conversation.metadata.totalInteractions;
      stats.platforms.add(conversation.platform);
    }

    if (stats.totalConversations > 0) {
      stats.averageInteractionsPerUser = stats.totalInteractions / stats.totalConversations;
    }

    stats.platforms = Array.from(stats.platforms);
    return stats;
  }

  /**
   * Export conversation data (for backup/analysis)
   */
  exportConversation(userId, platform) {
    const key = this.getMemoryKey(userId, platform);
    const conversation = this.conversations.get(key);
    
    if (!conversation) {
      return null;
    }

    return {
      ...conversation,
      metadata: {
        ...conversation.metadata,
        preferredTopics: Array.from(conversation.metadata.preferredTopics)
      }
    };
  }

  /**
   * Import conversation data (for migration/restore)
   */
  importConversation(conversationData) {
    const key = this.getMemoryKey(conversationData.userId, conversationData.platform);
    
    // Convert preferredTopics back to Set
    conversationData.metadata.preferredTopics = new Set(conversationData.metadata.preferredTopics);
    
    this.conversations.set(key, conversationData);
    logger.info(`Imported conversation for ${conversationData.userId} on ${conversationData.platform}`);
  }
}

module.exports = { ConversationMemory }; 