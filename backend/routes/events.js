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
      SELECT e.*, u.firstName AS creatorFirstName, u.lastName AS creatorLastName
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.startDate ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, type } = req.body;
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const createdBy = req.user?.id;

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('location', sql.VarChar, location)
      .input('type', sql.VarChar, type)
      .input('created_by', sql.VarChar, createdBy)
      .input('created_at', sql.DateTime, createdAt)
      .input('updated_at', sql.DateTime, updatedAt)
      .query(`
        INSERT INTO events (id, title, description, startDate, endDate, location, type, created_by, created_at, updated_at)
        VALUES (@id, @title, @description, @startDate, @endDate, @location, @type, @created_by, @created_at, @updated_at)
      `);

    res.status(201).json({ message: 'Event created successfully', id });
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, type } = req.body;
    const updatedAt = new Date().toISOString();

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('location', sql.VarChar, location)
      .input('type', sql.VarChar, type)
      .input('updated_at', sql.DateTime, updatedAt)
      .query(`
        UPDATE events
        SET title = @title,
            description = @description,
            startDate = @startDate,
            endDate = @endDate,
            location = @location,
            type = @type,
            updated_at = @updated_at
        WHERE id = @id
      `);

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM events WHERE id = @id');

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
