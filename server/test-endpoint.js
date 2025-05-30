/**
 * Test Endpoint Script
 * 
 * This script adds a simple test endpoint to verify the server is handling requests correctly.
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

module.exports = router;