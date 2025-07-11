const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * GET: All Announcements
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    let role = req.user.role ? req.user.role.toLowerCase().trim() : '';

    // 🔑 Fix: Map roles to audience
    if (role === 'teacher') role = 'teachers';
    if (role === 'student') role = 'students';

    let query = `
      SELECT 
        a.*, 
        u.firstName AS creatorFirstName, 
        u.lastName AS creatorLastName
      FROM announcements a
      JOIN users u ON a.author_id = u.id
    `;

    if (role !== 'admin') {
      query += `
        WHERE LOWER(a.target_audience) = @role OR LOWER(a.target_audience) = 'all'
      `;
    }

    query += ` ORDER BY a.created_at DESC`;

    const request = pool.request().input('role', sql.VarChar, role);
    const result = await request.query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get announcements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * POST: Create Announcement + Notification
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { title = '', content = '', priority = 'Normal', target_audience = 'All' } = req.body;

    const announcementId = uuidv4();
    const notificationId = uuidv4();
    const pool = await poolPromise;

    const cleanAudience = target_audience.trim().toLowerCase();
    const cleanPriority = priority.trim();

    // Insert Announcement
    await pool.request()
      .input('id', sql.VarChar, announcementId)
      .input('title', sql.NVarChar(255), title.trim())
      .input('content', sql.NVarChar(sql.MAX), content.trim())
      .input('author_id', sql.VarChar, req.user.id)
      .input('priority', sql.VarChar, cleanPriority)
      .input('target_audience', sql.VarChar, cleanAudience)
      .query(`
        INSERT INTO announcements (id, title, content, author_id, priority, target_audience)
        VALUES (@id, @title, @content, @author_id, @priority, @target_audience)
      `);

    // Insert Notification (✅ Fixed with user_id)
    await pool.request()
  .input('id', sql.VarChar, notificationId)
  .input('user_id', sql.VarChar, req.user.id)
  .input('type', sql.VarChar, 'announcement')
  .input('title', sql.NVarChar(255), 'New Announcement Created')
  .input('message', sql.NVarChar(sql.MAX), `${title} - ${content}`)
  .input('priority', sql.VarChar, cleanPriority.toLowerCase())
  .input('isRead', sql.Bit, 0)
  .input('target_role', sql.VarChar, cleanAudience)
  .input('created_by', sql.VarChar, req.user.id)
  .input('reference_id', sql.VarChar, announcementId)  // ✅ Add this line
  .query(`
    INSERT INTO notifications (id, user_id, type, title, message, priority, isRead, target_role, created_by, reference_id)
    VALUES (@id, @user_id, @type, @title, @message, @priority, @isRead, @target_role, @created_by, @reference_id)
  `);

    res.status(201).json({ message: 'Announcement created successfully', id: announcementId });
  } catch (error) {
    console.error('❌ Create announcement error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT: Update Announcement + Notification
 */router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title = '', content = '', priority = 'Normal', target_audience = 'All' } = req.body;

    const notificationId = uuidv4();
    const pool = await poolPromise;

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanPriority = priority.trim();
    const cleanAudience = target_audience.trim().toLowerCase();

    // ✅ Step 1: Update the Announcement
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('title', sql.NVarChar(255), cleanTitle)
      .input('content', sql.NVarChar(sql.MAX), cleanContent)
      .input('priority', sql.VarChar, cleanPriority)
      .input('target_audience', sql.VarChar, cleanAudience)
      .query(`
        UPDATE announcements 
        SET title = @title, content = @content, priority = @priority, target_audience = @target_audience
        WHERE id = @id
      `);

    // ✅ Step 2: Log the Notification
   await pool.request()
  .input('id', sql.VarChar, notificationId)
  .input('user_id', sql.VarChar, req.user.id)
  .input('type', sql.VarChar, 'announcement')
  .input('title', sql.NVarChar(255), 'Announcement Updated')
  .input('message', sql.NVarChar(sql.MAX), `${cleanTitle} - ${cleanContent}`)
  .input('priority', sql.VarChar, cleanPriority.toLowerCase())
  .input('isRead', sql.Bit, 0)
  .input('target_role', sql.VarChar, cleanAudience)
  .input('created_by', sql.VarChar, req.user.id)
  .input('reference_id', sql.VarChar, id)  // ✅ Add this line (announcement id)
  .query(`
    INSERT INTO notifications (id, user_id, type, title, message, priority, isRead, target_role, created_by, reference_id)
    VALUES (@id, @user_id, @type, @title, @message, @priority, @isRead, @target_role, @created_by, @reference_id)
  `);
    res.json({ message: '✅ Announcement updated successfully' });
  } catch (error) {
    console.error('❌ Update announcement error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE: Delete Announcement + Notification
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Delete related notifications first
    await pool.request()
      .input('id', sql.VarChar, id)
      .query(`DELETE FROM notifications WHERE type = 'announcement' AND reference_id = @id`);

    // Delete the announcement
    await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM announcements WHERE id = @id');

    res.json({ message: '✅ Announcement and related notifications deleted successfully' });

  } catch (error) {
    console.error('❌ Delete announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
