const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up NFT Intelligence AI for bitsCrunch x AI Builders Hack 2025...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# NFT Intelligence AI - REAL APIs Configuration
# For bitsCrunch x AI Builders Hack 2025

# Server Configuration
PORT=3000
NODE_ENV=development

# REAL APIS - Set to false for production
DEMO_MODE=false

# AI Provider Configuration (Choose ONE)
AI_PROVIDER=gemini

# Google Gemini (COMPLETELY FREE)
# Get at: https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_free_gemini_key_here

# Alternative: OpenAI (if you have credits)
# OPENAI_API_KEY=sk-proj-your_openai_key_here

# bitsCrunch API (FREE for hackathon)
# Get at: https://unleashNFTs.com
BITSCRUNCH_API_KEY=your_free_bitscrunch_key_here
BITSCRUNCH_BASE_URL=https://api.bitscrunch.com

# Optional Bot Configuration
ENABLE_DISCORD_BOT=false
DISCORD_BOT_TOKEN=your_discord_bot_token_here

ENABLE_TELEGRAM_BOT=false
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('✅ .env file already exists');
}

// Create directories if they don't exist
const directories = [
  'ai',
  'api', 
  'bots',
  'utils'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}/`);
  } else {
    console.log(`✅ Directory exists: ${dir}/`);
  }
});

// Create utils/logger.js if it doesn't exist
const loggerPath = path.join(__dirname, 'utils', 'logger.js');
if (!fs.existsSync(loggerPath)) {
  const loggerContent = `const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  debug(message, data = null) {
    if (this.logLevel === 'debug') {
      this.log('DEBUG', message, data);
    }
  }

  log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = \`[\${timestamp}] \${level}: \${message}\`;
    
    console.log(logMessage);
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

module.exports = new Logger();`;

  fs.writeFileSync(loggerPath, loggerContent);
  console.log('✅ Created utils/logger.js');
}

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Get FREE API keys:');
console.log('   - Google Gemini: https://aistudio.google.com/app/apikey');
console.log('   - bitsCrunch: https://unleashNFTs.com');
console.log('2. Update .env file with your real API keys');
console.log('3. Run: npm install');
console.log('4. Run: npm start');
console.log('\n🏆 Ready for bitsCrunch x AI Builders Hack 2025!');