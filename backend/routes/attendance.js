
const express = require('express');
const { v4: uuidv4 } = require('crypto');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get attendance by date and class
router.get('/:date/:classId', authenticateToken, async (req, res) => {
  try {
    const { date, classId } = req.params;
    
    const [attendance] = await db.execute(`
      SELECT a.*, s.firstName, s.lastName, s.rollNumber
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.date = ? AND s.class_id = ?
    `, [date, classId]);

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark attendance
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { student_id, date, status, remarks } = req.body;
    const attendanceId = uuidv4();

    await db.execute(
      'INSERT INTO attendance (id, student_id, date, status, remarks, teacher_id) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, remarks = ?',
      [attendanceId, student_id, date, status, remarks, req.user.id, status, remarks]
    );

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk mark attendance
router.post('/bulk', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { students, date, status } = req.body;
    
    const values = students.map(studentId => [uuidv4(), studentId, date, status, req.user.id]);
    
    for (const value of values) {
      await db.execute(
        'INSERT INTO attendance (id, student_id, date, status, teacher_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
        [...value, status]
      );
    }

    res.json({ message: 'Bulk attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
