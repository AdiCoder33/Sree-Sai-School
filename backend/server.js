const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { poolPromise, sql } = require('./config/database'); // 👈 updated

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const homeworkRoutes = require('./routes/homework');
const timetableRoutes = require('./routes/timetable');
const eventRoutes = require('./routes/events');
const classRoutes = require('./routes/classes');
const announcementRoutes = require('./routes/announcements');
const notificationRoutes = require('./routes/notifications');
const feeRoutes = require('./routes/fees');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional: Log every request
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'School Management API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`❌ Error in ${req.method} ${req.originalUrl}`);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  console.warn(`⚠️  404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// 🔌 Test DB and start server
(async () => {
  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1'); // ✅ test MSSQL connection

    console.log('✅ Connected to database successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database!');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
