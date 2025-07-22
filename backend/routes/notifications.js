const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/notifications
 * ✅ Fetch notifications for current user with read status
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;
    let role = req.user.role?.toLowerCase();

    // Normalize role
    if (role === 'teacher') role = 'teachers';
    else if (role === 'student') role = 'students';

    let query = `
      SELECT TOP 50 
        n.*, 
        u.firstName AS creatorFirstName, 
        u.lastName AS creatorLastName,
        CASE 
          WHEN nr.user_id IS NOT NULL THEN 1 ELSE 0
        END AS isRead
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN notification_reads nr 
        ON nr.notification_id = n.id AND nr.user_id = @userId
    `;

    // Role-based filtering
    if (role === 'parent') {
      query += ` WHERE LOWER(n.target_role) IN ('students', 'all')`;
    } else if (role !== 'admin') {
      query += ` WHERE LOWER(n.target_role) IN (@role, 'all')`;
    }

    query += ` ORDER BY n.created_at DESC`;

    const request = pool.request().input('userId', sql.VarChar, userId);
    if (role !== 'admin' && role !== 'parent') {
      request.input('role', sql.VarChar, role);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get notifications error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * ✅ Mark a single notification as read by current user
 */
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
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/notifications/read-all
 * ✅ Mark all visible notifications as read by current user
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;
    let role = req.user.role?.toLowerCase();

    if (role === 'teacher') role = 'teachers';
    else if (role === 'student') role = 'students';

    const request = pool.request().input('user_id', sql.VarChar, userId);
    let fetchQuery = '';

    if (role === 'admin') {
      fetchQuery = `SELECT id FROM notifications`;
    } else if (role === 'parent') {
      fetchQuery = `SELECT id FROM notifications WHERE LOWER(target_role) IN ('students', 'all')`;
    } else {
      fetchQuery = `SELECT id FROM notifications WHERE LOWER(target_role) IN (@role, 'all')`;
      request.input('role', sql.VarChar, role);
    }

    const result = await request.query(fetchQuery);

    for (const { id } of result.recordset) {
      await pool.request()
        .input('notification_id', sql.VarChar, id)
        .input('user_id', sql.VarChar, userId)
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
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/notifications/fee-request
 * ✅ Create a fee request notification (for parents)
 */
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
      .input('target_role', sql.VarChar, 'parents')
      .input('priority', sql.VarChar, 'high')
      .input('created_by', sql.VarChar, req.user.id)
      .query(`
        INSERT INTO notifications (id, type, title, message, target_role, priority, created_by)
        VALUES (@id, @type, @title, @message, @target_role, @priority, @created_by)
      `);

    res.status(201).json({ message: 'Fee request notification created', id: notificationId });
  } catch (error) {
    console.error('❌ Create fee request error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
