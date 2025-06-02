/**
 * Test Routes
 * 
 * This module provides test endpoints to verify the server is handling requests correctly
 * and to help debug request data.
 */

const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Test endpoint working correctly',
    timestamp: new Date().toISOString()
  });
});

// Echo endpoint to debug request data
router.post('/echo', (req, res) => {
  res.status(200).json({
    message: 'Echo endpoint',
    receivedData: {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    }
  });
});

// System info endpoint
router.get('/info', (req, res) => {
  const os = require('os');
  
  res.status(200).json({
    message: 'System information',
    systemInfo: {
      hostname: os.hostname(),
      platform: os.platform(),
      cpus: os.cpus().length,
      architecture: os.arch(),
      memoryTotal: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      memoryFree: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      uptime: os.uptime()
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;