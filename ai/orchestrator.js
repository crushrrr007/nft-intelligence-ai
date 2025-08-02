const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ConversationMemory } = require('./memory');
const { getSystemPrompt, getAnalysisPrompt } = require('./prompts');
const logger = require('../utils/logger');

class AIOrchestrator {
  constructor(config) {
    this.config = config;
    this.memory = new ConversationMemory();
    this.isDemoMode = false; // Always use real APIs
    
    // Initialize real AI providers
    this.initializeAI(config);
  }

initializeAI(config) {
  try {
    // Google Gemini (FREE)
    if (config.provider === 'gemini' && config.googleApiKey && 
        config.googleApiKey !== 'your_free_gemini_key_here') {
      
      this.genAI = new GoogleGenerativeAI(config.googleApiKey);
      
      // Try different model names in order of preference
      const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
      
      for (const modelName of modelNames) {
        try {
          this.model = this.genAI.getGenerativeModel({ model: modelName });
          logger.info(`✅ AI Orchestrator initialized with Google Gemini ${modelName} (LIVE)`);
          return;
        } catch (error) {
          logger.warn(`Model ${modelName} not available, trying next...`);
        }
      }
      
      throw new Error('No valid Gemini model found');
    }
    
    // OpenAI (if available)
    if (config.provider === 'openai' && config.apiKey && 
        config.apiKey !== 'your_openai_api_key_here') {
      
      const OpenAI = require('openai');
      this.aiClient = new OpenAI({ apiKey: config.apiKey });
      this.modelName = config.model || 'gpt-3.5-turbo';
      logger.info(`✅ AI Orchestrator initialized with OpenAI ${this.modelName} (LIVE)`);
      return;
    }
    
    // No valid API key found
    throw new Error('No valid AI API key found. Please configure Google Gemini or OpenAI API key.');
    
  } catch (error) {
    logger.error('Error initializing AI:', error);
    throw error;
  }
}

  /**
   * Process user query with real AI
   */
  async processQuery(userQuery, userId, platform = 'web') {
    try {
      logger.info(`Processing query from ${platform} user ${userId}: ${userQuery.substring(0, 100)}...`);
      
      // 1. Analyze intent with real AI
      const intent = await this.analyzeIntent(userQuery, userId);
      
      // 2. Get conversation context
      const context = this.memory.getContext(userId, platform);
      
      // 3. Generate intelligent response
      const response = await this.generateResponse(userQuery, intent, context, userId);
      
      // 4. Update memory
      this.memory.addInteraction(userId, platform, userQuery, response, intent);
      
      return {
        response,
        intent,
        confidence: intent.confidence,
        suggestedActions: intent.suggestedActions,
        usingRealAI: true,
        platform,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error processing query:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Advanced intent analysis with real AI
   */
  async analyzeIntent(query, userId) {
    const prompt = `Analyze this NFT/blockchain query and extract intent. Respond with ONLY valid JSON:

User Query: "${query}"

Required JSON format:
{
  "type": "wallet_analysis|collection_analysis|market_insights|risk_assessment|general_question",
  "confidence": 0.8,
  "entities": {
    "wallet_address": "0x... or null",
    "collection_name": "collection name or null",
    "timeframe": "timeframe or null",
    "numbers": ["any numbers found"]
  },
  "suggestedActions": ["array of actions"],
  "requiresBitsCrunch": true/false,
  "reasoning": "brief explanation"
}

Examples:
- "Analyze wallet 0x123..." → wallet_analysis
- "How is BAYC doing?" → collection_analysis
- "Market trends?" → market_insights
- "Is this risky?" → risk_assessment`;

    try {
      let intentResponse;
      
      if (this.model) {
        // Use Google Gemini
        const result = await this.model.generateContent(prompt);
        intentResponse = result.response.text();
      } else if (this.aiClient) {
        // Use OpenAI
        const completion = await this.aiClient.chat.completions.create({
          model: this.modelName,
          messages: [
            { role: 'system', content: 'Respond only with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 500
        });
        intentResponse = completion.choices[0].message.content;
      } else {
        throw new Error('No AI provider configured');
      }

      // Clean and parse JSON
      const cleanResponse = intentResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
      
      const intent = JSON.parse(cleanResponse);
      logger.info(`✅ Intent analyzed: ${intent.type} (confidence: ${intent.confidence})`);
      return intent;
      
    } catch (error) {
      logger.error('Error analyzing intent:', error);
      throw new Error(`Intent analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate intelligent response with real AI
   */
  async generateResponse(query, intent, context, userId) {
    const systemPrompt = `You are NFT Intelligence AI, an expert blockchain analyst for the bitsCrunch x AI Builders Hack 2025.

PERSONALITY: Professional, knowledgeable, helpful, enthusiastic about NFTs
EXPERTISE: NFT analytics, wallet analysis, market trends, risk assessment
STYLE: Clear, data-driven insights with actionable recommendations

Current Analysis Type: ${intent.type}
User Context: ${context.hasHistory ? `Previous ${context.totalInteractions} interactions` : 'New user'}

Provide a comprehensive response that:
1. Directly answers the user's question
2. Includes relevant insights and data points
3. Offers actionable recommendations
4. Uses appropriate emojis for clarity
5. Mentions bitsCrunch data integration when relevant`;

    const userPrompt = `User Query: "${query}"

Intent Analysis: ${JSON.stringify(intent)}

${context.hasHistory ? `Previous Context: User has asked ${context.totalInteractions} questions before. Remember our conversation flow.` : ''}

Please provide a detailed, helpful response about this NFT/blockchain query.`;

    try {
      let response;
      
      if (this.model) {
        // Use Google Gemini
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const result = await this.model.generateContent(fullPrompt);
        response = result.response.text();
      } else if (this.aiClient) {
        // Use OpenAI
        const completion = await this.aiClient.chat.completions.create({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });
        response = completion.choices[0].message.content;
      } else {
        throw new Error('No AI provider configured');
      }

      return response;
      
    } catch (error) {
      logger.error('Error generating response:', error);
      throw new Error(`Response generation failed: ${error.message}`);
    }
  }

  /**
   * Synthesize bitsCrunch data with AI insights
   */
  async synthesizeData(data, intent, originalQuery) {
    const prompt = `As an expert NFT analyst, synthesize these insights:

Original Query: "${originalQuery}"
Analysis Type: ${intent.type}
Data: ${JSON.stringify(data, null, 2)}

Provide expert analysis with:
1. Key findings and patterns
2. Risk assessment and opportunities
3. Market context and implications
4. Specific actionable recommendations
5. Confidence levels for predictions

Use professional but accessible language with relevant emojis.`;

    try {
      let synthesis;
      
      if (this.model) {
        // Use Google Gemini
        const result = await this.model.generateContent(prompt);
        synthesis = result.response.text();
      } else if (this.aiClient) {
        // Use OpenAI
        const completion = await this.aiClient.chat.completions.create({
          model: this.modelName,
          messages: [
            { role: 'system', content: 'You are an expert NFT analyst providing clear insights.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 1500
        });
        synthesis = completion.choices[0].message.content;
      } else {
        throw new Error('No AI provider configured');
      }

      return synthesis;
      
    } catch (error) {
      logger.error('Error synthesizing data:', error);
      throw new Error(`Data synthesis failed: ${error.message}`);
    }
  }

  // Utility methods
  getConversationHistory(userId, platform, limit = 5) {
    return this.memory.getHistory(userId, platform, limit);
  }

  clearMemory(userId, platform) {
    this.memory.clear(userId, platform);
    logger.info(`Cleared memory for user ${userId} on ${platform}`);
  }

  async learnFromInteraction(userId, query, response, feedback = null) {
    // Store learning data for future improvements
    logger.info(`Learning from interaction: ${userId} - ${feedback || 'no feedback'}`);
    return true;
  }
}

module.exports = { AIOrchestrator };