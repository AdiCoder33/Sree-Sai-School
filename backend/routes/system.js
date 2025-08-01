const express = require('express');
const { poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Health endpoint reused from server.js
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Database size in KB
router.get('/db-size', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT SUM(size) * 8 AS size_kb
      FROM sys.database_files
    `);
    const sizeKB = result.recordset[0].size_kb || 0;
    res.json({ sizeKB });
  } catch (error) {
    console.error('DB size query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch database size', message: error.message });
  }
});

// Check status of key routes
router.get('/route-status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const base = `${req.protocol}://${req.get('host')}/api`;
  const authHeader = req.headers['authorization'] ? { Authorization: req.headers['authorization'] } : {};
  const routes = [
    'classes',
    'students',
    'users',
    'announcements',
    'events',
    'fees',
    'settings',
    'notifications',
    'learninglogs'
  ];

  const status = {};

  await Promise.all(routes.map(async (r) => {
    try {
      const resHead = await fetch(`${base}/${r}`, { method: 'HEAD', headers: authHeader });
      status[r] = resHead.ok ? 'online' : `error (${resHead.status})`;
    } catch (err) {
      status[r] = err.message;
    }
  }));

  res.json(status);
});

module.exports = router;
