const express = require('express');
const { poolPromise, sql } = require('../config/database');
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
      SELECT SUM(reserved_page_count) * 8 AS size_kb
      FROM sys.dm_db_partition_stats
    `);
    const sizeKB = result.recordset[0].size_kb || 0;
    res.json({ sizeKB });
  } catch (error) {
    console.error('DB size query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch database size', message: error.message });
  }
});

module.exports = router;
