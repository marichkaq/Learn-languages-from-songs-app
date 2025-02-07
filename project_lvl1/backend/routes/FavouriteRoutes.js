const express = require('express');
const router = express.Router();
const {authenticate} = require('../middleware/authenticate');

module.exports = (db) => {

    // add a new favourite
    router.post('/', (req, res) => {
        const { userId, songId, rating } = req.body;

        if (!userId || !songId || !rating) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (rating < 1 || rating > 100) {
            return res.status(400).json({ error: 'Rating must be between 1 and 100.' });
        }

        const query = `
            INSERT OR REPLACE INTO Favourite (userId, songId, rating)
            VALUES (?, ?, ?)
        `;

        db.run(query, [userId, songId, rating], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Favourite added successfully', id: this.lastID });
        });
    });

    // delete a favourite
    router.delete('/:userId/:songId', (req, res) => {
        const query = `
            DELETE FROM Favourite 
            WHERE userId = ? AND songId = ?`;

        db.run(query, [req.params.userId, req.params.songId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Favourite not found' });
            res.json({ message: 'Favourite deleted successfully' });
        });
    });

    // get favourites for logged-in user
    router.get('/', authenticate, (req, res) => {
        const userId = req.user.id; // Extracted from JWT
        const query = `
    SELECT 
        Song.id, 
        Song.title, 
        Song.artist, 
        Song.videoUrl, 
        Favourite.rating
    FROM Favourite
    INNER JOIN Song ON Favourite.songId = Song.id
    WHERE Favourite.userId = ?
    ORDER BY Favourite.rating DESC`;

        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching favourites:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });


    // get top 5
    router.get('/top-songs', authenticate, (req, res) => {
        const userId = req.user.id;
        const query = `
        SELECT 
            Song.id AS songId, 
            Song.title, 
            Song.artist,
            Song. videoUrl,
            Favourite.rating 
        FROM Favourite
        INNER JOIN Song ON Favourite.songId = Song.id
        WHERE Favourite.userId = ?
        ORDER BY Favourite.rating DESC
        LIMIT 5;
    `;

        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching top songs:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // toggle favourite status
    router.put('/:songId', authenticate, (req, res) => {
        const userId = req.user.id;
        const { songId } = req.params;

        // check if the song is already in favourites
        const checkQuery = `SELECT * FROM Favourite WHERE userId = ? AND songId = ?`;

        db.get(checkQuery, [userId, songId], (err, row) => {
            if (err) {
                console.error('Error checking favourite:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                // remove from favourites
                const deleteQuery = `DELETE FROM Favourite WHERE userId = ? AND songId = ?`;
                db.run(deleteQuery, [userId, songId], (err) => {
                    if (err) {
                        console.error('Error removing favourite:', err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Removed from favourites', isFavourite: false });
                });
            } else {
                // add to favourites
                const insertQuery = `INSERT INTO Favourite (userId, songId, rating) VALUES (?, ?, ?)`;
                db.run(insertQuery, [userId, songId, req.body.rating || 0], (err) => {
                    if (err) {
                        console.error('Error adding favourite:', err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Added to favourites', isFavourite: true });
                });
            }
        });
    });


    return router;
};
