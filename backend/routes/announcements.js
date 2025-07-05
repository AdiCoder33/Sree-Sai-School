const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT a.*, u.firstName as creatorFirstName, u.lastName as creatorLastName
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get announcements error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { title, message, targetAudience, priority } = req.body;
    const announcementId = uuidv4();
    const notificationId = uuidv4();
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, announcementId)
      .input('title', sql.VarChar, title)
      .input('message', sql.Text, message)
      .input('target_audience', sql.VarChar, targetAudience)
      .input('priority', sql.VarChar, priority || 'medium')
      .input('created_by', sql.VarChar, req.user.id)
      .query(`
        INSERT INTO announcements (id, title, message, target_audience, priority, created_by)
        VALUES (@id, @title, @message, @target_audience, @priority, @created_by)
      `);

    await pool.request()
      .input('id', sql.VarChar, notificationId)
      .input('type', sql.VarChar, 'announcement')
      .input('title', sql.VarChar, title)
      .input('message', sql.Text, message)
      .input('target_role', sql.VarChar, targetAudience)
      .input('priority', sql.VarChar, priority || 'medium')
      .input('created_by', sql.VarChar, req.user.id)
      .query(`
        INSERT INTO notifications (id, type, title, message, target_role, priority, created_by)
        VALUES (@id, @type, @title, @message, @target_role, @priority, @created_by)
      `);

    res.status(201).json({ message: 'Announcement created successfully', id: announcementId });
  } catch (error) {
    console.error('❌ Create announcement error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update announcement
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, targetAudience, priority } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('title', sql.VarChar, title)
      .input('message', sql.Text, message)
      .input('target_audience', sql.VarChar, targetAudience)
      .input('priority', sql.VarChar, priority)
      .query(`
        UPDATE announcements 
        SET title = @title, message = @message, target_audience = @target_audience, priority = @priority
        WHERE id = @id
      `);

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('❌ Update announcement error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM announcements WHERE id = @id');

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('❌ Delete announcement error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
