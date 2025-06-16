const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const db = new sqlite3.Database('formdata.db');

db.run(`CREATE TABLE IF NOT EXISTS form_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, 
  twofa_secret TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// const runAsync = promisify(db.run.bind(db));
const runAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this); // 'this' has lastID, changes, etc.
    });
  });
};
// promisify doesnt work well on db.run because does not pass a result to the callback (just err), 
// // and the this context is needed for access to .lastID, etc.


const runAllAsync = promisify(db.all.bind(db));

module.exports = {
  db,
  runAsync,
  runAllAsync,
};