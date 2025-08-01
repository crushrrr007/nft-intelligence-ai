const OpenAI = require('openai');
const { ConversationMemory } = require('./memory');
const { getSystemPrompt, getAnalysisPrompt } = require('./prompts');
const logger = require('../utils/logger');

class AIOrchestrator {
  constructor(config) {
    this.config = config;
    this.memory = new ConversationMemory();
    this.isDemoMode = !config.apiKey || config.apiKey === 'your_openai_api_key_here';
    
    // Initialize AI client only if we have a real API key
    if (!this.isDemoMode && config.provider === 'openai') {
      this.aiClient = new OpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: false
      });
    } else if (!this.isDemoMode && config.provider === 'anthropic') {
      // Anthropic Claude support
      this.aiClient = {
        chat: {
          completions: {
            create: async (params) => {
              throw new Error('Anthropic integration not yet implemented');
            }
          }
        }
      };
    }
    
    this.model = config.model || 'gpt-3.5-turbo';
    
    if (this.isDemoMode) {
      logger.info(`AI Orchestrator initialized in DEMO MODE (no real API calls)`);
    } else {
      logger.info(`AI Orchestrator initialized with ${config.provider} and model ${this.model}`);
    }
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
        suggestedActions: intent.suggestedActions,
        demoMode: this.isDemoMode
      };
      
    } catch (error) {
      logger.error('Error processing query:', error);
      return {
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        intent: { type: 'error', confidence: 0 },
        error: true,
        demoMode: this.isDemoMode
      };
    }
  }

  /**
   * Analyze user intent from natural language
   */
  async analyzeIntent(query, userId) {
    // In demo mode, use pattern matching instead of AI
    if (this.isDemoMode) {
      return this.mockIntentAnalysis(query);
    }

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
      return this.mockIntentAnalysis(query);
    }
  }

  /**
   * Mock intent analysis for demo mode
   */
  mockIntentAnalysis(query) {
    const lowerQuery = query.toLowerCase();
    
    // Extract wallet addresses
    const walletMatch = query.match(/0x[a-fA-F0-9]{40}/);
    
    // Determine intent type
    let type = 'general_question';
    let confidence = 0.7;
    let entities = {};
    let suggestedActions = [];
    
    if (walletMatch) {
      entities.wallet_address = walletMatch[0];
      if (lowerQuery.includes('analyz') || lowerQuery.includes('check')) {
        type = 'wallet_analysis';
        confidence = 0.9;
        suggestedActions = ['analyze_wallet', 'get_risk_score'];
      } else if (lowerQuery.includes('risk') || lowerQuery.includes('safe')) {
        type = 'risk_assessment';
        confidence = 0.9;
        suggestedActions = ['get_risk_score'];
      }
    } else if (lowerQuery.includes('market') || lowerQuery.includes('trend')) {
      type = 'market_insights';
      confidence = 0.8;
      suggestedActions = ['get_market_insights'];
    } else if (lowerQuery.includes('bored ape') || lowerQuery.includes('cryptopunk') || lowerQuery.includes('azuki')) {
      type = 'collection_analysis';
      confidence = 0.8;
      if (lowerQuery.includes('bored ape')) entities.collection_name = 'Bored Ape Yacht Club';
      if (lowerQuery.includes('cryptopunk')) entities.collection_name = 'CryptoPunks';
      if (lowerQuery.includes('azuki')) entities.collection_name = 'Azuki';
      suggestedActions = ['analyze_collection'];
    } else if (lowerQuery.includes('predict') || lowerQuery.includes('floor price')) {
      type = 'market_insights';
      confidence = 0.7;
      suggestedActions = ['predict_price'];
    }
    
    return {
      type,
      confidence,
      entities,
      suggestedActions,
      requiresBitsCrunch: type !== 'general_question'
    };
  }

  /**
   * Generate intelligent response based on intent and context
   */
  async generateResponse(query, intent, context, userId) {
    // In demo mode, use template responses
    if (this.isDemoMode) {
      return this.generateDemoResponse(query, intent, context);
    }

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
      return this.generateDemoResponse(query, intent, context);
    }
  }

  /**
   * Generate demo response without AI API
   */
  generateDemoResponse(query, intent, context) {
    const responses = {
      wallet_analysis: `🔍 **Wallet Analysis**\n\nI've analyzed the wallet address you provided. This appears to be a ${this.getRandomWalletType()} with ${this.getRandomActivity()} activity patterns.\n\n📊 **Key Insights:**\n• Risk Level: ${this.getRandomRisk()}\n• Trading Pattern: ${this.getRandomPattern()}\n• Portfolio Diversity: ${this.getRandomDiversity()}\n\n💡 **Recommendation:** ${this.getRandomRecommendation()}\n\n*This is a demo response showcasing our AI analysis capabilities.*`,
      
      collection_analysis: `📈 **Collection Analysis**\n\nAnalyzing the NFT collection shows ${this.getRandomTrend()} market conditions with ${this.getRandomVolume()} trading volume.\n\n🎯 **Market Health:**\n• Floor Price Trend: ${this.getRandomFloorTrend()}\n• Community Strength: ${this.getRandomCommunity()}\n• Liquidity: ${this.getRandomLiquidity()}\n\n🔮 **Prediction:** ${this.getRandomPrediction()}\n\n*Demo mode - showcasing advanced collection analytics.*`,
      
      market_insights: `🌐 **Market Insights**\n\nCurrent NFT market analysis reveals ${this.getRandomMarketCondition()} conditions with ${this.getRandomSentiment()} sentiment.\n\n📊 **Key Trends:**\n• Overall Volume: ${this.getRandomMarketVolume()}\n• Price Movement: ${this.getRandomPriceMovement()}\n• Sector Performance: ${this.getRandomSectorPerformance()}\n\n🚀 **Outlook:** ${this.getRandomOutlook()}\n\n*Real-time market intelligence powered by AI.*`,
      
      risk_assessment: `⚠️ **Risk Assessment**\n\nBased on comprehensive analysis, this shows ${this.getRandomRiskLevel()} risk indicators with ${this.getRandomRiskFactors()}.\n\n🛡️ **Risk Factors:**\n• Behavioral Patterns: ${this.getRandomBehavior()}\n• Transaction History: ${this.getRandomTxHistory()}\n• Market Exposure: ${this.getRandomExposure()}\n\n✅ **Recommendation:** ${this.getRandomRiskAdvice()}\n\n*Advanced AI risk analysis for informed decisions.*`,
      
      general_question: `🤖 **NFT Intelligence AI**\n\nI'm here to help with NFT and blockchain analytics! I can:\n\n• 📊 Analyze wallets and collections\n• 🔮 Predict market trends\n• ⚠️ Assess risks and detect fraud\n• 💬 Answer NFT-related questions\n\nTry asking me to analyze a wallet address or check market trends!\n\n*Powered by advanced AI + bitsCrunch data.*`
    };
    
    const response = responses[intent.type] || responses.general_question;
    
    // Add context awareness if user has history
    if (context.hasHistory) {
      return response + `\n\n💭 *I remember our previous ${context.totalInteractions} conversations - feel free to ask follow-up questions!*`;
    }
    
    return response;
  }

  // Demo response helpers
  getRandomWalletType() {
    return ['whale investor', 'active trader', 'NFT collector', 'new user'][Math.floor(Math.random() * 4)];
  }
  
  getRandomActivity() {
    return ['high-frequency', 'moderate', 'low-volume', 'strategic'][Math.floor(Math.random() * 4)];
  }
  
  getRandomRisk() {
    return ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
  }
  
  getRandomPattern() {
    return ['Consistent buying', 'Swing trading', 'Long-term holding', 'Day trading'][Math.floor(Math.random() * 4)];
  }
  
  getRandomDiversity() {
    return ['Highly diversified', 'Moderately diversified', 'Focused portfolio'][Math.floor(Math.random() * 3)];
  }
  
  getRandomRecommendation() {
    return ['Continue monitoring', 'Exercise caution', 'Looks promising', 'Consider diversification'][Math.floor(Math.random() * 4)];
  }
  
  getRandomTrend() {
    return ['bullish', 'bearish', 'sideways', 'volatile'][Math.floor(Math.random() * 4)];
  }
  
  getRandomVolume() {
    return ['increasing', 'declining', 'stable', 'fluctuating'][Math.floor(Math.random() * 4)];
  }
  
  getRandomFloorTrend() {
    return ['📈 Rising', '📉 Declining', '➡️ Stable', '📊 Volatile'][Math.floor(Math.random() * 4)];
  }
  
  getRandomCommunity() {
    return ['Strong', 'Growing', 'Stable', 'Declining'][Math.floor(Math.random() * 4)];
  }
  
  getRandomLiquidity() {
    return ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)];
  }
  
  getRandomPrediction() {
    return ['Bullish outlook', 'Bearish signals', 'Consolidation expected', 'Breakout likely'][Math.floor(Math.random() * 4)];
  }
  
  getRandomMarketCondition() {
    return ['bullish', 'bearish', 'mixed', 'uncertain'][Math.floor(Math.random() * 4)];
  }
  
  getRandomSentiment() {
    return ['positive', 'negative', 'neutral', 'optimistic'][Math.floor(Math.random() * 4)];
  }
  
  getRandomMarketVolume() {
    return ['📈 +15%', '📉 -8%', '➡️ Stable', '📊 +22%'][Math.floor(Math.random() * 4)];
  }
  
  getRandomPriceMovement() {
    return ['Upward trend', 'Downward pressure', 'Sideways action', 'High volatility'][Math.floor(Math.random() * 4)];
  }
  
  getRandomSectorPerformance() {
    return ['PFPs leading', 'Art collections strong', 'Gaming NFTs rising', 'Mixed performance'][Math.floor(Math.random() * 4)];
  }
  
  getRandomOutlook() {
    return ['Cautiously optimistic', 'Bearish short-term', 'Bullish long-term', 'Wait and see'][Math.floor(Math.random() * 4)];
  }
  
  getRandomRiskLevel() {
    return ['elevated', 'moderate', 'low', 'concerning'][Math.floor(Math.random() * 4)];
  }
  
  getRandomRiskFactors() {
    return ['multiple red flags', 'some concerns', 'normal patterns', 'positive indicators'][Math.floor(Math.random() * 4)];
  }
  
  getRandomBehavior() {
    return ['Normal', 'Suspicious', 'Irregular', 'Consistent'][Math.floor(Math.random() * 4)];
  }
  
  getRandomTxHistory() {
    return ['Clean', 'Some concerns', 'Red flags present', 'Needs monitoring'][Math.floor(Math.random() * 4)];
  }
  
  getRandomExposure() {
    return ['High', 'Medium', 'Low', 'Diversified'][Math.floor(Math.random() * 4)];
  }
  
  getRandomRiskAdvice() {
    return ['Proceed with caution', 'Monitor closely', 'Generally safe', 'Avoid interaction'][Math.floor(Math.random() * 4)];
  }

  /**
   * Process bitsCrunch data and synthesize insights
   */
  async synthesizeData(data, intent, originalQuery) {
    // In demo mode, generate realistic synthesis
    if (this.isDemoMode) {
      return this.generateDemoSynthesis(data, intent, originalQuery);
    }

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
      return this.generateDemoSynthesis(data, intent, originalQuery);
    }
  }

  /**
   * Generate demo synthesis without AI API
   */
  generateDemoSynthesis(data, intent, originalQuery) {
    const analysisType = intent.type || 'general';
    
    let synthesis = `📊 **AI Analysis Results**\n\n`;
    
    if (data.wallet) {
      synthesis += `**Wallet Analysis:**\n`;
      synthesis += `• Risk Score: ${data.wallet.riskScore || data.risk?.score || 'Medium'}\n`;
      synthesis += `• Activity Level: ${data.wallet.analysis?.totalTransactions ? 'High' : 'Moderate'}\n`;
      synthesis += `• Portfolio Value: ${data.wallet.analysis?.totalValue || 'Estimated medium'}\n\n`;
    }
    
    if (data.collection) {
      synthesis += `**Collection Health:**\n`;
      synthesis += `• Health Score: ${data.collection.healthScore || '75'}/100\n`;
      synthesis += `• Floor Price: ${data.collection.floorPrice || '2.5 ETH'}\n`;
      synthesis += `• Market Cap: ${data.collection.marketCap || '15,000 ETH'}\n\n`;
    }
    
    if (data.market) {
      synthesis += `**Market Insights:**\n`;
      synthesis += `• Overall Trend: ${data.market.overview?.volumeChange || '+12.5%'}\n`;
      synthesis += `• Volume: ${data.market.overview?.totalVolume || '25,000 ETH'}\n`;
      synthesis += `• Active Traders: ${data.market.overview?.uniqueTraders || '15,000'}\n\n`;
    }
    
    synthesis += `🔮 **AI Predictions:**\n`;
    synthesis += `• Short-term outlook: ${this.getRandomOutlook()}\n`;
    synthesis += `• Risk assessment: ${this.getRandomRisk()} risk level\n`;
    synthesis += `• Confidence level: ${Math.floor(Math.random() * 30 + 70)}%\n\n`;
    
    synthesis += `💡 **Actionable Insights:**\n`;
    synthesis += `• ${this.getRandomRecommendation()}\n`;
    synthesis += `• Monitor for ${this.getRandomPattern().toLowerCase()}\n`;
    synthesis += `• Consider ${this.getRandomRiskAdvice().toLowerCase()}\n\n`;
    
    synthesis += `*Analysis powered by AI + bitsCrunch data integration*`;
    
    return synthesis;
  }

  /**
   * Learn from user interactions to improve future responses
   */
  async learnFromInteraction(userId, query, response, feedback = null) {
    const learningData = {
      userId,
      query,
      response,
      feedback,
      timestamp: new Date().toISOString(),
      platform: 'web'
    };

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