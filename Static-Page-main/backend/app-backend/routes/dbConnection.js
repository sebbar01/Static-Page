var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var router = express.Router();

let db = new sqlite3.Database('./database/db.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Błąd połączenia z bazą:', err.message);
    return;
  }
  console.log('Połączono z bazą SQLite.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Błąd podczas tworzenia tabeli contacts:', err.message);
  } else {
    console.log('Tabela contacts gotowa.');
  }
});

router.post('/contact', (req, res) => {
  const { first_name, last_name, subject, message } = req.body;

  if (!first_name || !last_name || !subject || !message) {
    res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    return;
  }

  const sql = `INSERT INTO contacts (first_name, last_name, subject, message) VALUES (?, ?, ?, ?)`;
  db.run(sql, [first_name, last_name, subject, message], function(err) {
    if (err) {
      console.error('Błąd podczas zapisu do bazy:', err.message);
      res.status(500).json({ error: 'Błąd zapisu do bazy danych.' });
      return;
    }
    res.json({ message: 'Dane zostały zapisane.', id: this.lastID });
  });
});

module.exports = router;
