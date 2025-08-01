const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger');

class DiscordBot {
  constructor(token, services) {
    this.token = token;
    this.bitsCrunchAPI = services.bitsCrunchAPI;
    this.aiOrchestrator = services.aiOrchestrator;
    
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ]
    });

    this.commands = new Collection();
    this.setupEventHandlers();
    this.registerCommands();
  }

  /**
   * Initialize the Discord bot
   */
  async initialize() {
    try {
      await this.client.login(this.token);
      logger.info('Discord bot initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Discord bot:', error);
      throw error;
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Ready event
    this.client.once('ready', () => {
      logger.info(`Discord bot logged in as ${this.client.user.tag}`);
      this.client.user.setActivity('NFT Intelligence AI', { type: 'WATCHING' });
    });

    // Interaction create event (for slash commands)
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, this);
      } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({
          content: 'There was an error executing this command!',
          ephemeral: true
        });
      }
    });

    // Message create event (for AI chat)
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith('!nft')) return;

      try {
        await this.handleChatMessage(message);
      } catch (error) {
        logger.error('Error handling chat message:', error);
        await message.reply('Sorry, I encountered an error processing your message.');
      }
    });
  }

  /**
   * Register slash commands
   */
  async registerCommands() {
    const commands = [
      {
        name: 'analyze',
        description: 'Analyze a wallet or collection',
        options: [
          {
            name: 'type',
            description: 'Type of analysis',
            type: 3, // STRING
            required: true,
            choices: [
              { name: 'Wallet', value: 'wallet' },
              { name: 'Collection', value: 'collection' }
            ]
          },
          {
            name: 'address',
            description: 'Wallet or collection address',
            type: 3, // STRING
            required: true
          },
          {
            name: 'timeframe',
            description: 'Analysis timeframe',
            type: 3, // STRING
            required: false,
            choices: [
              { name: '1 Day', value: '1d' },
              { name: '7 Days', value: '7d' },
              { name: '30 Days', value: '30d' },
              { name: '90 Days', value: '90d' }
            ]
          }
        ]
      },
      {
        name: 'market',
        description: 'Get market insights and trends',
        options: [
          {
            name: 'timeframe',
            description: 'Timeframe for market data',
            type: 3, // STRING
            required: false,
            choices: [
              { name: '1 Day', value: '1d' },
              { name: '7 Days', value: '7d' },
              { name: '30 Days', value: '30d' }
            ]
          }
        ]
      },
      {
        name: 'risk',
        description: 'Assess risk for wallet or collection',
        options: [
          {
            name: 'wallet',
            description: 'Wallet address to assess',
            type: 3, // STRING
            required: false
          },
          {
            name: 'collection',
            description: 'Collection address to assess',
            type: 3, // STRING
            required: false
          }
        ]
      },
      {
        name: 'search',
        description: 'Search for NFT collections',
        options: [
          {
            name: 'query',
            description: 'Search query (collection name or address)',
            type: 3, // STRING
            required: true
          }
        ]
      },
      {
        name: 'alerts',
        description: 'Get recent fraud alerts',
        options: [
          {
            name: 'timeframe',
            description: 'Timeframe for alerts',
            type: 3, // STRING
            required: false,
            choices: [
              { name: '1 Hour', value: '1h' },
              { name: '24 Hours', value: '24h' },
              { name: '7 Days', value: '7d' }
            ]
          }
        ]
      },
      {
        name: 'chat',
        description: 'Chat with NFT Intelligence AI',
        options: [
          {
            name: 'message',
            description: 'Your message to the AI',
            type: 3, // STRING
            required: true
          }
        ]
      },
      {
        name: 'help',
        description: 'Show available commands and features'
      }
    ];

    // Register commands with Discord
    try {
      await this.client.application?.commands.set(commands);
      logger.info('Discord slash commands registered');
    } catch (error) {
      logger.error('Error registering Discord commands:', error);
    }

    // Store command handlers
    this.commands.set('analyze', this.handleAnalyzeCommand.bind(this));
    this.commands.set('market', this.handleMarketCommand.bind(this));
    this.commands.set('risk', this.handleRiskCommand.bind(this));
    this.commands.set('search', this.handleSearchCommand.bind(this));
    this.commands.set('alerts', this.handleAlertsCommand.bind(this));
    this.commands.set('chat', this.handleChatCommand.bind(this));
    this.commands.set('help', this.handleHelpCommand.bind(this));
  }

  /**
   * Handle analyze command
   */
  async handleAnalyzeCommand(interaction, bot) {
    await interaction.deferReply();

    const type = interaction.options.getString('type');
    const address = interaction.options.getString('address');
    const timeframe = interaction.options.getString('timeframe') || '30d';

    try {
      let result;
      if (type === 'wallet') {
        result = await bot.bitsCrunchAPI.analyzeWallet(address, { timeframe });
        if (result.success) {
          const riskResult = await bot.bitsCrunchAPI.getWalletRiskScore(address);
          result.data.risk = riskResult.data;
        }
      } else {
        result = await bot.bitsCrunchAPI.analyzeCollection(address, { timeframe });
        if (result.success) {
          const healthResult = await bot.bitsCrunchAPI.getCollectionHealth(address);
          result.data.health = healthResult.data;
        }
      }

      if (!result.success) {
        await interaction.editReply(`❌ Failed to analyze ${type}: ${result.error}`);
        return;
      }

      // Synthesize with AI
      const synthesis = await bot.aiOrchestrator.synthesizeData(
        result.data,
        { type: `${type}_analysis`, confidence: 0.9 },
        `Analyze ${type} ${address}`
      );

      const embed = this.createAnalysisEmbed(type, address, synthesis, result.data);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Error in analyze command:`, error);
      await interaction.editReply('❌ An error occurred while analyzing. Please try again.');
    }
  }

  /**
   * Handle market command
   */
  async handleMarketCommand(interaction, bot) {
    await interaction.deferReply();

    const timeframe = interaction.options.getString('timeframe') || '7d';

    try {
      const marketData = await bot.bitsCrunchAPI.getMarketInsights({ timeframe });
      const transactionData = await bot.bitsCrunchAPI.getTransactionMonitoring({ timeframe });

      if (!marketData.success) {
        await interaction.editReply(`❌ Failed to get market insights: ${marketData.error}`);
        return;
      }

      // Synthesize with AI
      const synthesis = await bot.aiOrchestrator.synthesizeData(
        { market: marketData.data, transactions: transactionData.data },
        { type: 'market_insights', confidence: 0.8 },
        'Provide market insights and trends'
      );

      const embed = this.createMarketEmbed(synthesis, marketData.data);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Error in market command:`, error);
      await interaction.editReply('❌ An error occurred while getting market insights. Please try again.');
    }
  }

  /**
   * Handle risk command
   */
  async handleRiskCommand(interaction, bot) {
    await interaction.deferReply();

    const wallet = interaction.options.getString('wallet');
    const collection = interaction.options.getString('collection');

    if (!wallet && !collection) {
      await interaction.editReply('❌ Please provide either a wallet or collection address.');
      return;
    }

    try {
      const data = {};

      if (wallet) {
        const walletData = await bot.bitsCrunchAPI.analyzeWallet(wallet);
        const riskData = await bot.bitsCrunchAPI.getWalletRiskScore(wallet);
        data.wallet = { analysis: walletData.data, risk: riskData.data };
      }

      if (collection) {
        const collectionData = await bot.bitsCrunchAPI.analyzeCollection(collection);
        const healthData = await bot.bitsCrunchAPI.getCollectionHealth(collection);
        data.collection = { analysis: collectionData.data, health: healthData.data };
      }

      const marketData = await bot.bitsCrunchAPI.getMarketInsights({ timeframe: '7d' });
      data.market = marketData.data;

      // Synthesize risk assessment
      const synthesis = await bot.aiOrchestrator.synthesizeData(
        data,
        { type: 'risk_assessment', confidence: 0.9 },
        `Assess risk for wallet: ${wallet}, collection: ${collection}`
      );

      const embed = this.createRiskEmbed(synthesis, data);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Error in risk command:`, error);
      await interaction.editReply('❌ An error occurred while assessing risk. Please try again.');
    }
  }

  /**
   * Handle search command
   */
  async handleSearchCommand(interaction, bot) {
    await interaction.deferReply();

    const query = interaction.options.getString('query');

    try {
      const searchResult = await bot.bitsCrunchAPI.searchCollections(query);

      if (!searchResult.success) {
        await interaction.editReply(`❌ Search failed: ${searchResult.error}`);
        return;
      }

      const embed = this.createSearchEmbed(query, searchResult.data);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Error in search command:`, error);
      await interaction.editReply('❌ An error occurred while searching. Please try again.');
    }
  }

  /**
   * Handle alerts command
   */
  async handleAlertsCommand(interaction, bot) {
    await interaction.deferReply();

    const timeframe = interaction.options.getString('timeframe') || '24h';

    try {
      const alertsResult = await bot.bitsCrunchAPI.getFraudAlerts({ timeframe });

      if (!alertsResult.success) {
        await interaction.editReply(`❌ Failed to get alerts: ${alertsResult.error}`);
        return;
      }

      const embed = this.createAlertsEmbed(alertsResult.data, timeframe);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Error in alerts command:`, error);
      await interaction.editReply('❌ An error occurred while getting alerts. Please try again.');
    }
  }

  /**
   * Handle chat command
   */
  async handleChatCommand(interaction, bot) {
    await interaction.deferReply();

    const message = interaction.options.getString('message');
    const userId = interaction.user.id;

    try {
      const result = await bot.aiOrchestrator.processQuery(message, userId, 'discord');

      const embed = this.createChatEmbed(message, result.response, result.intent);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error(`Error in chat command:`, error);
      await interaction.editReply('❌ An error occurred while processing your message. Please try again.');
    }
  }

  /**
   * Handle help command
   */
  async handleHelpCommand(interaction, bot) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 NFT Intelligence AI - Help')
      .setDescription('Welcome to the NFT Intelligence AI Discord bot! Here are the available commands:')
      .setColor('#00ff00')
      .addFields(
        { name: '/analyze', value: 'Analyze a wallet or collection address', inline: true },
        { name: '/market', value: 'Get market insights and trends', inline: true },
        { name: '/risk', value: 'Assess risk for wallet or collection', inline: true },
        { name: '/search', value: 'Search for NFT collections', inline: true },
        { name: '/alerts', value: 'Get recent fraud alerts', inline: true },
        { name: '/chat', value: 'Chat with the AI about NFTs', inline: true },
        { name: '!nft', value: 'Quick chat with the AI (prefix command)', inline: true }
      )
      .addFields(
        { name: '💡 Tips', value: '• Use natural language with /chat\n• Provide full addresses for analysis\n• Check /help anytime for assistance' }
      )
      .setFooter({ text: 'Powered by bitsCrunch x AI Builders Hack 2025' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  /**
   * Handle chat messages (prefix commands)
   */
  async handleChatMessage(message) {
    const query = message.content.substring(4).trim(); // Remove '!nft '
    if (!query) return;

    const userId = message.author.id;

    try {
      const result = await this.aiOrchestrator.processQuery(query, userId, 'discord');

      const embed = this.createChatEmbed(query, result.response, result.intent);
      await message.reply({ embeds: [embed] });

    } catch (error) {
      logger.error('Error handling chat message:', error);
      await message.reply('❌ Sorry, I encountered an error processing your message.');
    }
  }

  /**
   * Create analysis embed
   */
  createAnalysisEmbed(type, address, synthesis, data) {
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`)
      .setDescription(synthesis.substring(0, 2000))
      .setColor('#0099ff')
      .addFields(
        { name: 'Address', value: `\`${address}\``, inline: true },
        { name: 'Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true }
      )
      .setFooter({ text: 'NFT Intelligence AI • bitsCrunch Data' })
      .setTimestamp();

    return embed;
  }

  /**
   * Create market embed
   */
  createMarketEmbed(synthesis, data) {
    const embed = new EmbedBuilder()
      .setTitle('📈 Market Insights')
      .setDescription(synthesis.substring(0, 2000))
      .setColor('#00ff00')
      .setFooter({ text: 'NFT Intelligence AI • Real-time Market Data' })
      .setTimestamp();

    return embed;
  }

  /**
   * Create risk embed
   */
  createRiskEmbed(synthesis, data) {
    const embed = new EmbedBuilder()
      .setTitle('⚠️ Risk Assessment')
      .setDescription(synthesis.substring(0, 2000))
      .setColor('#ff9900')
      .setFooter({ text: 'NFT Intelligence AI • Risk Analysis' })
      .setTimestamp();

    return embed;
  }

  /**
   * Create search embed
   */
  createSearchEmbed(query, results) {
    const embed = new EmbedBuilder()
      .setTitle(`🔍 Search Results: ${query}`)
      .setDescription(`Found ${results.length} collections`)
      .setColor('#0099ff');

    if (results.length > 0) {
      results.slice(0, 5).forEach((result, index) => {
        embed.addFields({
          name: `${index + 1}. ${result.name || 'Unknown'}`,
          value: `Address: \`${result.address}\`\nFloor: ${result.floor_price || 'N/A'} ETH`,
          inline: false
        });
      });
    }

    embed.setFooter({ text: 'NFT Intelligence AI • Collection Search' })
      .setTimestamp();

    return embed;
  }

  /**
   * Create alerts embed
   */
  createAlertsEmbed(alerts, timeframe) {
    const embed = new EmbedBuilder()
      .setTitle(`🚨 Fraud Alerts (${timeframe})`)
      .setDescription(alerts.length > 0 ? 
        `Found ${alerts.length} alerts` : 
        'No fraud alerts detected in this timeframe')
      .setColor('#ff0000')
      .setFooter({ text: 'NFT Intelligence AI • Fraud Detection' })
      .setTimestamp();

    return embed;
  }

  /**
   * Create chat embed
   */
  createChatEmbed(query, response, intent) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 NFT Intelligence AI')
      .setDescription(response.substring(0, 2000))
      .setColor('#00ff00')
      .addFields(
        { name: 'Intent', value: intent.type || 'general', inline: true },
        { name: 'Confidence', value: `${Math.round((intent.confidence || 0) * 100)}%`, inline: true }
      )
      .setFooter({ text: 'NFT Intelligence AI • AI-Powered Analysis' })
      .setTimestamp();

    return embed;
  }
}

module.exports = DiscordBot; 