
const express = require('express');
const { v4: uuidv4 } = require('crypto');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get homework by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [homework] = await db.execute(`
      SELECT h.*, u.firstName as teacherFirstName, u.lastName as teacherLastName
      FROM homework h
      JOIN users u ON h.teacher_id = u.id
      WHERE h.class_id = ?
      ORDER BY h.date DESC
    `, [classId]);

    // Get completion status for each homework
    for (let hw of homework) {
      const [completions] = await db.execute(`
        SELECT hc.*, s.firstName, s.lastName
        FROM homework_completion hc
        JOIN students s ON hc.student_id = s.id
        WHERE hc.homework_id = ?
      `, [hw.id]);
      
      hw.students = completions;
    }

    res.json(homework);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create homework
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { class_id, subject, title, description } = req.body;
    const homeworkId = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    await db.execute(
      'INSERT INTO homework (id, class_id, subject, title, description, date, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [homeworkId, class_id, subject, title, description, date, req.user.id]
    );

    // Create completion records for all students in the class
    const [students] = await db.execute('SELECT id FROM students WHERE class_id = ?', [class_id]);
    
    for (const student of students) {
      await db.execute(
        'INSERT INTO homework_completion (id, homework_id, student_id) VALUES (?, ?, ?)',
        [uuidv4(), homeworkId, student.id]
      );
    }

    res.status(201).json({ message: 'Homework created successfully', id: homeworkId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update homework completion status
router.put('/completion/:homeworkId/:studentId', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { homeworkId, studentId } = req.params;
    const { status } = req.body;

    await db.execute(
      'UPDATE homework_completion SET status = ?, submitted_at = ? WHERE homework_id = ? AND student_id = ?',
      [status, status === 'completed' ? new Date() : null, homeworkId, studentId]
    );

    res.json({ message: 'Homework status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk update homework completion
router.put('/completion/bulk', authenticateToken, authorizeRoles('admin', 'teacher'), async (req, res) => {
  try {
    const { homeworkId, students, status } = req.body;
    
    for (const studentId of students) {
      await db.execute(
        'UPDATE homework_completion SET status = ?, submitted_at = ? WHERE homework_id = ? AND student_id = ?',
        [status, status === 'completed' ? new Date() : null, homeworkId, studentId]
      );
    }

    res.json({ message: 'Bulk homework status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
