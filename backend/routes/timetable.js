const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET timetable by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('class_id', sql.UniqueIdentifier, req.params.classId)
      .query(`
        SELECT id, class_id, dayOfWeek, startTime, endTime, subject, teacher_id
        FROM timetable
        WHERE class_id = @class_id
        ORDER BY dayOfWeek, startTime
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

// ✅ GET timetable by teacher
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('teacher_id', sql.UniqueIdentifier, req.params.teacherId)
      .query(`
        SELECT id, class_id, dayOfWeek, startTime, endTime, subject, teacher_id
        FROM timetable
        WHERE teacher_id = @teacher_id
        ORDER BY dayOfWeek, startTime
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching teacher timetable:', err);
    res.status(500).json({ message: 'Error fetching teacher timetable' });
  }
});

// POST create timetable entry
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { class_id, dayOfWeek, startTime, endTime, subject, teacher_id } = req.body;
  if (!class_id || !dayOfWeek || !startTime || !endTime || !subject || !teacher_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;
    const newId = uuidv4();
    await pool.request()
      .input('id', sql.UniqueIdentifier, newId)
      .input('class_id', sql.UniqueIdentifier, class_id)
      .input('dayOfWeek', sql.VarChar, dayOfWeek)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .input('subject', sql.VarChar, subject)
      .input('teacher_id', sql.UniqueIdentifier, teacher_id)
      .query(`
        INSERT INTO timetable
        (id, class_id, dayOfWeek, startTime, endTime, subject, teacher_id, created_at, updated_at)
        VALUES (@id, @class_id, @dayOfWeek, @startTime, @endTime, @subject, @teacher_id, GETDATE(), GETDATE())
      `);
    res.status(201).json({ message: 'Created', id: newId });
  } catch (err) {
    console.error('Error creating timetable entry:', err);
    res.status(500).json({ message: 'Error creating entry' });
  }
});

// PUT update timetable entry
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { class_id, dayOfWeek, startTime, endTime, subject, teacher_id } = req.body;
  if (!class_id || !dayOfWeek || !startTime || !endTime || !subject || !teacher_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .input('class_id', sql.UniqueIdentifier, class_id)
      .input('dayOfWeek', sql.VarChar, dayOfWeek)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .input('subject', sql.VarChar, subject)
      .input('teacher_id', sql.UniqueIdentifier, teacher_id)
      .query(`
        UPDATE timetable
        SET class_id=@class_id, dayOfWeek=@dayOfWeek,
            startTime=@startTime, endTime=@endTime,
            subject=@subject, teacher_id=@teacher_id,
            updated_at=GETDATE()
        WHERE id=@id
      `);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).json({ message: 'Error updating entry' });
  }
});

// DELETE entry
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('DELETE FROM timetable WHERE id = @id');
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

module.exports = router;
