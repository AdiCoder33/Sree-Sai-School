const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, email, firstName, lastName, role, avatar, phone, 
             address, qualification, experience, subject, dateOfJoining, 
             emergencyContact, childName, childClass, occupation, 
             status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { 
      email, password, firstName, lastName, role, phone, address,
      qualification, experience, subject, dateOfJoining, emergencyContact,
      childName, childClass, occupation
    } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.execute(`
      INSERT INTO users (
        id, email, password, firstName, lastName, role, phone, address,
        qualification, experience, subject, dateOfJoining, emergencyContact,
        childName, childClass, occupation, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, email, hashedPassword, firstName, lastName, role, phone, address,
      qualification, experience, subject, dateOfJoining, emergencyContact,
      childName, childClass, occupation, 'active'
    ]);

    res.status(201).json({ message: 'User created successfully', id: userId });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, lastName, role, phone, address, qualification, 
      experience, subject, dateOfJoining, emergencyContact,
      childName, childClass, occupation, status
    } = req.body;

    await db.execute(`
      UPDATE users SET 
        firstName = ?, lastName = ?, role = ?, phone = ?, address = ?,
        qualification = ?, experience = ?, subject = ?, dateOfJoining = ?,
        emergencyContact = ?, childName = ?, childClass = ?, occupation = ?, status = ?
      WHERE id = ?
    `, [
      firstName, lastName, role, phone, address, qualification,
      experience, subject, dateOfJoining, emergencyContact,
      childName, childClass, occupation, status, id
    ]);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user avatar
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own avatar or is admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    await db.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id]);
    
    res.json({ avatarUrl, message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user account
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
