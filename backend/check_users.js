import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

db.all("SELECT id, name, email, role, status FROM Users", [], (err, rows) => {
  if (err) {
    console.error('Error running query:', err.message);
    return;
  }
  console.log('=== Users in Database ===');
  console.log(rows);
  db.close();
});
