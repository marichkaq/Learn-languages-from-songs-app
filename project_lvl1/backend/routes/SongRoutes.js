const express = require('express');
const router = express.Router();
const { authenticate, authenticateAdmin } = require('../middleware/authenticate');
const jwt = require('jsonwebtoken');



module.exports = (db) => {
    // server side validation
    const validateSong = (song) => {
        const errors = [];

        if (!song.title || song.title.trim() === '') errors.push('Title is required.');
        if (!song.artist || song.artist.trim() === '') errors.push('Artist is required.');
        if (!song.lyrics || song.lyrics.trim() === '') errors.push('Lyrics are required.');
        if (!song.translation || song.translation.trim() === '') errors.push('Translation is required.');
        if (!song.videoUrl || song.videoUrl.trim() === '') errors.push('Video URL is required.');
        if (!song.languageId) errors.push('Language is required.');

        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
        if (song.videoUrl && !youtubeUrlRegex.test(song.videoUrl)) {
            errors.push('Video URL is not valid.');
        }

        return errors;
    };

    // add a new song (Admin only)
    router.post('/', authenticate, authenticateAdmin, (req, res) => {
        const { title, artist, lyrics, translation, videoUrl, languageId } = req.body;
        const song = { title, artist, lyrics, translation, videoUrl, languageId };

        // validate
        const validationErrors = validateSong(song);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        const query = `
        INSERT INTO Song (title, artist, lyrics, translation, videoUrl, languageId) 
        VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(query, [title, artist, lyrics, translation, videoUrl, languageId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        });
    });

    // update a song (Admin only)
    router.put('/:id', authenticate, authenticateAdmin, (req, res) => {        const { title, artist, lyrics, translation, videoUrl, languageId } = req.body;
        const song = { title, artist, lyrics, translation, videoUrl, languageId };

        // validate
        const validationErrors = validateSong(song);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        const query = `
        UPDATE Song 
        SET title = ?, artist = ?, lyrics = ?, translation = ?, videoUrl = ?, languageId = ? 
        WHERE id = ?`;
        db.run(query, [title, artist, lyrics, translation, videoUrl, languageId, req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Song not found' });

            res.json({ message: 'Song updated successfully' });
        });
    });

    // get all songs (+language, search filters)
    router.get('/', (req, res) => {
        const { language, search } = req.query;
        const token = req.headers.authorization?.split(' ')[1];
        let userId = null;

        // Decode the token if present
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id; // Extract the user ID from the token
            } catch (err) {
                console.error('Invalid token:', err.message);
            }
        }

        // Construct the SQL query
        let query = `
        SELECT 
            Song.id, 
            Song.title, 
            Song.artist, 
            Song.videoUrl, 
            Language.name AS language
        `;

        if (userId) {
            query += `,
            EXISTS(SELECT 1 FROM Favourite WHERE Favourite.songId = Song.id AND Favourite.userId = ?) AS isFavourite`;
        }

        query += `
        FROM Song
        LEFT JOIN Language ON Song.languageId = Language.id
        WHERE 1 = 1
        `;

        const params = userId ? [userId] : [];

        // Add language filter
        if (language) {
            query += ' AND Song.languageId = ?';
            params.push(language);
        }

        // Add search filter
        if (search) {
            query += ' AND (Song.title LIKE ? OR Song.artist LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Execute the query
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            // Return the songs
            res.json(rows);
        });
    });


    // get song by id with details
    router.get('/:id', (req, res) => {
        const query = `
        SELECT 
            Song.id, 
            Song.title, 
            Song.artist, 
            Song.lyrics, 
            Song.translation, 
            Song.videoUrl, 
            Song.languageId, 
            Language.name AS languageName 
        FROM Song
        LEFT JOIN Language ON Song.languageId = Language.id
        WHERE Song.id = ?`;

        db.get(query, [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Song not found' });
            res.json(row);
        });
    });

    // delete a song (Admin only)
    router.delete('/:id', authenticate, authenticateAdmin, (req, res) => {
        const query = 'DELETE FROM Song WHERE id = ?';
        db.run(query, [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Song not found' });
            res.json({ message: 'Song deleted successfully' });
        });
    });

    // get all songs with favourites for logged-in user
    router.get('/', authenticate, authenticateAdmin, (req, res) => {
        const userId = req.user.id;

        const query = `
    SELECT 
        Song.id, 
        Song.title, 
        Song.artist, 
        Song.videoUrl,
        EXISTS(SELECT 1 FROM Favourites WHERE Favourites.songId = Song.id AND Favourites.userId = ?) AS isFavourite
    FROM Song`;

        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching songs:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });


    return router;
};
