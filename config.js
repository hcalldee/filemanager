// config.js
const mysql = require('mysql');

// Create a pool of connections
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust this value as needed
  host: '192.168.1.4',
  user: 'root',
  password: '',
  database: 'sik9'
});

const directoryPath = 'C:/Users/ADMINAKRE/Pictures/AnyDesk';
const token = 'qtbexUAxzqO3M8dCOo2vDMFvgYjdUEdMLVo341';
const uploadPath = 'http://192.168.1.68:3002/upload/';

module.exports = { pool,token, directoryPath,uploadPath };