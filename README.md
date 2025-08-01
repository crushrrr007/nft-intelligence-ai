# 🤖 NFT Intelligence AI

> **AI-powered NFT analytics platform for the bitsCrunch x AI Builders Hack 2025**

A comprehensive multi-platform system that combines advanced AI with blockchain data analysis to provide intelligent NFT insights across Discord, Telegram, and Web platforms.

## 🎯 Project Overview

**Target**: Win "Best AI Builders Hack" ($500 + 50K BCUT)

This project demonstrates the power of AI + bitsCrunch API integration, building real-world bot and risk assessment tools that showcase the potential of NFT/wallet data in the AI ecosystem.

## 🏗️ Core Architecture

```
User Query → AI Intent Analysis → AI Orchestration → Multiple API Calls → AI Synthesis → Intelligent Response + Learning
```

### Three Main Features

1. **🤖 Omni-Channel AI Agent** - Same AI personality across Discord, Telegram, and Web
2. **💬 Conversational AI NFT Analyst** - Natural dialogue with learning capabilities  
3. **🔮 Predictive AI Risk Engine** - AI predicts market movements before they happen

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Bots**: Discord.js + Telegram Bot API
- **AI**: OpenAI/Claude API integration
- **Data**: bitsCrunch API (NFT/wallet analytics)
- **Frontend**: Will be built separately with Lovable AI

## 📁 Project Structure

```
nft-intelligence-ai/
├── app.js                 # Main entry point
├── package.json           # Dependencies and scripts
├── env.example           # Environment configuration template
├── README.md             # This file
└── src/
    ├── ai/
    │   ├── orchestrator.js    # AI brain (intent analysis, orchestration)
    │   ├── memory.js          # Conversation memory system
    │   └── prompts.js         # AI prompt templates
    ├── api/
    │   ├── bitscrunch.js      # bitsCrunch API integration
    │   └── routes.js          # Web API endpoints
    ├── bots/
    │   ├── discord.js         # Discord bot implementation
    │   └── telegram.js        # Telegram bot implementation
    └── utils/
        ├── logger.js          # Logging utility
        └── helpers.js         # Helper functions
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- API keys for:
  - OpenAI or Anthropic
  - bitsCrunch
  - Discord Bot (optional)
  - Telegram Bot (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nft-intelligence-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Environment Configuration

Copy `env.example` to `.env` and configure:

```env
# Required
OPENAI_API_KEY=your_openai_api_key
BITSCRUNCH_API_KEY=your_bitscrunch_api_key

# Optional (for bots)
DISCORD_BOT_TOKEN=your_discord_bot_token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

## 🔧 API Endpoints

### Core Endpoints

- `GET /health` - Health check
- `POST /api/chat` - AI conversation
- `POST /api/analyze/wallet` - Wallet analysis
- `POST /api/analyze/collection` - Collection analysis
- `POST /api/market/insights` - Market insights
- `POST /api/risk/assessment` - Risk assessment

### Utility Endpoints

- `GET /api/search/collections` - Search collections
- `GET /api/fraud/alerts` - Get fraud alerts
- `GET /api/conversation/history/:userId` - Get conversation history
- `DELETE /api/conversation/memory/:userId` - Clear conversation memory

## 🤖 Bot Features

### Discord Bot

**Slash Commands:**
- `/analyze <type> <address>` - Analyze wallet or collection
- `/market [timeframe]` - Get market insights
- `/risk <address>` - Assess risk
- `/search <query>` - Search collections
- `/alerts [timeframe]` - Get fraud alerts
- `/chat <message>` - Chat with AI
- `/help` - Show help

**Prefix Commands:**
- `!nft <message>` - Quick chat with AI

### Telegram Bot

**Commands:**
- `/start` - Welcome message
- `/analyze <address>` - Analyze wallet or collection
- `/market` - Get market insights
- `/risk <address>` - Assess risk
- `/search <query>` - Search collections
- `/alerts` - Get fraud alerts
- `/help` - Show help

**Natural Language:**
- Send any message to chat with the AI

## 🧠 AI Capabilities

### Intent Analysis
- **Wallet Analysis**: Analyze transaction history, risk profiles, trading patterns
- **Collection Analysis**: Evaluate health metrics, market performance, trends
- **Market Insights**: Provide market context, trends, and opportunities
- **Risk Assessment**: Identify risks, fraud detection, mitigation strategies
- **General Questions**: Educational content about NFTs and blockchain

### Conversation Memory
- Cross-platform conversation continuity
- Context-aware responses
- Learning from user interactions
- Personalized recommendations

### Data Synthesis
- Intelligent analysis of bitsCrunch data
- Pattern recognition and trend identification
- Risk assessment and scoring
- Actionable insights and recommendations

## 📊 bitsCrunch API Integration

### Available Endpoints
- Wallet analysis and risk scoring
- Collection health metrics
- Market insights and trends
- Real-time transaction monitoring
- Fraud detection and alerts
- Collection search and discovery

### Data Processing
- Real-time data fetching
- Intelligent data synthesis
- Risk assessment algorithms
- Trend analysis and predictions

## 🔒 Security Features

- Input sanitization and validation
- Rate limiting and request throttling
- CORS protection
- Error handling and logging
- Secure API key management

## 📈 Performance Features

- Request caching and optimization
- Async processing and non-blocking operations
- Memory management and cleanup
- Performance monitoring and logging
- Retry mechanisms with exponential backoff

## 🧪 Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
npm run format
```

### Development Mode
```bash
npm run dev
```

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure all required API keys
3. Set up proper logging and monitoring
4. Configure rate limiting and security
5. Set up database/Redis for production (future)

### Docker Deployment
```bash
docker build -t nft-intelligence-ai .
docker run -p 3000:3000 nft-intelligence-ai
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Objectives

This project aligns with the bitsCrunch x AI Builders Hack 2025 objectives:

- ✅ **AI + bitsCrunch Integration**: Demonstrates powerful API integration patterns
- ✅ **Real-world Applications**: Builds practical bot and risk assessment tools
- ✅ **NFT/Blockchain Focus**: Showcases the power of NFT/wallet data in AI
- ✅ **SDK Promotion**: Promotes bitsCrunch SDK adoption through examples
- ✅ **Innovation**: Demonstrates AI-first approach to blockchain analytics

## 🔮 Future Enhancements

- **Database Integration**: Persistent conversation storage
- **Advanced Analytics**: Machine learning models for predictions
- **Real-time Alerts**: WebSocket-based notifications
- **Mobile App**: React Native mobile application
- **Advanced UI**: Rich web interface with charts and visualizations
- **Multi-chain Support**: Support for other blockchains
- **API Marketplace**: Public API for third-party integrations

## 📞 Support

For questions or support:
- Create an issue in this repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the bitsCrunch x AI Builders Hack 2025** 