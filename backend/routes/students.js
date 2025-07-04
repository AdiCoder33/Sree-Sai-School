
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT s.*, c.name as className, u.firstName as parentFirstName, u.lastName as parentLastName
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON s.parent_id = u.id
    `);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const [students] = await db.execute('SELECT * FROM students WHERE class_id = ?', [classId]);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Promote students
router.post('/promote', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { studentIds, fromClassId, toClassId } = req.body;
    
    for (const studentId of studentIds) {
      await db.execute(
        'UPDATE students SET class_id = ? WHERE id = ? AND class_id = ?',
        [toClassId, studentId, fromClassId]
      );
    }

    res.json({ message: 'Students promoted successfully' });
  } catch (error) {
    console.error('Student promotion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create student
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      gender,
      class_id, 
      section, 
      rollNumber, 
      parent_id, 
      dateOfBirth, 
      address, 
      phone,
      bloodGroup,
      medicalConditions,
      emergencyContact
    } = req.body;
    
    const studentId = uuidv4();

    await db.execute(
      `INSERT INTO students (
        id, firstName, lastName, gender, class_id, section, rollNumber, 
        parent_id, dateOfBirth, address, phone, bloodGroup, 
        medicalConditions, emergencyContact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId, firstName, lastName, gender, class_id, section, rollNumber, 
        parent_id, dateOfBirth, address, phone, bloodGroup, 
        medicalConditions, emergencyContact
      ]
    );

    res.status(201).json({ message: 'Student created successfully', id: studentId });
  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
