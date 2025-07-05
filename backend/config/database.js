const sql = require('mssql');
require('dotenv').config();

const [server, instanceName] = process.env.DB_HOST.split('\\');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server, // parsed from DB_HOST
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName, // parsed from DB_HOST
  },
  port: 1433
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to MSSQL database');
    return pool;
  })
  .catch(err => {
    console.error('❌ Failed to connect to the database!');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise
};
