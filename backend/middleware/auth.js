const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/database');

// ✅ Token validation middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, decoded.userId)
      .query('SELECT * FROM users WHERE id = @userId');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT middleware error:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ✅ Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient role' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
