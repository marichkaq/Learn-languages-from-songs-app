require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
app.use(cors());


const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Database connection
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Routes
const userRoutes = require('./routes/UserRoutes');
const songRoutes = require('./routes/SongRoutes');
const favouriteRoutes = require('./routes/FavouriteRoutes');

app.use('/api/users', userRoutes(db));
app.use('/api/songs', songRoutes(db));
app.use('/api/favourites', favouriteRoutes(db));

app.get('/api/languages', (req, res) => {
    const query = 'SELECT id, name FROM Language';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/statuses', (req, res) => {
    const query = 'SELECT id, name FROM Status';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
