const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { sql, poolPromise } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
// const Razorpay = require('razorpay');

const router = express.Router();

// // Razorpay is currently disabled
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// Get fees for a student/parent
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT f.*, s.firstName as studentFirstName, s.lastName as studentLastName, 
             c.name as className
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN classes c ON s.class_id = c.id
    `;
    
    if (req.user.role === 'parent') {
      query += ` WHERE s.parent_id = '${req.user.id}'`;
    }

    query += ' ORDER BY f.due_date DESC';

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Get fees error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send fee request
router.post('/request', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { studentIds, monthYear, amount, dueDate, description, priority } = req.body;
    const pool = await poolPromise;
    const feeRecords = [];

    for (const studentId of studentIds) {
      const feeId = uuidv4();
      await pool.request()
        .input('id', sql.VarChar, feeId)
        .input('student_id', sql.VarChar, studentId)
        .input('month_year', sql.VarChar, monthYear)
        .input('amount', sql.Decimal(10, 2), amount)
        .input('due_date', sql.Date, dueDate)
        .input('description', sql.Text, description || '')
        .input('created_by', sql.VarChar, req.user.id)
        .query(`
          INSERT INTO fees (id, student_id, month_year, amount, due_date, description, status, created_by)
          VALUES (@id, @student_id, @month_year, @amount, @due_date, @description, 'pending', @created_by)
        `);

      feeRecords.push(feeId);

      // Send notification to parent
      const parentResult = await pool.request()
        .input('student_id', sql.VarChar, studentId)
        .query('SELECT parent_id FROM students WHERE id = @student_id');

      const parent_id = parentResult.recordset[0]?.parent_id;

      if (parent_id) {
        const notificationId = uuidv4();
        const message = `Fee payment of ₹${amount} is due by ${new Date(dueDate).toLocaleDateString()}. ${description || ''}`;
        await pool.request()
          .input('id', sql.VarChar, notificationId)
          .input('user_id', sql.VarChar, parent_id)
          .input('title', sql.VarChar, `Fee Payment Request - ${monthYear}`)
          .input('message', sql.Text, message)
          .input('priority', sql.VarChar, priority || 'medium')
          .query(`
            INSERT INTO notifications (id, user_id, title, message, type, priority)
            VALUES (@id, @user_id, @title, @message, 'fee_request', @priority)
          `);
      }
    }

    res.status(201).json({ message: 'Fee requests sent successfully', feeIds: feeRecords });
  } catch (error) {
    console.error('❌ Fee request error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Skipped Razorpay payment route
router.post('/pay', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Razorpay integration is currently disabled. Payment skipped.'
    });
  } catch (error) {
    console.error('❌ Payment initiation error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Skipped Razorpay verification route
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      message: 'Payment verification skipped (Razorpay disabled)'
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
