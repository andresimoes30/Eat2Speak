/**
 * Express.js Server - Production Ready Configuration
 * 
 * Main entry point for the Eat2Speak backend API server.
 * Sets up Express with middleware, connects to the database,
 * configures routes, and handles errors.
 * 
 * Configured for deployment to hosting services with:
 * - Environment variable support for PORT
 * - File-based logging
 * - CORS and security optimizations
 * - Graceful shutdown handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('./src/config/db.config');
const logger = require('./src/utils/logger');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure file logging for production
const logFilePath = path.join(logsDir, 'server.log');
logger.configureFileTransport(logFilePath);
logger.info(`Server starting - Logs will be saved to ${logFilePath}`);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

logger.info(`Starting server in ${NODE_ENV} mode`);

// Security middleware - Enhanced for authentication security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your needs
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
})); // Enhanced security headers

// CORS configuration - optimized for production with secure defaults
app.use(cors({
  // In production, restrict origins to known domains
  origin: isProduction ? 
    ['https://yourapp.com', 'https://www.yourapp.com'] : // Adjust with your actual domains
    '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Force HTTPS in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && req.secure === false) {
      // Redirect to HTTPS with 301 (permanent) redirect
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Add cookie security settings
app.use((req, res, next) => {
  res.cookie('cookieName', 'cookieValue', {
    httpOnly: true, // Prevent client-side JavaScript from accessing cookies
    secure: isProduction, // Only send cookies over HTTPS in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 3600000 // 1 hour expiry
  });
  next();
});

// Import rate limiter for API protection
const rateLimit = require('express-rate-limit');

// Global API rate limiter - prevents abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  // Log rate limit hits
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, { 
      path: req.path,
      method: req.method
    });
    res.status(options.message.status).json(options.message);
  }
});

// Apply rate limiting to all requests
app.use(apiLimiter);

// Set default content type for all responses - helps with CloudLinux NodeJS Selector
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ limit: '1mb' })); // Parse JSON request bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Parse URL-encoded bodies with size limit

// Request logging middleware
app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logger.http(`${clientIP} - ${req.method} ${req.url}`);
  next();
});

// Enhanced security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set Cache-Control to prevent sensitive information caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

// Security monitoring middleware - detect and log potential attacks
app.use((req, res, next) => {
  // Check for common attack patterns in URL
  const url = req.url.toLowerCase();
  const suspiciousPatterns = [
    'union+select', 'concat(', 'group_concat', 'exec(', 'eval(', '<script',
    '../', '..\\', '/etc/passwd', 'cmd.exe'
  ];
  
  if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
    logger.warn(`Potential attack detected in URL: ${req.url}`, {
      ip: req.ip,
      method: req.method,
      userAgent: req.headers['user-agent']
    });
  }
  
  // Check for suspicious headers that might indicate attacks
  const suspiciousHeaders = ['user-agent', 'referer', 'x-forwarded-for'];
  suspiciousHeaders.forEach(header => {
    const headerValue = req.headers[header];
    if (headerValue && typeof headerValue === 'string' && 
        suspiciousPatterns.some(pattern => headerValue.toLowerCase().includes(pattern))) {
      logger.warn(`Potential attack detected in ${header} header: ${headerValue}`, {
        ip: req.ip,
        method: req.method,
        path: req.url
      });
    }
  });
  
  next();
});

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: (msg) => logger.debug(msg)
  }
);

// Test database connection
(async () => {
  const maxRetries = 5;
  let retries = 0;
  let connected = false;
  
  while (!connected && retries < maxRetries) {
    try {
      await sequelize.authenticate();
      connected = true;
      logger.info('Database connection established successfully');
    } catch (error) {
      retries++;
      const retryDelay = Math.min(1000 * Math.pow(2, retries), 30000); // Exponential backoff with 30s max
      logger.error(`Failed to connect to database (attempt ${retries}/${maxRetries}): ${error.message}`);
      logger.info(`Retrying in ${retryDelay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  if (!connected) {
    logger.error(`Failed to connect to database after ${maxRetries} attempts`);
    // Continue server startup even if DB fails - it will retry connections later
  }
})();

// Status endpoint for monitoring
app.get('/status', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  return res.status(200).json({
    status: 'OK',
    uptime: uptime,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint - without executing database queries
app.get('/health', async (req, res) => {
  try {
    // Check if database connection is ready
    const dbConnected = sequelize.authenticate()
      .then(() => true)
      .catch(() => false);
    
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: await dbConnected ? 'connected' : 'not_connected',
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Import API routes
try {
  // Import route modules
  const authRoutes = require('./src/routes/auth.routes');
  const userRoutes = require('./src/routes/user.routes');
  const testRoutes = require('./src/routes/test.routes');
  
  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/test', testRoutes);
  
  logger.info('API routes loaded successfully');
} catch (error) {
  logger.error(`Failed to load API routes: ${error.message}`);
  
  // Fallback route handler
  app.use('/api', (req, res) => {
    res.status(500).json({
      message: 'API routes failed to load properly',
      error: isProduction ? 'Internal server error' : error.message // Hide details in production
    });
  });
}

// Add basic route for testing server functionality
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    time: new Date().toISOString(),
    env: NODE_ENV
  });
});

// Root path response
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Eat2Speak API is running',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Add test routes for debugging - disable in production
if (!isProduction) {
  app.get('/test-db', async (req, res) => {
    try {
      await sequelize.authenticate();
      res.status(200).json({
        message: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Database test failed: ${error.message}`);
      res.status(500).json({
        message: 'Database connection failed',
        error: error.message
      });
    }
  });
} else {
  // In production, redirect test endpoints to 404
  app.all(['/test-db'], (req, res) => {
    logger.warn(`Attempt to access test endpoint in production: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not found' });
  });
}

// 404 handler
app.use((req, res, next) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler - hides implementation details in production
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = isProduction 
    ? 'Internal Server Error' // Generic message in production
    : (err.message || 'Internal Server Error');
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server - explicitly listening on all interfaces to allow connections from any device
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
  
  // Log network interfaces to help with configuration
  try {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    logger.info('Available on network interfaces:');
    
    // Log each network interface and its addresses
    Object.keys(networkInterfaces).forEach(interfaceName => {
      const addresses = networkInterfaces[interfaceName];
      addresses.forEach(address => {
        // Only show IPv4 addresses that aren't internal
        if (address.family === 'IPv4' && !address.internal) {
          logger.info(`  http://${address.address}:${PORT} (${interfaceName})`);
        }
      });
    });
    
    // Note for production deployment
    if (isProduction) {
      logger.info('Server running in production mode');
      logger.info('For BananaHosting deployment, ensure NODE_ENV=production is set');
    }
  } catch (error) {
    logger.error(`Failed to log network interfaces: ${error.message}`);
  }
});

// Graceful shutdown with enhanced production handling
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Set a timeout to force exit if graceful shutdown takes too long
  const forceExitTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out after 30s, forcing exit');
    process.exit(1);
  }, 30000);
  
  // Set a flag to stop accepting new requests
  app.use((req, res, next) => {
    res.status(503).json({ message: 'Server is shutting down' });
  });
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed - no longer accepting new connections');
  });
  
  // Close database connections
  try {
    logger.info('Closing database connections...');
    await sequelize.close();
    logger.info('Database connections closed successfully');
    
    // Clear the force exit timeout
    clearTimeout(forceExitTimeout);
    
    // Write final log message
    logger.info('Graceful shutdown completed successfully');
    
    // Allow time for final log writes
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } catch (error) {
    logger.error(`Error during graceful shutdown: ${error.message}`);
    clearTimeout(forceExitTimeout);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Add a process exception handler to prevent crashes
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  
  // In production, we want to keep the server running despite uncaught exceptions
  if (!isProduction) {
    process.exit(1);
  }
});

// Export for testing
module.exports = server;