
const express = require('express');
const { v4: uuidv4 } = require('crypto');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [classes] = await db.execute(`
      SELECT c.*, u.firstName as teacherFirstName, u.lastName as teacherLastName,
             COUNT(s.id) as studentCount
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id
    `);

    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create class
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, teacher_id } = req.body;
    const classId = uuidv4();

    await db.execute(
      'INSERT INTO classes (id, name, teacher_id) VALUES (?, ?, ?)',
      [classId, name, teacher_id]
    );

    res.status(201).json({ message: 'Class created successfully', id: classId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update class
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teacher_id } = req.body;

    await db.execute(
      'UPDATE classes SET name = ?, teacher_id = ? WHERE id = ?',
      [name, teacher_id, id]
    );

    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
