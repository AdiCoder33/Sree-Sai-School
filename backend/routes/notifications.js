
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await db.execute(`
      SELECT n.*, u.firstName as creatorFirstName, u.lastName as creatorLastName
      FROM notifications n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.target_role = ? OR n.target_role = 'all'
      ORDER BY n.created_at DESC
      LIMIT 50
    `, [req.user.role]);

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // For this implementation, we'll track read status in a separate table
    await db.execute(
      'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
      [id, req.user.id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await db.execute(`
      SELECT id FROM notifications 
      WHERE target_role = ? OR target_role = 'all'
    `, [req.user.role]);

    for (const notification of notifications) {
      await db.execute(
        'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
        [notification.id, req.user.id]
      );
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create fee request notification
router.post('/fee-request', authenticateToken, async (req, res) => {
  try {
    const { studentId, amount, dueDate, description } = req.body;
    const notificationId = uuidv4();

    await db.execute(
      'INSERT INTO notifications (id, type, title, message, target_role, priority, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        notificationId, 
        'fee_request', 
        'Fee Payment Due', 
        `${description || 'Fee payment'} of $${amount} is due on ${dueDate}`, 
        'parent', 
        'high', 
        req.user.id
      ]
    );

    res.status(201).json({ message: 'Fee request notification created', id: notificationId });
  } catch (error) {
    console.error('Create fee request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
