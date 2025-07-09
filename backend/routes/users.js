const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { poolPromise, sql } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, email, firstName, lastName, role, avatar, phone, 
             address, qualification, experience, subject, dateOfJoining, 
             emergencyContact, occupation, 
             status, alternatePhone, workplace, annualIncome, 
             emergencyContactRelation, nationality, religion, maritalStatus, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Create user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;

    const {
      email, password, firstName, lastName, role, phone, address,
      qualification, experience, subject, dateOfJoining, emergencyContact, occupation,
      alternatePhone, workplace, annualIncome, emergencyContactRelation,
      nationality, religion, maritalStatus
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.request()
      .input('id', userId)
      .input('email', email)
      .input('password', hashedPassword)
      .input('firstName', firstName)
      .input('lastName', lastName)
      .input('role', role)
      .input('phone', phone)
      .input('address', address)
      .input('qualification', qualification)
      .input('experience', experience)
      .input('subject', subject)
      .input('dateOfJoining', dateOfJoining)
      .input('emergencyContact', emergencyContact)
      .input('occupation', occupation)
      .input('status', 'active')
      .input('alternatePhone', alternatePhone)
      .input('workplace', workplace)
      .input('annualIncome', annualIncome)
      .input('emergencyContactRelation', emergencyContactRelation)
      .input('nationality', nationality)
      .input('religion', religion)
      .input('maritalStatus', maritalStatus)
      .query(`
        INSERT INTO users (
          id, email, password, firstName, lastName, role, phone, address,
          qualification, experience, subject, dateOfJoining, emergencyContact,
           occupation, status,
          alternatePhone, workplace, annualIncome,
          emergencyContactRelation, nationality, religion, maritalStatus
        ) VALUES (
          @id, @email, @password, @firstName, @lastName, @role, @phone, @address,
          @qualification, @experience, @subject, @dateOfJoining, @emergencyContact,
           @occupation, @status,
          @alternatePhone, @workplace, @annualIncome,
          @emergencyContactRelation, @nationality, @religion, @maritalStatus
        )
      `);

    res.status(201).json({ message: 'User created successfully', id: userId });
  } catch (error) {
    console.error('❌ Create user error:', error);
    if (error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update user (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;

    const { id } = req.params;
    const {
      firstName, lastName, role, phone, address, qualification,
      experience, subject, dateOfJoining, emergencyContact,
       occupation, status,
      alternatePhone, workplace, annualIncome,
      emergencyContactRelation, nationality, religion, maritalStatus
    } = req.body;

    await pool.request()
      .input('id', id)
      .input('firstName', firstName)
      .input('lastName', lastName)
      .input('role', role)
      .input('phone', phone)
      .input('address', address)
      .input('qualification', qualification)
      .input('experience', experience)
      .input('subject', subject)
      .input('dateOfJoining', dateOfJoining)
      .input('emergencyContact', emergencyContact)
      .input('occupation', occupation)
      .input('status', status)
      .input('alternatePhone', alternatePhone)
      .input('workplace', workplace)
      .input('annualIncome', annualIncome)
      .input('emergencyContactRelation', emergencyContactRelation)
      .input('nationality', nationality)
      .input('religion', religion)
      .input('maritalStatus', maritalStatus)
      .query(`
        UPDATE users SET 
          firstName = @firstName, lastName = @lastName, role = @role, phone = @phone, address = @address,
          qualification = @qualification, experience = @experience, subject = @subject, dateOfJoining = @dateOfJoining,
          emergencyContact = @emergencyContact,  occupation = @occupation,
          status = @status, alternatePhone = @alternatePhone, workplace = @workplace,
          annualIncome = @annualIncome, emergencyContactRelation = @emergencyContactRelation,
          nationality = @nationality, religion = @religion, maritalStatus = @maritalStatus
        WHERE id = @id
      `);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Upload avatar
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.request().input('id', id).input('avatar', avatarUrl)
      .query('UPDATE users SET avatar = @avatar WHERE id = @id');

    res.json({ avatarUrl, message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete own account
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', req.user.id).query('DELETE FROM users WHERE id = @id');
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('❌ Account deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete user by admin
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', req.params.id).query('DELETE FROM users WHERE id = @id');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/parents
// In authRoutes.js or userRoutes.js
router.get('/parents', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, firstName, lastName, email, phone, address
      FROM users
      WHERE role = 'parent'
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching parents:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
