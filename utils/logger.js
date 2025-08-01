/**
 * Logger utility for NFT Intelligence AI
 * Provides consistent logging across all modules
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const levelUpper = level.toUpperCase();
    
    let formattedMessage = `[${timestamp}] ${levelUpper}: ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  /**
   * Get colored output for console
   */
  getColoredOutput(level, message) {
    const timestamp = this.getTimestamp();
    const levelUpper = level.toUpperCase();
    
    let color = colors.white;
    switch (level) {
      case 'error':
        color = colors.red;
        break;
      case 'warn':
        color = colors.yellow;
        break;
      case 'info':
        color = colors.green;
        break;
      case 'debug':
        color = colors.cyan;
        break;
    }
    
    return `${colors.bright}[${timestamp}]${colors.reset} ${color}${levelUpper}${colors.reset}: ${message}`;
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  /**
   * Log error message
   */
  error(message, data = null) {
    if (!this.shouldLog('error')) return;
    
    const formattedMessage = this.formatMessage('error', message, data);
    const coloredMessage = this.getColoredOutput('error', message);
    
    console.error(coloredMessage);
    if (data) {
      console.error(JSON.stringify(data, null, 2));
    }
    
    // In production, you might want to send to external logging service
    this.logToFile('error', formattedMessage);
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatMessage('warn', message, data);
    const coloredMessage = this.getColoredOutput('warn', message);
    
    console.warn(coloredMessage);
    if (data) {
      console.warn(JSON.stringify(data, null, 2));
    }
    
    this.logToFile('warn', formattedMessage);
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message, data);
    const coloredMessage = this.getColoredOutput('info', message);
    
    console.log(coloredMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    this.logToFile('info', formattedMessage);
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message, data);
    const coloredMessage = this.getColoredOutput('debug', message);
    
    console.log(coloredMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    this.logToFile('debug', formattedMessage);
  }

  /**
   * Log to file (for production environments)
   */
  logToFile(level, message) {
    // In a production environment, you would implement file logging here
    // For now, we'll just use console output
    // You could integrate with services like Winston, Bunyan, or external logging services
  }

  /**
   * Log API request
   */
  logApiRequest(method, url, userId = null, duration = null) {
    const message = `${method} ${url}`;
    const data = {
      method,
      url,
      userId,
      duration: duration ? `${duration}ms` : null
    };
    
    this.info(message, data);
  }

  /**
   * Log API response
   */
  logApiResponse(method, url, statusCode, duration = null) {
    const message = `${method} ${url} - ${statusCode}`;
    const data = {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : null
    };
    
    if (statusCode >= 400) {
      this.warn(message, data);
    } else {
      this.info(message, data);
    }
  }

  /**
   * Log AI interaction
   */
  logAiInteraction(userId, platform, query, response, intent, duration = null) {
    const message = `AI Interaction - ${platform} user ${userId}`;
    const data = {
      userId,
      platform,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      responseLength: response.length,
      intent: intent.type,
      confidence: intent.confidence,
      duration: duration ? `${duration}ms` : null
    };
    
    this.info(message, data);
  }

  /**
   * Log bitsCrunch API call
   */
  logBitsCrunchCall(endpoint, params, success, duration = null) {
    const message = `BitsCrunch API - ${endpoint}`;
    const data = {
      endpoint,
      params,
      success,
      duration: duration ? `${duration}ms` : null
    };
    
    if (success) {
      this.info(message, data);
    } else {
      this.warn(message, data);
    }
  }

  /**
   * Log bot interaction
   */
  logBotInteraction(platform, userId, command, success, duration = null) {
    const message = `Bot Interaction - ${platform} user ${userId}`;
    const data = {
      platform,
      userId,
      command,
      success,
      duration: duration ? `${duration}ms` : null
    };
    
    if (success) {
      this.info(message, data);
    } else {
      this.warn(message, data);
    }
  }

  /**
   * Log system event
   */
  logSystemEvent(event, details = null) {
    const message = `System Event - ${event}`;
    this.info(message, details);
  }

  /**
   * Log performance metric
   */
  logPerformance(operation, duration, metadata = null) {
    const message = `Performance - ${operation}`;
    const data = {
      operation,
      duration: `${duration}ms`,
      ...metadata
    };
    
    if (duration > 5000) {
      this.warn(message, data);
    } else if (duration > 1000) {
      this.info(message, data);
    } else {
      this.debug(message, data);
    }
  }

  /**
   * Log error with stack trace
   */
  logErrorWithStack(error, context = null) {
    const message = error.message || 'Unknown error';
    const data = {
      error: error.message,
      stack: error.stack,
      context
    };
    
    this.error(message, data);
  }

  /**
   * Create child logger with context
   */
  child(context) {
    const childLogger = new Logger();
    childLogger.context = context;
    
    // Override formatMessage to include context
    const originalFormatMessage = childLogger.formatMessage.bind(childLogger);
    childLogger.formatMessage = (level, message, data) => {
      const contextPrefix = `[${context}] `;
      return contextPrefix + originalFormatMessage(level, message, data);
    };
    
    return childLogger;
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger; 