
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [announcements] = await db.execute(`
      SELECT a.*, u.firstName as creatorFirstName, u.lastName as creatorLastName
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { title, message, targetAudience, priority } = req.body;
    const announcementId = uuidv4();

    await db.execute(
      'INSERT INTO announcements (id, title, message, target_audience, priority, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [announcementId, title, message, targetAudience, priority || 'medium', req.user.id]
    );

    // Create notifications for target audience
    const notificationId = uuidv4();
    await db.execute(
      'INSERT INTO notifications (id, type, title, message, target_role, priority, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [notificationId, 'announcement', title, message, targetAudience, priority || 'medium', req.user.id]
    );

    res.status(201).json({ message: 'Announcement created successfully', id: announcementId });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update announcement
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, targetAudience, priority } = req.body;

    await db.execute(
      'UPDATE announcements SET title = ?, message = ?, target_audience = ?, priority = ? WHERE id = ?',
      [title, message, targetAudience, priority, id]
    );

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
