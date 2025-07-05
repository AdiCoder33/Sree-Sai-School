const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get homework by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const pool = await poolPromise;

    const homeworkResult = await pool.request()
      .input('classId', sql.VarChar, classId)
      .query(`
        SELECT h.*, u.firstName as teacherFirstName, u.lastName as teacherLastName
        FROM homework h
        JOIN users u ON h.teacher_id = u.id
        WHERE h.class_id = @classId
        ORDER BY h.date DESC
      `);

    const homework = homeworkResult.recordset;

    for (let hw of homework) {
      const completionsResult = await pool.request()
        .input('homeworkId', sql.VarChar, hw.id)
        .query(`
          SELECT hc.*, s.firstName, s.lastName
          FROM homework_completion hc
          JOIN students s ON hc.student_id = s.id
          WHERE hc.homework_id = @homeworkId
        `);

      hw.students = completionsResult.recordset;
    }

    res.json(homework);
  } catch (error) {
    console.error('❌ Get homework error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create homework
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { class_id, subject, title, description } = req.body;
    const homeworkId = uuidv4();
    const date = new Date().toISOString().split('T')[0];
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, homeworkId)
      .input('class_id', sql.VarChar, class_id)
      .input('subject', sql.VarChar, subject)
      .input('title', sql.VarChar, title)
      .input('description', sql.Text, description)
      .input('date', sql.Date, date)
      .input('teacher_id', sql.VarChar, req.user.id)
      .query(`
        INSERT INTO homework (id, class_id, subject, title, description, date, teacher_id)
        VALUES (@id, @class_id, @subject, @title, @description, @date, @teacher_id)
      `);

    const studentsResult = await pool.request()
      .input('class_id', sql.VarChar, class_id)
      .query('SELECT id FROM students WHERE class_id = @class_id');

    for (const student of studentsResult.recordset) {
      await pool.request()
        .input('id', sql.VarChar, uuidv4())
        .input('homework_id', sql.VarChar, homeworkId)
        .input('student_id', sql.VarChar, student.id)
        .query(`
          INSERT INTO homework_completion (id, homework_id, student_id)
          VALUES (@id, @homework_id, @student_id)
        `);
    }

    res.status(201).json({ message: 'Homework created successfully', id: homeworkId });
  } catch (error) {
    console.error('❌ Create homework error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update homework completion status
router.put('/completion/:homeworkId/:studentId', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { homeworkId, studentId } = req.params;
    const { status } = req.body;
    const submittedAt = status === 'completed' ? new Date() : null;
    const pool = await poolPromise;

    await pool.request()
      .input('status', sql.VarChar, status)
      .input('submitted_at', sql.DateTime, submittedAt)
      .input('homework_id', sql.VarChar, homeworkId)
      .input('student_id', sql.VarChar, studentId)
      .query(`
        UPDATE homework_completion
        SET status = @status, submitted_at = @submitted_at
        WHERE homework_id = @homework_id AND student_id = @student_id
      `);

    res.json({ message: 'Homework status updated successfully' });
  } catch (error) {
    console.error('❌ Update homework status error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk update homework completion
router.put('/completion/bulk', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { homeworkId, students, status } = req.body;
    const submittedAt = status === 'completed' ? new Date() : null;
    const pool = await poolPromise;

    for (const studentId of students) {
      await pool.request()
        .input('status', sql.VarChar, status)
        .input('submitted_at', sql.DateTime, submittedAt)
        .input('homework_id', sql.VarChar, homeworkId)
        .input('student_id', sql.VarChar, studentId)
        .query(`
          UPDATE homework_completion
          SET status = @status, submitted_at = @submitted_at
          WHERE homework_id = @homework_id AND student_id = @student_id
        `);
    }

    res.json({ message: 'Bulk homework status updated successfully' });
  } catch (error) {
    console.error('❌ Bulk update homework error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
