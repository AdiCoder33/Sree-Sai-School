const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/learninglogs
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { studentId, studentName, subject, activity, notes } = req.body;
    const teacherId = req.user.id;

    const pool = await poolPromise;

    await pool.request()
      .input('studentId', sql.UniqueIdentifier, studentId)
      .input('studentName', sql.NVarChar, studentName)
      .input('subject', sql.NVarChar, subject)
      .input('activity', sql.NVarChar, activity)
      .input('notes', sql.NVarChar, notes)
      .input('teacherId', sql.UniqueIdentifier, teacherId)
      .input('date', sql.DateTime, new Date())
      .query(`
        INSERT INTO learninglogs (studentId, studentName, subject, activity, notes, teacherId, date)
        VALUES (@studentId, @studentName, @subject, @activity, @notes, @teacherId, @date)
      `);

    res.status(201).json({ message: 'Log added successfully' });
  } catch (err) {
    console.error('POST log error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/learninglogs?classId=...
// GET /api/learninglogs?classId=...
router.get('/', async (req, res) => {
  try {
    const classId = req.query.classId;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('classId', sql.UniqueIdentifier, classId)
      .query(`
        SELECT 
  l.*, 
  s.firstName + ' ' + s.lastName AS studentName,
  u.firstName + ' ' + u.lastName AS teacherName
FROM learninglogs l
JOIN students s ON l.studentId = s.id
LEFT JOIN users u ON l.teacherId = u.id
WHERE s.class_id = @classId
ORDER BY l.date DESC

      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('GET logs error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
