const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Map weekdays to enforce custom order
const weekdayOrder = {
  'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
  'Thursday': 4, 'Friday': 5
};

// Get timetable by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('classId', sql.VarChar, req.params.classId)
      .query(`
        SELECT t.*, u.firstName as teacherFirstName, u.lastName as teacherLastName, c.name as className
        FROM timetable t
        JOIN users u ON t.teacher_id = u.id
        JOIN classes c ON t.class_id = c.id
        WHERE t.class_id = @classId
      `);

    // Sort manually by weekday order and time_slot
    const sorted = result.recordset.sort((a, b) => {
      const dayA = weekdayOrder[a.day] || 99;
      const dayB = weekdayOrder[b.day] || 99;
      if (dayA === dayB) return a.time_slot.localeCompare(b.time_slot);
      return dayA - dayB;
    });

    res.json(sorted);
  } catch (error) {
    console.error('❌ Get timetable by class error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get timetable by teacher
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('teacherId', sql.VarChar, req.params.teacherId)
      .query(`
        SELECT t.*, c.name as className
        FROM timetable t
        JOIN classes c ON t.class_id = c.id
        WHERE t.teacher_id = @teacherId
      `);

    // Sort manually
    const sorted = result.recordset.sort((a, b) => {
      const dayA = weekdayOrder[a.day] || 99;
      const dayB = weekdayOrder[b.day] || 99;
      if (dayA === dayB) return a.time_slot.localeCompare(b.time_slot);
      return dayA - dayB;
    });

    res.json(sorted);
  } catch (error) {
    console.error('❌ Get timetable by teacher error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create timetable entry
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { class_id, day, time_slot, subject, teacher_id } = req.body;
    const timetableId = uuidv4();
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, timetableId)
      .input('class_id', sql.VarChar, class_id)
      .input('day', sql.VarChar, day)
      .input('time_slot', sql.VarChar, time_slot)
      .input('subject', sql.VarChar, subject)
      .input('teacher_id', sql.VarChar, teacher_id)
      .query(`
        INSERT INTO timetable (id, class_id, day, time_slot, subject, teacher_id)
        VALUES (@id, @class_id, @day, @time_slot, @subject, @teacher_id)
      `);

    res.status(201).json({ message: 'Timetable entry created successfully', id: timetableId });
  } catch (error) {
    console.error('❌ Create timetable error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete timetable entry
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.VarChar, req.params.id)
      .query('DELETE FROM timetable WHERE id = @id');

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('❌ Delete timetable error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
