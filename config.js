// config.js
const mysql = require('mysql');

// Create a pool of connections
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust this value as needed
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sik'
});

const directoryPath = '';
const token = '';
const uploadPath = '';

module.exports = { pool,token, directoryPath,uploadPath };
