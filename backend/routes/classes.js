const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all classes with teacher names and student count
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        c.*, 
        u.firstName AS teacherFirstName, 
        u.lastName AS teacherLastName,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS studentCount
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get classes error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create class
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, teacher_id } = req.body;
    const classId = uuidv4();
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, classId)
      .input('name', sql.VarChar, name)
      .input('teacher_id', sql.VarChar, teacher_id)
      .query('INSERT INTO classes (id, name, teacher_id) VALUES (@id, @name, @teacher_id)');

    res.status(201).json({ message: 'Class created successfully', id: classId });
  } catch (error) {
    console.error('❌ Create class error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update class
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teacher_id } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('name', sql.VarChar, name)
      .input('teacher_id', sql.VarChar, teacher_id)
      .query('UPDATE classes SET name = @name, teacher_id = @teacher_id WHERE id = @id');

    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('❌ Update class error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/classes/:id/assign-teacher
router.put('/:id/assign-teacher', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('teacher_id', sql.VarChar, teacherId)
      .query('UPDATE classes SET teacher_id = @teacher_id WHERE id = @id');

    res.json({ message: 'Teacher assigned successfully' });
  } catch (err) {
    console.error('❌ Assign teacher error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get class by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query(`
        SELECT 
          c.*, 
          u.firstName AS teacherFirstName, 
          u.lastName AS teacherLastName,
          u.email AS teacherEmail,
          u.phone AS teacherPhone
        FROM classes c
        LEFT JOIN users u ON c.teacher_id = u.id
        WHERE c.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('❌ Get class by ID error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});





module.exports = router;
