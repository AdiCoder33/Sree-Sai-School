const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        e.*, 
        u.firstName AS creatorFirstName, 
        u.lastName AS creatorLastName
      FROM events e
      JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC, e.time ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get events error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, date, time, type } = req.body;
    const eventId = uuidv4();
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, eventId)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('date', sql.Date, date)
      .input('time', sql.Time, time)
      .input('type', sql.VarChar, type)
      .input('created_by', sql.VarChar, req.user.id)
      .query(`
        INSERT INTO events (id, title, description, date, time, type, created_by)
        VALUES (@id, @title, @description, @date, @time, @type, @created_by)
      `);

    res.status(201).json({ message: 'Event created successfully', id: eventId });
  } catch (error) {
    console.error('❌ Create event error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, type } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('date', sql.Date, date)
      .input('time', sql.Time, time)
      .input('type', sql.VarChar, type)
      .query(`
        UPDATE events 
        SET title = @title, description = @description, date = @date, time = @time, type = @type 
        WHERE id = @id
      `);

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('❌ Update event error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM events WHERE id = @id');

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('❌ Delete event error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
