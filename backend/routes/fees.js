
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Razorpay = require('razorpay');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get fees for a student/parent
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT f.*, s.firstName as studentFirstName, s.lastName as studentLastName, 
             c.name as className
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN classes c ON s.class_id = c.id
    `;
    
    const params = [];
    
    if (req.user.role === 'parent') {
      query += ' WHERE s.parent_id = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY f.due_date DESC';
    
    const [fees] = await db.execute(query, params);
    res.json(fees);
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send fee request
router.post('/request', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { studentIds, monthYear, amount, dueDate, description, priority } = req.body;
    
    const feeRecords = [];
    for (const studentId of studentIds) {
      const feeId = uuidv4();
      await db.execute(`
        INSERT INTO fees (id, student_id, month_year, amount, due_date, description, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `, [feeId, studentId, monthYear, amount, dueDate, description, req.user.id]);
      
      feeRecords.push(feeId);
    }

    // Send notifications to parents
    for (const studentId of studentIds) {
      const [student] = await db.execute('SELECT parent_id FROM students WHERE id = ?', [studentId]);
      if (student.length > 0) {
        const notificationId = uuidv4();
        await db.execute(`
          INSERT INTO notifications (id, user_id, title, message, type, priority)
          VALUES (?, ?, ?, ?, 'fee_request', ?)
        `, [
          notificationId,
          student[0].parent_id,
          `Fee Payment Request - ${monthYear}`,
          `Fee payment of ₹${amount} is due by ${new Date(dueDate).toLocaleDateString()}. ${description || ''}`,
          priority
        ]);
      }
    }

    res.status(201).json({ message: 'Fee requests sent successfully', feeIds: feeRecords });
  } catch (error) {
    console.error('Fee request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Initiate payment
router.post('/pay', authenticateToken, async (req, res) => {
  try {
    const { feeId, amount, currency = 'INR' } = req.body;
    
    // Verify fee belongs to user (for parents)
    if (req.user.role === 'parent') {
      const [fee] = await db.execute(`
        SELECT f.* FROM fees f
        JOIN students s ON f.student_id = s.id
        WHERE f.id = ? AND s.parent_id = ?
      `, [feeId, req.user.id]);
      
      if (fee.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: currency,
      receipt: `fee_${feeId}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Store order in database
    await db.execute(`
      INSERT INTO payment_orders (id, fee_id, razorpay_order_id, amount, currency, status)
      VALUES (?, ?, ?, ?, ?, 'created')
    `, [uuidv4(), feeId, order.id, amount, currency]);

    res.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify payment
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Update payment and fee status
      await db.execute(`
        UPDATE payment_orders SET 
          razorpay_payment_id = ?, 
          razorpay_signature = ?, 
          status = 'completed',
          paid_at = NOW()
        WHERE razorpay_order_id = ?
      `, [razorpay_payment_id, razorpay_signature, razorpay_order_id]);

      // Get fee ID and update fee status
      const [paymentOrder] = await db.execute(
        'SELECT fee_id FROM payment_orders WHERE razorpay_order_id = ?',
        [razorpay_order_id]
      );

      if (paymentOrder.length > 0) {
        await db.execute(`
          UPDATE fees SET status = 'paid', paid_at = NOW(), payment_method = 'Razorpay'
          WHERE id = ?
        `, [paymentOrder[0].fee_id]);
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
