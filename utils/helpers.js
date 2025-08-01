/**
 * Helper utilities for NFT Intelligence AI
 * Common functions used across the application
 */

const logger = require('./logger');

/**
 * Validate Ethereum address format
 */
function isValidEthereumAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Check if it's a valid Ethereum address format
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
}

/**
 * Validate and normalize wallet address
 */
function normalizeWalletAddress(address) {
  if (!address) return null;
  
  // Remove whitespace and convert to lowercase
  const normalized = address.trim().toLowerCase();
  
  // Check if it's a valid Ethereum address
  if (!isValidEthereumAddress(normalized)) {
    return null;
  }
  
  return normalized;
}

/**
 * Extract wallet addresses from text
 */
function extractWalletAddresses(text) {
  if (!text || typeof text !== 'string') return [];
  
  const ethereumAddressRegex = /0x[a-fA-F0-9]{40}/gi;
  const matches = text.match(ethereumAddressRegex) || [];
  
  // Normalize and deduplicate addresses
  const addresses = [...new Set(matches.map(addr => addr.toLowerCase()))];
  
  return addresses.filter(addr => isValidEthereumAddress(addr));
}

/**
 * Extract collection names from text
 */
function extractCollectionNames(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Common NFT collection patterns
  const patterns = [
    /(?:Bored Ape|BAYC|Bored Ape Yacht Club)/gi,
    /(?:CryptoPunks?|Punks?)/gi,
    /(?:Azuki)/gi,
    /(?:Doodles)/gi,
    /(?:Moonbirds?)/gi,
    /(?:CloneX)/gi,
    /(?:Meebits)/gi,
    /(?:Cool Cats)/gi,
    /(?:World of Women|WoW)/gi,
    /(?:Mutant Ape|MAYC)/gi
  ];
  
  const collections = [];
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      collections.push(...matches);
    }
  });
  
  return [...new Set(collections)];
}

/**
 * Format ETH amount with proper decimals
 */
function formatEthAmount(amount, decimals = 4) {
  if (amount === null || amount === undefined) return 'N/A';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return 'N/A';
  
  return num.toFixed(decimals);
}

/**
 * Format large numbers with K, M, B suffixes
 */
function formatLargeNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  
  const number = parseFloat(num);
  if (isNaN(number)) return 'N/A';
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + 'B';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  } else {
    return number.toString();
  }
}

/**
 * Calculate percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0 || oldValue === null || newValue === null) return null;
  
  const change = ((newValue - oldValue) / oldValue) * 100;
  return parseFloat(change.toFixed(2));
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  }
}

/**
 * Parse timeframe string to milliseconds
 */
function parseTimeframe(timeframe) {
  const timeframes = {
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000
  };
  
  return timeframes[timeframe] || timeframes['7d'];
}

/**
 * Generate unique user ID
 */
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Sanitize user input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate API response
 */
function validateApiResponse(response) {
  if (!response) return false;
  
  // Check if response has required fields
  if (typeof response !== 'object') return false;
  
  // Check if response has success field
  if (response.success === false) return false;
  
  return true;
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Retry attempt ${attempt} failed, retrying in ${delay}ms`, { error: error.message });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Merge objects deeply
 */
function deepMerge(target, source) {
  const result = deepClone(target);
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Generate random string
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if string is valid JSON
 */
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text, maxLength = 100) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Measure execution time
 */
async function measureExecutionTime(fn, operationName = 'Operation') {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    logger.logPerformance(operationName, duration);
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - start;
    logger.logPerformance(operationName, duration, { error: error.message });
    throw error;
  }
}

module.exports = {
  isValidEthereumAddress,
  normalizeWalletAddress,
  extractWalletAddresses,
  extractCollectionNames,
  formatEthAmount,
  formatLargeNumber,
  calculatePercentageChange,
  getTimeAgo,
  parseTimeframe,
  generateUserId,
  sanitizeInput,
  validateApiResponse,
  retryWithBackoff,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  generateRandomString,
  isValidJSON,
  truncateText,
  getFileExtension,
  isValidEmail,
  sleep,
  measureExecutionTime
}; 