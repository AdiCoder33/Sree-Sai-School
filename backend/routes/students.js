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

// Get unassigned students
router.get('/unassigned', authenticateToken, async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT s.*, u.firstName as parentFirstName, u.lastName as parentLastName
      FROM students s
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE s.class_id IS NULL OR s.class_id = ''
    `);
    res.json(students);
  } catch (error) {
    console.error('Get unassigned students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Allocate student to class
router.put('/:id/allocate', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id } = req.body;

    await db.execute(
      'UPDATE students SET class_id = ? WHERE id = ?',
      [class_id, id]
    );

    res.json({ message: 'Student allocated successfully' });
  } catch (error) {
    console.error('Student allocation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students by class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const pool = await db.poolPromise;
    const result = await pool.request()
      .input('class_id', db.sql.UniqueIdentifier, classId)
      .query('SELECT * FROM students WHERE class_id = @class_id');
    
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get students by class error:', error.message);
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

// Create student with comprehensive details
// Create student with only required fields from frontend
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

    const pool = await db.poolPromise;
await pool.request()
  .input('id', db.sql.UniqueIdentifier, studentId)
  .input('firstName', db.sql.VarChar, firstName)
  .input('lastName', db.sql.VarChar, lastName)
  .input('gender', db.sql.VarChar, gender)
  .input('class_id', db.sql.UniqueIdentifier, class_id)
  .input('section', db.sql.VarChar, section)
  .input('rollNumber', db.sql.VarChar, rollNumber)
  .input('parent_id', db.sql.UniqueIdentifier, parent_id)
  .input('dateOfBirth', db.sql.Date, dateOfBirth)
  .input('address', db.sql.VarChar, address)
  .input('phone', db.sql.VarChar, phone)
  .input('bloodGroup', db.sql.VarChar, bloodGroup)
  .input('medicalConditions', db.sql.VarChar, medicalConditions)
  .input('emergencyContact', db.sql.VarChar, emergencyContact)
  .query(`
    INSERT INTO students (
      id, firstName, lastName, gender, class_id, section, rollNumber,
      parent_id, dateOfBirth, address, phone, bloodGroup,
      medicalConditions, emergencyContact
    )
    VALUES (
      @id, @firstName, @lastName, @gender, @class_id, @section, @rollNumber,
      @parent_id, @dateOfBirth, @address, @phone, @bloodGroup,
      @medicalConditions, @emergencyContact
    )
  `);


    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: studentId,
        firstName,
        lastName,
        class_id,
        section,
        parent_id
      }
    });
  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;