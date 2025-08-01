const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

class TelegramBotClass {
  constructor(token, services) {
    this.token = token;
    this.bitsCrunchAPI = services.bitsCrunchAPI;
    this.aiOrchestrator = services.aiOrchestrator;
    
    this.bot = new TelegramBot(token, { polling: true });
    this.setupEventHandlers();
  }

  /**
   * Initialize the Telegram bot
   */
  async initialize() {
    try {
      // Set bot commands
      await this.bot.setMyCommands([
        { command: '/start', description: 'Start the bot' },
        { command: '/analyze', description: 'Analyze wallet or collection' },
        { command: '/market', description: 'Get market insights' },
        { command: '/risk', description: 'Assess risk' },
        { command: '/search', description: 'Search collections' },
        { command: '/alerts', description: 'Get fraud alerts' },
        { command: '/help', description: 'Show help' }
      ]);

      logger.info('Telegram bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Telegram bot:', error);
      throw error;
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      await this.handleStartCommand(msg);
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelpCommand(msg);
    });

    // Analyze command
    this.bot.onText(/\/analyze (.+)/, async (msg, match) => {
      await this.handleAnalyzeCommand(msg, match[1]);
    });

    // Market command
    this.bot.onText(/\/market/, async (msg) => {
      await this.handleMarketCommand(msg);
    });

    // Risk command
    this.bot.onText(/\/risk (.+)/, async (msg, match) => {
      await this.handleRiskCommand(msg, match[1]);
    });

    // Search command
    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      await this.handleSearchCommand(msg, match[1]);
    });

    // Alerts command
    this.bot.onText(/\/alerts/, async (msg) => {
      await this.handleAlertsCommand(msg);
    });

    // Handle all other messages as chat
    this.bot.on('message', async (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        await this.handleChatMessage(msg);
      }
    });

    // Handle callback queries (inline buttons)
    this.bot.on('callback_query', async (callbackQuery) => {
      await this.handleCallbackQuery(callbackQuery);
    });
  }

  /**
   * Handle start command
   */
  async handleStartCommand(msg) {
    const welcomeMessage = `
🤖 *Welcome to NFT Intelligence AI!*

I'm your AI-powered NFT analyst, built for the bitsCrunch x AI Builders Hack 2025.

*What I can do:*
• 📊 Analyze wallets and collections
• 📈 Provide market insights
• ⚠️ Assess risks and detect fraud
• 🔍 Search for NFT collections
• 💬 Chat about NFTs and blockchain

*Quick commands:*
/analyze <address> - Analyze wallet or collection
/market - Get market insights
/risk <address> - Assess risk
/search <query> - Search collections
/alerts - Get fraud alerts
/help - Show all commands

*Or just chat with me naturally!* I understand natural language and can help with any NFT-related questions.

*Powered by bitsCrunch API + AI*
    `;

    await this.bot.sendMessage(msg.chat.id, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Analyze Wallet', callback_data: 'analyze_wallet' },
            { text: '📈 Market Insights', callback_data: 'market' }
          ],
          [
            { text: '⚠️ Risk Assessment', callback_data: 'risk' },
            { text: '🔍 Search Collections', callback_data: 'search' }
          ],
          [
            { text: '🚨 Fraud Alerts', callback_data: 'alerts' },
            { text: '💬 Chat with AI', callback_data: 'chat' }
          ]
        ]
      }
    });
  }

  /**
   * Handle help command
   */
  async handleHelpCommand(msg) {
    const helpMessage = `
🤖 *NFT Intelligence AI - Help*

*Available Commands:*

📊 *Analysis*
/analyze <address> - Analyze wallet or collection
Example: \`/analyze 0x123...\`

📈 *Market Data*
/market - Get current market insights and trends

⚠️ *Risk Assessment*
/risk <address> - Assess risk for wallet or collection
Example: \`/risk 0x123...\`

🔍 *Search*
/search <query> - Search for NFT collections
Example: \`/search Bored Ape\`

🚨 *Alerts*
/alerts - Get recent fraud alerts

💬 *Chat*
Just send me a message! I understand natural language.

*Tips:*
• Use full addresses for best results
• I remember our conversation context
• Ask me anything about NFTs and blockchain

*Powered by bitsCrunch x AI Builders Hack 2025*
    `;

    await this.bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle analyze command
   */
  async handleAnalyzeCommand(msg, address) {
    if (!address) {
      await this.bot.sendMessage(msg.chat.id, '❌ Please provide an address to analyze.\nExample: `/analyze 0x123...`', { parse_mode: 'Markdown' });
      return;
    }

    const loadingMsg = await this.bot.sendMessage(msg.chat.id, '🔍 Analyzing... Please wait.');

    try {
      // Determine if it's a wallet or collection (basic heuristic)
      const isWallet = address.length === 42 && address.startsWith('0x');
      
      let result;
      if (isWallet) {
        result = await this.bitsCrunchAPI.analyzeWallet(address);
        if (result.success) {
          const riskResult = await this.bitsCrunchAPI.getWalletRiskScore(address);
          result.data.risk = riskResult.data;
        }
      } else {
        result = await this.bitsCrunchAPI.analyzeCollection(address);
        if (result.success) {
          const healthResult = await this.bitsCrunchAPI.getCollectionHealth(address);
          result.data.health = healthResult.data;
        }
      }

      if (!result.success) {
        await this.bot.editMessageText(`❌ Failed to analyze: ${result.error}`, {
          chat_id: msg.chat.id,
          message_id: loadingMsg.message_id
        });
        return;
      }

      // Synthesize with AI
      const synthesis = await this.aiOrchestrator.synthesizeData(
        result.data,
        { type: isWallet ? 'wallet_analysis' : 'collection_analysis', confidence: 0.9 },
        `Analyze ${isWallet ? 'wallet' : 'collection'} ${address}`
      );

      const analysisMessage = `
📊 *${isWallet ? 'Wallet' : 'Collection'} Analysis*

*Address:* \`${address}\`
*Type:* ${isWallet ? 'Wallet' : 'Collection'}

${synthesis}

*Powered by bitsCrunch API + AI*
      `;

      await this.bot.editMessageText(analysisMessage, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 More Details', callback_data: `details_${isWallet ? 'wallet' : 'collection'}_${address}` },
              { text: '⚠️ Risk Assessment', callback_data: `risk_${address}` }
            ],
            [
              { text: '🔍 Search Similar', callback_data: 'search_similar' },
              { text: '💬 Ask Follow-up', callback_data: 'chat' }
            ]
          ]
        }
      });

    } catch (error) {
      logger.error('Error in analyze command:', error);
      await this.bot.editMessageText('❌ An error occurred while analyzing. Please try again.', {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Handle market command
   */
  async handleMarketCommand(msg) {
    const loadingMsg = await this.bot.sendMessage(msg.chat.id, '📈 Getting market insights...');

    try {
      const marketData = await this.bitsCrunchAPI.getMarketInsights({ timeframe: '7d' });
      const transactionData = await this.bitsCrunchAPI.getTransactionMonitoring({ timeframe: '1h' });

      if (!marketData.success) {
        await this.bot.editMessageText(`❌ Failed to get market insights: ${marketData.error}`, {
          chat_id: msg.chat.id,
          message_id: loadingMsg.message_id
        });
        return;
      }

      // Synthesize with AI
      const synthesis = await this.aiOrchestrator.synthesizeData(
        { market: marketData.data, transactions: transactionData.data },
        { type: 'market_insights', confidence: 0.8 },
        'Provide market insights and trends'
      );

      const marketMessage = `
📈 *Market Insights*

${synthesis}

*Powered by bitsCrunch API + AI*
      `;

      await this.bot.editMessageText(marketMessage, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Detailed Analysis', callback_data: 'market_details' },
              { text: '🚨 Recent Alerts', callback_data: 'alerts' }
            ],
            [
              { text: '🔍 Top Collections', callback_data: 'top_collections' },
              { text: '💬 Ask Questions', callback_data: 'chat' }
            ]
          ]
        }
      });

    } catch (error) {
      logger.error('Error in market command:', error);
      await this.bot.editMessageText('❌ An error occurred while getting market insights. Please try again.', {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Handle risk command
   */
  async handleRiskCommand(msg, address) {
    if (!address) {
      await this.bot.sendMessage(msg.chat.id, '❌ Please provide an address to assess.\nExample: `/risk 0x123...`', { parse_mode: 'Markdown' });
      return;
    }

    const loadingMsg = await this.bot.sendMessage(msg.chat.id, '⚠️ Assessing risk... Please wait.');

    try {
      const isWallet = address.length === 42 && address.startsWith('0x');
      const data = {};

      if (isWallet) {
        const walletData = await this.bitsCrunchAPI.analyzeWallet(address);
        const riskData = await this.bitsCrunchAPI.getWalletRiskScore(address);
        data.wallet = { analysis: walletData.data, risk: riskData.data };
      } else {
        const collectionData = await this.bitsCrunchAPI.analyzeCollection(address);
        const healthData = await this.bitsCrunchAPI.getCollectionHealth(address);
        data.collection = { analysis: collectionData.data, health: healthData.data };
      }

      const marketData = await this.bitsCrunchAPI.getMarketInsights({ timeframe: '7d' });
      data.market = marketData.data;

      // Synthesize risk assessment
      const synthesis = await this.aiOrchestrator.synthesizeData(
        data,
        { type: 'risk_assessment', confidence: 0.9 },
        `Assess risk for ${isWallet ? 'wallet' : 'collection'} ${address}`
      );

      const riskMessage = `
⚠️ *Risk Assessment*

*Address:* \`${address}\`
*Type:* ${isWallet ? 'Wallet' : 'Collection'}

${synthesis}

*Powered by bitsCrunch API + AI*
      `;

      await this.bot.editMessageText(riskMessage, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Full Analysis', callback_data: `analyze_${address}` },
              { text: '🚨 More Alerts', callback_data: 'alerts' }
            ],
            [
              { text: '💬 Get Advice', callback_data: 'chat' }
            ]
          ]
        }
      });

    } catch (error) {
      logger.error('Error in risk command:', error);
      await this.bot.editMessageText('❌ An error occurred while assessing risk. Please try again.', {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Handle search command
   */
  async handleSearchCommand(msg, query) {
    if (!query) {
      await this.bot.sendMessage(msg.chat.id, '❌ Please provide a search query.\nExample: `/search Bored Ape`', { parse_mode: 'Markdown' });
      return;
    }

    const loadingMsg = await this.bot.sendMessage(msg.chat.id, '🔍 Searching collections...');

    try {
      const searchResult = await this.bitsCrunchAPI.searchCollections(query);

      if (!searchResult.success) {
        await this.bot.editMessageText(`❌ Search failed: ${searchResult.error}`, {
          chat_id: msg.chat.id,
          message_id: loadingMsg.message_id
        });
        return;
      }

      const results = searchResult.data;
      let searchMessage = `🔍 *Search Results: ${query}*\n\nFound ${results.length} collections\n\n`;

      if (results.length > 0) {
        results.slice(0, 5).forEach((result, index) => {
          searchMessage += `${index + 1}. *${result.name || 'Unknown'}*\n`;
          searchMessage += `   Address: \`${result.address}\`\n`;
          searchMessage += `   Floor: ${result.floor_price || 'N/A'} ETH\n\n`;
        });
      } else {
        searchMessage += 'No collections found matching your query.';
      }

      searchMessage += '\n*Powered by bitsCrunch API*';

      const keyboard = [];
      if (results.length > 0) {
        results.slice(0, 3).forEach((result, index) => {
          keyboard.push([{ text: `📊 ${result.name || 'Collection'}`, callback_data: `analyze_${result.address}` }]);
        });
      }
      keyboard.push([{ text: '🔍 New Search', callback_data: 'search' }]);

      await this.bot.editMessageText(searchMessage, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

    } catch (error) {
      logger.error('Error in search command:', error);
      await this.bot.editMessageText('❌ An error occurred while searching. Please try again.', {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Handle alerts command
   */
  async handleAlertsCommand(msg) {
    const loadingMsg = await this.bot.sendMessage(msg.chat.id, '🚨 Getting fraud alerts...');

    try {
      const alertsResult = await this.bitsCrunchAPI.getFraudAlerts({ timeframe: '24h' });

      if (!alertsResult.success) {
        await this.bot.editMessageText(`❌ Failed to get alerts: ${alertsResult.error}`, {
          chat_id: msg.chat.id,
          message_id: loadingMsg.message_id
        });
        return;
      }

      const alerts = alertsResult.data;
      let alertsMessage = `🚨 *Fraud Alerts (24h)*\n\n`;

      if (alerts.length > 0) {
        alertsMessage += `Found ${alerts.length} alerts\n\n`;
        alerts.slice(0, 3).forEach((alert, index) => {
          alertsMessage += `${index + 1}. *${alert.type || 'Alert'}*\n`;
          alertsMessage += `   Severity: ${alert.severity || 'Unknown'}\n`;
          alertsMessage += `   Address: \`${alert.address || 'N/A'}\`\n\n`;
        });
      } else {
        alertsMessage += 'No fraud alerts detected in the last 24 hours.';
      }

      alertsMessage += '\n*Powered by bitsCrunch API*';

      await this.bot.editMessageText(alertsMessage, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Market Status', callback_data: 'market' },
              { text: '⚠️ Risk Check', callback_data: 'risk' }
            ],
            [
              { text: '💬 Get Help', callback_data: 'chat' }
            ]
          ]
        }
      });

    } catch (error) {
      logger.error('Error in alerts command:', error);
      await this.bot.editMessageText('❌ An error occurred while getting alerts. Please try again.', {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Handle chat messages
   */
  async handleChatMessage(msg) {
    const userId = msg.from.id.toString();
    const query = msg.text;

    const loadingMsg = await this.bot.sendMessage(msg.chat.id, '🤖 Thinking...');

    try {
      const result = await this.aiOrchestrator.processQuery(query, userId, 'telegram');

      const chatMessage = `
🤖 *NFT Intelligence AI*

${result.response}

*Intent:* ${result.intent.type || 'general'}
*Confidence:* ${Math.round((result.intent.confidence || 0) * 100)}%

*Powered by bitsCrunch x AI Builders Hack 2025*
      `;

      await this.bot.editMessageText(chatMessage, {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Analyze Something', callback_data: 'analyze_wallet' },
              { text: '📈 Market Data', callback_data: 'market' }
            ],
            [
              { text: '🔍 Search Collections', callback_data: 'search' },
              { text: '💬 Ask More', callback_data: 'chat' }
            ]
          ]
        }
      });

    } catch (error) {
      logger.error('Error handling chat message:', error);
      await this.bot.editMessageText('❌ Sorry, I encountered an error processing your message. Please try again.', {
        chat_id: msg.chat.id,
        message_id: loadingMsg.message_id
      });
    }
  }

  /**
   * Handle callback queries (inline buttons)
   */
  async handleCallbackQuery(callbackQuery) {
    const { data, message } = callbackQuery;
    const chatId = message.chat.id;

    try {
      switch (data) {
        case 'analyze_wallet':
          await this.bot.sendMessage(chatId, '📊 Please send me a wallet address to analyze.\nExample: `0x123...`', { parse_mode: 'Markdown' });
          break;

        case 'market':
          await this.handleMarketCommand({ chat: { id: chatId } });
          break;

        case 'risk':
          await this.bot.sendMessage(chatId, '⚠️ Please send me an address to assess risk.\nExample: `0x123...`', { parse_mode: 'Markdown' });
          break;

        case 'search':
          await this.bot.sendMessage(chatId, '🔍 Please send me a search query.\nExample: `Bored Ape`', { parse_mode: 'Markdown' });
          break;

        case 'alerts':
          await this.handleAlertsCommand({ chat: { id: chatId } });
          break;

        case 'chat':
          await this.bot.sendMessage(chatId, '💬 Just send me a message! I can help with any NFT-related questions.');
          break;

        default:
          if (data.startsWith('analyze_')) {
            const address = data.substring(8);
            await this.handleAnalyzeCommand({ chat: { id: chatId } }, address);
          } else if (data.startsWith('risk_')) {
            const address = data.substring(5);
            await this.handleRiskCommand({ chat: { id: chatId } }, address);
          }
          break;
      }

      // Answer callback query
      await this.bot.answerCallbackQuery(callbackQuery.id);

    } catch (error) {
      logger.error('Error handling callback query:', error);
      await this.bot.answerCallbackQuery(callbackQuery.id, { text: 'Error processing request' });
    }
  }
}

module.exports = TelegramBotClass; 