const mysql = require('mysql');
// database.js
const {pool} = require('./config');

function performQuery(query, params, callback) {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    // console.log('Connected to the database');

    // Perform the query with parameters
    connection.query(query, params, (err, rows) => {
      if (err) throw err;

      // Release the connection back to the pool
      connection.release();

      callback(rows); // Pass the result to the callback function
    });
  });
}


module.exports = { performQuery };