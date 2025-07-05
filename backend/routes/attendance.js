const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get attendance by date and class
router.get('/:date/:classId', authenticateToken, async (req, res) => {
  try {
    const { date, classId } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('date', sql.Date, date)
      .input('classId', sql.VarChar, classId)
      .query(`
        SELECT a.*, s.firstName, s.lastName, s.rollNumber
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.date = @date AND s.class_id = @classId
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get attendance error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark attendance
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { student_id, date, status, remarks } = req.body;
    const attendanceId = uuidv4();
    const pool = await poolPromise;

    // Check if entry exists
    const check = await pool.request()
      .input('student_id', sql.VarChar, student_id)
      .input('date', sql.Date, date)
      .query(`SELECT id FROM attendance WHERE student_id = @student_id AND date = @date`);

    if (check.recordset.length > 0) {
      // Update if exists
      await pool.request()
        .input('student_id', sql.VarChar, student_id)
        .input('date', sql.Date, date)
        .input('status', sql.VarChar, status)
        .input('remarks', sql.VarChar, remarks || '')
        .query(`
          UPDATE attendance 
          SET status = @status, remarks = @remarks 
          WHERE student_id = @student_id AND date = @date
        `);
    } else {
      // Insert new
      await pool.request()
        .input('id', sql.VarChar, attendanceId)
        .input('student_id', sql.VarChar, student_id)
        .input('date', sql.Date, date)
        .input('status', sql.VarChar, status)
        .input('remarks', sql.VarChar, remarks || '')
        .input('teacher_id', sql.VarChar, req.user.id)
        .query(`
          INSERT INTO attendance (id, student_id, date, status, remarks, teacher_id)
          VALUES (@id, @student_id, @date, @status, @remarks, @teacher_id)
        `);
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('❌ Mark attendance error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk mark attendance
router.post('/bulk', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { students, date, status } = req.body;
    const pool = await poolPromise;

    for (const studentId of students) {
      const check = await pool.request()
        .input('student_id', sql.VarChar, studentId)
        .input('date', sql.Date, date)
        .query(`SELECT id FROM attendance WHERE student_id = @student_id AND date = @date`);

      if (check.recordset.length > 0) {
        await pool.request()
          .input('student_id', sql.VarChar, studentId)
          .input('date', sql.Date, date)
          .input('status', sql.VarChar, status)
          .query(`
            UPDATE attendance SET status = @status 
            WHERE student_id = @student_id AND date = @date
          `);
      } else {
        await pool.request()
          .input('id', sql.VarChar, uuidv4())
          .input('student_id', sql.VarChar, studentId)
          .input('date', sql.Date, date)
          .input('status', sql.VarChar, status)
          .input('teacher_id', sql.VarChar, req.user.id)
          .query(`
            INSERT INTO attendance (id, student_id, date, status, teacher_id)
            VALUES (@id, @student_id, @date, @status, @teacher_id)
          `);
      }
    }

    res.json({ message: 'Bulk attendance marked successfully' });
  } catch (error) {
    console.error('❌ Bulk attendance error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
