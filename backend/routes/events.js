
const express = require('express');
const { v4: uuidv4 } = require('crypto');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT e.*, u.firstName as creatorFirstName, u.lastName as creatorLastName
      FROM events e
      JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC, e.time ASC
    `);

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, date, time, type } = req.body;
    const eventId = uuidv4();

    await db.execute(
      'INSERT INTO events (id, title, description, date, time, type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [eventId, title, description, date, time, type, req.user.id]
    );

    res.status(201).json({ message: 'Event created successfully', id: eventId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, type } = req.body;

    await db.execute(
      'UPDATE events SET title = ?, description = ?, date = ?, time = ?, type = ? WHERE id = ?',
      [title, description, date, time, type, id]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
