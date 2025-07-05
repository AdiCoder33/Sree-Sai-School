const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('role', sql.VarChar, req.user.role)
      .query(`
        SELECT TOP 50 n.*, u.firstName as creatorFirstName, u.lastName as creatorLastName
        FROM notifications n
        LEFT JOIN users u ON n.created_by = u.id
        WHERE n.target_role = @role OR n.target_role = 'all'
        ORDER BY n.created_at DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get notifications error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('notification_id', sql.VarChar, req.params.id)
      .input('user_id', sql.VarChar, req.user.id)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM notification_reads 
          WHERE notification_id = @notification_id AND user_id = @user_id
        )
        INSERT INTO notification_reads (notification_id, user_id)
        VALUES (@notification_id, @user_id)
      `);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Mark notification read error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const notifications = await pool.request()
      .input('role', sql.VarChar, req.user.role)
      .query(`
        SELECT id FROM notifications 
        WHERE target_role = @role OR target_role = 'all'
      `);

    for (const { id } of notifications.recordset) {
      await pool.request()
        .input('notification_id', sql.VarChar, id)
        .input('user_id', sql.VarChar, req.user.id)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM notification_reads 
            WHERE notification_id = @notification_id AND user_id = @user_id
          )
          INSERT INTO notification_reads (notification_id, user_id)
          VALUES (@notification_id, @user_id)
        `);
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Mark all notifications read error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create fee request notification
router.post('/fee-request', authenticateToken, async (req, res) => {
  try {
    const { studentId, amount, dueDate, description } = req.body;
    const notificationId = uuidv4();
    const message = `${description || 'Fee payment'} of $${amount} is due on ${dueDate}`;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, notificationId)
      .input('type', sql.VarChar, 'fee_request')
      .input('title', sql.VarChar, 'Fee Payment Due')
      .input('message', sql.VarChar, message)
      .input('target_role', sql.VarChar, 'parent')
      .input('priority', sql.VarChar, 'high')
      .input('created_by', sql.VarChar, req.user.id)
      .query(`
        INSERT INTO notifications (id, type, title, message, target_role, priority, created_by)
        VALUES (@id, @type, @title, @message, @target_role, @priority, @created_by)
      `);

    res.status(201).json({ message: 'Fee request notification created', id: notificationId });
  } catch (error) {
    console.error('❌ Create fee request error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
