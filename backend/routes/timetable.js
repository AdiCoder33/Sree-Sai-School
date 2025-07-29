const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 📌 Helper function to format time
const formatTime = (time) => {
  const d = new Date(time);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 📌 GET: Timetable by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
  .input('class_id', sql.UniqueIdentifier, req.params.classId)
  .query(`
    SELECT 
      id, class_id, dayOfWeek,
      startTime,
      endTime,
      subject, teacher_id
    FROM timetable
    WHERE class_id = @class_id
    ORDER BY dayOfWeek, startTime
  `);

res.json(result.recordset);

  } catch (err) {
    console.error('❌ Error fetching timetable by class:', err);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

// 📌 Get all teachers (for dropdowns)
router.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, firstName, lastName, role 
      FROM users 
      WHERE role = 'teacher'
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get teachers error:', error.message);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// 📌 GET: Timetable by teacher
router.get('/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('teacher_id', sql.UniqueIdentifier, req.params.teacherId)
      .query(`
       SELECT 
      id, class_id, dayOfWeek,
      startTime,
      endTime,
      subject, teacher_id
    FROM timetable
    WHERE teacher_id = @teacher_id
    ORDER BY dayOfWeek, startTime

      `);
res.json(result.recordset); // Just like the class route


  } catch (err) {
    console.error('❌ Error fetching timetable by teacher:', err);
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

// 📌 POST: Create timetable entry
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { class_id, dayOfWeek, startTime, endTime, subject, teacher_id } = req.body;

  if (!class_id || !dayOfWeek || !startTime || !endTime || !subject || !teacher_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;

    // 🔍 Check if an entry already exists for same class + day + time
    const check = await pool.request()
      .input('class_id', sql.UniqueIdentifier, class_id)
      .input('dayOfWeek', sql.VarChar, dayOfWeek)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .query(`
        SELECT * FROM timetable 
        WHERE class_id = @class_id AND dayOfWeek = @dayOfWeek 
        AND startTime = @startTime AND endTime = @endTime
      `);

    if (check.recordset.length > 0) {
      return res.status(409).json({ message: 'Duplicate entry exists for this time slot' });
    }

    // 🚀 Insert new entry if no conflict
    const id = uuidv4();
    await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('class_id', sql.UniqueIdentifier, class_id)
      .input('dayOfWeek', sql.VarChar, dayOfWeek)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .input('subject', sql.VarChar, subject)
      .input('teacher_id', sql.UniqueIdentifier, teacher_id)
      .query(`
        INSERT INTO timetable (id, class_id, dayOfWeek, startTime, endTime, subject, teacher_id, created_at, updated_at)
        VALUES (@id, @class_id, @dayOfWeek, @startTime, @endTime, @subject, @teacher_id, GETDATE(), GETDATE())
      `);

    res.status(201).json({ message: 'Created', id });

  } catch (err) {
    console.error('❌ Error creating timetable entry:', err);
    res.status(500).json({ message: 'Error creating entry' });
  }
});

// 📌 PUT: Update timetable entry
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { class_id, dayOfWeek, startTime, endTime, subject, teacher_id } = req.body;
  const timetableId = req.params.id;

  if (!class_id || !dayOfWeek || !startTime || !endTime || !subject || !teacher_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;

    // 🔍 Check for duplicate in other records (excluding the one being updated)
    const check = await pool.request()
      .input('id', sql.UniqueIdentifier, timetableId)
      .input('class_id', sql.UniqueIdentifier, class_id)
      .input('dayOfWeek', sql.VarChar, dayOfWeek)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .query(`
        SELECT * FROM timetable 
        WHERE class_id = @class_id 
        AND dayOfWeek = @dayOfWeek 
        AND startTime = @startTime 
        AND endTime = @endTime 
        AND id != @id
      `);

    if (check.recordset.length > 0) {
      return res.status(409).json({ message: 'Another entry already exists for this time slot' });
    }

    // ✅ Proceed with update
    await pool.request()
      .input('id', sql.UniqueIdentifier, timetableId)
      .input('class_id', sql.UniqueIdentifier, class_id)
      .input('dayOfWeek', sql.VarChar, dayOfWeek)
      .input('startTime', sql.VarChar, startTime)
      .input('endTime', sql.VarChar, endTime)
      .input('subject', sql.VarChar, subject)
      .input('teacher_id', sql.UniqueIdentifier, teacher_id)
      .query(`
        UPDATE timetable
        SET class_id = @class_id,
            dayOfWeek = @dayOfWeek,
            startTime = @startTime,
            endTime = @endTime,
            subject = @subject,
            teacher_id = @teacher_id,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Updated successfully' });

  } catch (err) {
    console.error('❌ Error updating timetable entry:', err);
    res.status(500).json({ message: 'Error updating entry' });
  }
});

// 📌 DELETE: Remove a timetable entry
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query(`DELETE FROM timetable WHERE id = @id`);

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('❌ Error deleting timetable entry:', err);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

module.exports = router;
