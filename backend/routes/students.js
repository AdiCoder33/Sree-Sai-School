const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT s.*, c.name as className, u.firstName as parentFirstName, u.lastName as parentLastName
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users u ON s.parent_id = u.id
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get all students error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('classId', sql.VarChar, req.params.classId)
      .query('SELECT * FROM students WHERE class_id = @classId');
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get students by class error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Promote students
router.post('/promote', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { studentIds, fromClassId, toClassId } = req.body;
    const pool = await poolPromise;

    for (const studentId of studentIds) {
      await pool.request()
        .input('toClassId', sql.VarChar, toClassId)
        .input('studentId', sql.VarChar, studentId)
        .input('fromClassId', sql.VarChar, fromClassId)
        .query('UPDATE students SET class_id = @toClassId WHERE id = @studentId AND class_id = @fromClassId');
    }

    res.json({ message: 'Students promoted successfully' });
  } catch (error) {
    console.error('❌ Student promotion error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create student
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const {
      firstName, lastName, gender, class_id, section, rollNumber, parent_id,
      dateOfBirth, address, phone, bloodGroup, medicalConditions, emergencyContact
    } = req.body;

    const studentId = uuidv4();
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.VarChar, studentId)
      .input('firstName', sql.VarChar, firstName)
      .input('lastName', sql.VarChar, lastName)
      .input('gender', sql.VarChar, gender)
      .input('class_id', sql.VarChar, class_id)
      .input('section', sql.VarChar, section)
      .input('rollNumber', sql.VarChar, rollNumber)
      .input('parent_id', sql.VarChar, parent_id)
      .input('dateOfBirth', sql.Date, dateOfBirth)
      .input('address', sql.VarChar, address)
      .input('phone', sql.VarChar, phone)
      .input('bloodGroup', sql.VarChar, bloodGroup)
      .input('medicalConditions', sql.VarChar, medicalConditions)
      .input('emergencyContact', sql.VarChar, emergencyContact)
      .query(`
        INSERT INTO students (
          id, firstName, lastName, gender, class_id, section, rollNumber,
          parent_id, dateOfBirth, address, phone, bloodGroup, 
          medicalConditions, emergencyContact
        ) VALUES (
          @id, @firstName, @lastName, @gender, @class_id, @section, @rollNumber,
          @parent_id, @dateOfBirth, @address, @phone, @bloodGroup,
          @medicalConditions, @emergencyContact
        )
      `);

    res.status(201).json({ message: 'Student created successfully', id: studentId });
  } catch (error) {
    console.error('❌ Student creation error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
