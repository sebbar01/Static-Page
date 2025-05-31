

var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var router = express.Router();

let db = new sqlite3.Database(
  './database/db.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Błąd połączenia z bazą:', err.message);
      return;
    }
    console.log('Połączono z bazą SQLite.');
  }
);

function seedModelsIfEmpty() {
  db.get('SELECT COUNT(*) AS count FROM models', (err, row) => {
    if (err) {
      return console.error('Błąd podczas sprawdzania modeli:', err.message);
    }

    if (row.count > 0) {
      return console.log('Modele już istnieją w bazie — seed pominięty.');
    }

    const seedData = [
      ['911 Carrera', '992', 2022,  379,  450000],
      ['911 Dakar',   'G-Serie', 2021,  285,  650000],
      ['911 GT3',     '991', 2020,  500,  850000],
      ['911 Main',    '993', 1998,  272,  300000],
      ['911 Turbo',   '997', 2010,  500,  700000]
    ];

    db.serialize(() => {
      const stmt = db.prepare(`
        INSERT INTO models (model, generation, year, horsepower, price)
        VALUES (?, ?, ?, ?, ?)
      `);

      seedData.forEach(item => {
        stmt.run(item, err => {
          if (err) {
            console.error('Błąd przy seedowaniu:', err.message);
          }
        });
      });

      stmt.finalize(() => {
        console.log('Dodano przykładowe modele do bazy.');
      });
    });
  });
}

db.run(
  `
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    subject     TEXT    NOT NULL,
    message     TEXT    NOT NULL
  )
  `,
  (err) => {
    if (err) {
      console.error('Błąd podczas tworzenia tabeli contacts:', err.message);
    } else {
      console.log('Tabela contacts gotowa.');
    }
  }
);


db.run(
  `
  CREATE TABLE IF NOT EXISTS models (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    model       TEXT,
    generation  TEXT,
    year        INTEGER,
    horsepower  INTEGER,
    price       INTEGER
  )
  `,
  (err) => {
    if (err) {
      console.error('Błąd tworzenia tabeli models:', err.message);
    } else {
      console.log('Tabela models gotowa.');
      seedModelsIfEmpty();
    }
  }
);
db.run(
  `
  CREATE TABLE IF NOT EXISTS reviews (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_name  TEXT    NOT NULL,
    rating         INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    review_text    TEXT    NOT NULL
  )
  `,
  (err) => {
    if (err) {
      console.error('Błąd tworzenia tabeli reviews:', err.message);
    } else {
      console.log('Tabela reviews gotowa.');
    }
  }
);

router.post('/contact', (req, res) => {
  const { first_name, last_name, subject, message } = req.body;

  if (!first_name || !last_name || !subject || !message) {
    res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    return;
  }

  const sql = `
    INSERT INTO contacts (first_name, last_name, subject, message)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [first_name, last_name, subject, message], function (err) {
    if (err) {
      console.error('Błąd podczas zapisu do bazy:', err.message);
      res.status(500).json({ error: 'Błąd zapisu do bazy danych.' });
      return;
    }
    res.json({ message: 'Dane zostały zapisane.', id: this.lastID });
  });
});

router.post('/models', (req, res) => {
  const { model, generation, year, horsepower, price } = req.body;

  if (!model || !generation || !year || !horsepower || !price) {
    res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    return;
  }

  const sql = `
    INSERT INTO models (model, generation, year, horsepower, price)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [model, generation, year, horsepower, price], function (err) {
    if (err) {
      console.error('Błąd podczas dodawania modelu:', err.message);
      res.status(500).json({ error: 'Błąd zapisu do bazy danych.' });
      return;
    }
    res.json({ message: 'Model dodany.', id: this.lastID });
  });
});

router.get('/models', (req, res) => {
  const sql = 'SELECT * FROM models ORDER BY id';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania modeli:', err.message);
      res.status(500).json({ error: 'Błąd podczas pobierania danych.' });
      return;
    }
    res.json(rows);
  });
});

router.post('/reviews', (req, res) => {
  const { reviewerName, rating, reviewText } = req.body;

  if (!reviewerName || !rating || !reviewText) {
    res.status(400).json({ error: 'Wszystkie pola (imię, ocena, tekst) są wymagane.' });
    return;
  }

  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({ error: 'Ocena musi być liczbą od 1 do 5.' });
    return;
  }

  const sql = `
    INSERT INTO reviews (reviewer_name, rating, review_text)
    VALUES (?, ?, ?)
  `;
  db.run(sql, [reviewerName, parsedRating, reviewText], function (err) {
    if (err) {
      console.error('Błąd podczas zapisu opinii:', err.message);
      res.status(500).json({ error: 'Błąd zapisu opinii do bazy.' });
      return;
    }

    res.json({ message: 'Opinia została dodana.', id: this.lastID });
  });
});


router.get('/reviews', (req, res) => {
  const sql = 'SELECT * FROM reviews ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania opinii:', err.message);
      res.status(500).json({ error: 'Błąd podczas pobierania opinii.' });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
