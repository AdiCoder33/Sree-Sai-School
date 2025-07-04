
const express = require('express');
const { v4: uuidv4 } = require('crypto');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get timetable by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [timetable] = await db.execute(`
      SELECT t.*, u.firstName as teacherFirstName, u.lastName as teacherLastName, c.name as className
      FROM timetable t
      JOIN users u ON t.teacher_id = u.id
      JOIN classes c ON t.class_id = c.id
      WHERE t.class_id = ?
      ORDER BY FIELD(t.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), t.time_slot
    `, [classId]);

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get timetable by teacher
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const [timetable] = await db.execute(`
      SELECT t.*, c.name as className
      FROM timetable t
      JOIN classes c ON t.class_id = c.id
      WHERE t.teacher_id = ?
      ORDER BY FIELD(t.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), t.time_slot
    `, [teacherId]);

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create timetable entry
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { class_id, day, time_slot, subject, teacher_id } = req.body;
    const timetableId = uuidv4();

    await db.execute(
      'INSERT INTO timetable (id, class_id, day, time_slot, subject, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
      [timetableId, class_id, day, time_slot, subject, teacher_id]
    );

    res.status(201).json({ message: 'Timetable entry created successfully', id: timetableId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete timetable entry
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM timetable WHERE id = ?', [id]);
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
