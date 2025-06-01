/**
 * Logger Utility
 * 
 * Configurable logging utility using Winston for structured logging
 * throughout the application. Supports different log levels based on
 * environment and can output to console and/or files.
 * 
 * Features:
 * - Console logging with colorized output
 * - File-based logging with JSON format
 * - Environment-based log levels
 * - Runtime configuration of log destinations
 * - Support for hosting environments
 * - Secure authentication logging with PII redaction
 * - Security event logging for audit trails
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Define log levels and colors with security levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Track active file transports for management
let activeFileTransports = [];

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Determine log level from environment or default to 'info'
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Redact sensitive information in logs
const redactSensitiveInfo = winston.format((info) => {
  // Create a deep copy to avoid mutating the original object
  const sanitizedInfo = JSON.parse(JSON.stringify(info));
  
  // Check if metadata exists
  if (sanitizedInfo.meta) {
    // Redact sensitive fields if they exist
    if (sanitizedInfo.meta.password) sanitizedInfo.meta.password = '[REDACTED]';
    if (sanitizedInfo.meta.passwordHash) sanitizedInfo.meta.passwordHash = '[REDACTED]';
    if (sanitizedInfo.meta.token) sanitizedInfo.meta.token = '[REDACTED]';
    
    // Partial redaction of sensitive fields (show only parts)
    if (sanitizedInfo.meta.email && typeof sanitizedInfo.meta.email === 'string') {
      const parts = sanitizedInfo.meta.email.split('@');
      if (parts.length === 2) {
        sanitizedInfo.meta.email = `${parts[0].substring(0, 3)}***@${parts[1]}`;
      }
    }
    
    // Partial redaction of IP addresses (show only first part)
    if (sanitizedInfo.meta.ipAddress && typeof sanitizedInfo.meta.ipAddress === 'string') {
      const parts = sanitizedInfo.meta.ipAddress.split('.');
      if (parts.length === 4) {
        sanitizedInfo.meta.ipAddress = `${parts[0]}.${parts[1]}.***.***`;
      }
    }
  }
  
  return sanitizedInfo;
});

// Define format for file output (JSON for easier parsing) with sensitive info redaction
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  redactSensitiveInfo(),
  winston.format.json()
);

// Define security-specific format for authentication logs
const authLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.label({ label: 'AUTH' }),
  redactSensitiveInfo(),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add default file transports in production environment
if (process.env.NODE_ENV === 'production') {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const errorTransport = new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  });
  
  const combinedTransport = new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  });
  
  transports.push(errorTransport, combinedTransport);
  activeFileTransports.push(errorTransport, combinedTransport);
}

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

// Add stream for Morgan HTTP logger middleware integration
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Configure a custom file transport at runtime
 * Useful for production hosting where you need to specify log locations
 * 
 * @param {string} filePath - Path to the log file
 * @param {Object} options - Additional options for the transport
 * @returns {winston.transport} - The created file transport
 */
logger.configureFileTransport = (filePath, options = {}) => {
  // Ensure the directory exists
  const logDir = path.dirname(filePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Remove any existing custom file transports with the same path
  logger.transports.forEach((transport, index) => {
    if (transport instanceof winston.transports.File && 
        transport.filename === filePath) {
      logger.transports.splice(index, 1);
    }
  });
  
  // Create a new file transport with default options
  const defaultOptions = {
    filename: filePath,
    format: fileFormat,
    maxsize: options.maxsize || 10485760, // 10MB default
    maxFiles: options.maxFiles || 5,
    level: options.level || 'info',
  };
  
  // Create and add the transport
  const fileTransport = new winston.transports.File(defaultOptions);
  logger.add(fileTransport);
  activeFileTransports.push(fileTransport);
  
  logger.info(`Configured logging to file: ${filePath}`);
  return fileTransport;
};

/**
 * Close and remove all file transports
 * Useful for cleanup before exiting the application
 */
logger.closeFileTransports = () => {
  activeFileTransports.forEach(transport => {
    logger.remove(transport);
    if (transport.close) {
      transport.close();
    }
  });
  activeFileTransports = [];
  logger.info('Closed all file transports');
};

// Configure auth log transport for production
if (process.env.NODE_ENV === 'production') {
  const logsDir = path.join(process.cwd(), 'logs');
  const authLogPath = path.join(logsDir, 'auth.log');
  
  // Create authentication-specific log file
  const authTransport = new winston.transports.File({
    filename: authLogPath,
    format: authLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10, // Keep more auth logs for compliance
  });
  
  transports.push(authTransport);
  activeFileTransports.push(authTransport);
  
  logger.info(`Configured authentication logging to ${authLogPath}`);
}

/**
 * Log authentication events with proper sanitization
 * @param {string} event - The authentication event type
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Event message
 * @param {object} data - Additional event data (will be sanitized)
 */
logger.authEvent = (event, level, message, data = {}) => {
  // Create structured log entry
  const logEntry = {
    auth_event: event,
    message,
    meta: { ...data, timestamp: new Date().toISOString() }
  };
  
  // Log at the appropriate level
  switch (level) {
    case 'error':
      logger.error(logEntry);
      break;
    case 'warn':
      logger.warn(logEntry);
      break;
    case 'info':
    default:
      logger.info(logEntry);
      break;
  }
};

// Helper methods for common auth events
logger.authSuccess = (userId, message, data = {}) => {
  logger.authEvent('success', 'info', message, { userId, ...data });
};

logger.authFailure = (message, data = {}) => {
  logger.authEvent('failure', 'warn', message, data);
};

logger.authError = (message, error, data = {}) => {
  logger.authEvent('error', 'error', message, { 
    ...data, 
    errorMessage: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

module.exports = logger;