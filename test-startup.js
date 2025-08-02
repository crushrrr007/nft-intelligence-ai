require('dotenv').config();
const axios = require('axios');

console.log('🧪 Testing NFT Intelligence AI Setup...\n');

// Test environment variables
console.log('📋 Environment Check:');
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`✅ PORT: ${process.env.PORT || 3000}`);
console.log(`✅ AI_PROVIDER: ${process.env.AI_PROVIDER || 'not set'}`);
console.log(`✅ DEMO_MODE: ${process.env.DEMO_MODE || 'not set'}`);

// Check API keys
console.log('\n🔑 API Keys Check:');
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const bitsCrunchKey = process.env.BITSCRUNCH_API_KEY;

if (geminiKey && geminiKey !== 'your_free_gemini_key_here') {
  console.log('✅ Google Gemini API key configured');
} else {
  console.log('⚠️  Google Gemini API key not configured (get free at: https://aistudio.google.com/app/apikey)');
}

if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
  console.log('✅ OpenAI API key configured');
} else {
  console.log('ℹ️  OpenAI API key not configured (optional)');
}

if (bitsCrunchKey && bitsCrunchKey !== 'your_free_bitscrunch_key_here') {
  console.log('✅ bitsCrunch API key configured');
} else {
  console.log('⚠️  bitsCrunch API key not configured (get free at: https://unleashNFTs.com)');
}

// Test dependencies
console.log('\n📦 Dependencies Check:');
try {
  require('express');
  console.log('✅ Express.js installed');
} catch (e) {
  console.log('❌ Express.js not installed - run: npm install');
}

try {
  require('@google/generative-ai');
  console.log('✅ Google Generative AI installed');
} catch (e) {
  console.log('⚠️  Google Generative AI not installed - run: npm install @google/generative-ai');
}

try {
  require('axios');
  console.log('✅ Axios installed');
} catch (e) {
  console.log('❌ Axios not installed - run: npm install');
}

// Test file structure
console.log('\n📁 File Structure Check:');
const fs = require('fs');
const requiredFiles = [
  'app.js',
  'package.json',
  '.env',
  'ai/orchestrator.js',
  'api/bitscrunch.js',
  'api/routes.js',
  'utils/logger.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🎯 Recommendations:');

if (!geminiKey || geminiKey === 'your_free_gemini_key_here') {
  console.log('1. 🆓 Get FREE Google Gemini API key: https://aistudio.google.com/app/apikey');
}

if (!bitsCrunchKey || bitsCrunchKey === 'your_free_bitscrunch_key_here') {
  console.log('2. 🆓 Get FREE bitsCrunch API key: https://unleashNFTs.com');
}

console.log('3. 🚀 Once configured, run: npm start');
console.log('4. 🧪 Test at: http://localhost:3000/demo');

console.log('\n🏆 Ready for bitsCrunch x AI Builders Hack 2025!');