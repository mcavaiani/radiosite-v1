const mysql = require('mysql');
const util = require('util');
require('dotenv').config();
const config = require("config");
const dbConfig = config.get('dbConfig');
console.log(dbConfig);

if (process.env.NODE_ENV!=="localdev"){
  password = process.env.DBPSW;
}else{
  password = "root";
}

var pool  = mysql.createPool({
  database : dbConfig.database,
  user     : dbConfig.user,
  password : password
});

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.')
    }
}

if (connection) connection.release()

 return
});

// Promisify for Node.js async/await.
 pool.query = util.promisify(pool.query);

 module.exports = pool;
