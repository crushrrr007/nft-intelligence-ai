const OpenAI = require('openai');
const { ConversationMemory } = require('./memory');
const { getSystemPrompt, getAnalysisPrompt } = require('./prompts');
const logger = require('../utils/logger');

class AIOrchestrator {
  constructor(config) {
    this.config = config;
    this.memory = new ConversationMemory();
    
    // Initialize AI client
    if (config.provider === 'openai') {
      this.aiClient = new OpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: false
      });
    } else if (config.provider === 'anthropic') {
      // Anthropic Claude support
      this.aiClient = {
        chat: {
          completions: {
            create: async (params) => {
              // Placeholder for Anthropic integration
              throw new Error('Anthropic integration not yet implemented');
            }
          }
        }
      };
    }
    
    this.model = config.model || 'gpt-3.5-turbo';
    logger.info(`AI Orchestrator initialized with ${config.provider} and model ${this.model}`);
  }

  /**
   * Main entry point for processing user queries
   */
  async processQuery(userQuery, userId, platform = 'web') {
    try {
      logger.info(`Processing query from ${platform} user ${userId}: ${userQuery.substring(0, 100)}...`);
      
      // 1. Analyze user intent
      const intent = await this.analyzeIntent(userQuery, userId);
      
      // 2. Get conversation context
      const context = this.memory.getContext(userId, platform);
      
      // 3. Generate response based on intent
      const response = await this.generateResponse(userQuery, intent, context, userId);
      
      // 4. Update memory
      this.memory.addInteraction(userId, platform, userQuery, response, intent);
      
      return {
        response,
        intent,
        confidence: intent.confidence,
        suggestedActions: intent.suggestedActions
      };
      
    } catch (error) {
      logger.error('Error processing query:', error);
      return {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        intent: { type: 'error', confidence: 0 },
        error: true
      };
    }
  }

  /**
   * Analyze user intent from natural language
   */
  async analyzeIntent(query, userId) {
    const prompt = `
You are an AI assistant specialized in NFT and blockchain analysis. Analyze the user's intent from their query.

User Query: "${query}"

Respond with a JSON object containing:
{
  "type": "wallet_analysis|collection_analysis|market_insights|risk_assessment|general_question|error",
  "confidence": 0.0-1.0,
  "entities": {
    "wallet_address": "string or null",
    "collection_name": "string or null",
    "timeframe": "string or null",
    "metrics": ["array of requested metrics"]
  },
  "suggestedActions": ["array of suggested API calls"],
  "requiresBitsCrunch": boolean
}

Examples:
- "Analyze wallet 0x123..." → wallet_analysis
- "How is Bored Ape doing?" → collection_analysis
- "What's the market trend?" → market_insights
- "Is this wallet risky?" → risk_assessment
`;

    try {
      const completion = await this.aiClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a precise intent analyzer. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const intent = JSON.parse(completion.choices[0].message.content);
      logger.info(`Intent analyzed: ${intent.type} (confidence: ${intent.confidence})`);
      return intent;
      
    } catch (error) {
      logger.error('Error analyzing intent:', error);
      return {
        type: 'general_question',
        confidence: 0.5,
        entities: {},
        suggestedActions: [],
        requiresBitsCrunch: false
      };
    }
  }

  /**
   * Generate intelligent response based on intent and context
   */
  async generateResponse(query, intent, context, userId) {
    const systemPrompt = getSystemPrompt();
    const analysisPrompt = getAnalysisPrompt(intent, context);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: analysisPrompt + `\n\nUser Query: ${query}` }
    ];

    try {
      const completion = await this.aiClient.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      return completion.choices[0].message.content;
      
    } catch (error) {
      logger.error('Error generating response:', error);
      return "I'm having trouble generating a response right now. Please try again in a moment.";
    }
  }

  /**
   * Process bitsCrunch data and synthesize insights
   */
  async synthesizeData(data, intent, originalQuery) {
    const prompt = `
You are an expert NFT analyst. Synthesize the following data into intelligent insights.

Original Query: "${originalQuery}"
Intent: ${JSON.stringify(intent)}

Data: ${JSON.stringify(data, null, 2)}

Provide a comprehensive analysis that:
1. Answers the user's specific question
2. Highlights key insights and trends
3. Identifies potential risks or opportunities
4. Suggests actionable next steps

Format your response in a conversational, helpful tone.
`;

    try {
      const completion = await this.aiClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are an expert NFT analyst providing clear, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1500
      });

      return completion.choices[0].message.content;
      
    } catch (error) {
      logger.error('Error synthesizing data:', error);
      return "I've gathered some data, but I'm having trouble analyzing it right now. Please try again.";
    }
  }

  /**
   * Learn from user interactions to improve future responses
   */
  async learnFromInteraction(userId, query, response, feedback = null) {
    // Store learning data for future model improvements
    const learningData = {
      userId,
      query,
      response,
      feedback,
      timestamp: new Date().toISOString(),
      platform: 'web' // Will be updated based on context
    };

    // In a production system, this would be stored in a database
    // and used for model fine-tuning or prompt optimization
    logger.info(`Learning from interaction: ${userId} - ${feedback || 'no feedback'}`);
    
    return true;
  }

  /**
   * Get conversation history for context
   */
  getConversationHistory(userId, platform, limit = 5) {
    return this.memory.getHistory(userId, platform, limit);
  }

  /**
   * Clear conversation memory for a user
   */
  clearMemory(userId, platform) {
    this.memory.clear(userId, platform);
    logger.info(`Cleared memory for user ${userId} on ${platform}`);
  }
}

module.exports = { AIOrchestrator }; 