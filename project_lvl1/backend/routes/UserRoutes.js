require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { authenticate, authenticateAdmin } = require('../middleware/authenticate');

module.exports = (db) => {

    // server side validation
    const validateUserFields = async (user, db) => {
        const errors = [];
        if (!user.username || user.username.length < 3 || user.username.length > 30) {
            errors.push('Username must be between 3 and 30 characters.');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailRegex.test(user.email)) {
            errors.push('Invalid email format.');
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (user.password && !passwordRegex.test(user.password)) {
            errors.push('Password must be at least 8 characters long, include one letter, one number, and one special character.');
        }
        const languageExists = await new Promise((resolve) => {
            db.get('SELECT 1 FROM Language WHERE id = ?', [user.languageId], (err, row) => resolve(!!row));
        });
        if (!languageExists) errors.push('Selected language does not exist.');
        const birthDate = new Date(user.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (isNaN(birthDate.getTime()) || age < 3) {
            errors.push('Invalid birth date or user must be at least 3 years old.');
        }
        return errors;
    };

    // register a new user
    router.post('/register', async (req, res) => {
        const { username, email, password, birthDate, languageId } = req.body;
        const user = { username, email, password, birthDate, languageId, statusId: 2 }; // default to logged_in

        const validationErrors = await validateUserFields(user, db);
        if (validationErrors.length > 0) return res.status(400).json({ errors: validationErrors });

        // check if email is already registered
        db.get('SELECT id FROM User WHERE email = ?', [email], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ error: 'Email is already registered.' });

            const passwordHash = bcrypt.hashSync(password, 10);
            db.run(
                `INSERT INTO User (username, email, passwordHash, birthDate, languageId, statusId) VALUES (?, ?, ?, ?, ?, ?)`,
                [username, email, passwordHash, birthDate, languageId, 2],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: 'User registered successfully!' });
                }
        );
        });
    });
    
    // login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        db.get('SELECT * FROM User WHERE email = ?', [email], (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid password.' });
            }

            // generate a token
            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.username, languageId: user.languageId, statusId: user.statusId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ message: 'Login successful!', token });
        });
    });


    // get all users (public information only)
    router.get('/', authenticate, authenticateAdmin, (req, res) => {
        db.all(
            `SELECT User.id, User.username, User.email, Language.name AS language 
         FROM User 
         LEFT JOIN Language ON User.languageId = Language.id`,
            [],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });


    // get user by id with detailed info
    router.get('/:id', authenticate, (req, res) => {
        const userId = req.params.id;

        // ensure the logged-in user is requesting their own profile
        if (req.user.id !== parseInt(userId)) {
            return res.status(403).json({ error: 'Forbidden: Access denied.' });
        }

        const query = `
    SELECT 
        User.id, 
        User.username, 
        User.email, 
        User.birthDate, 
        Language.name AS language, 
        Status.name AS status
    FROM User
    LEFT JOIN Language ON User.languageId = Language.id
    LEFT JOIN Status ON User.statusId = Status.id
    WHERE User.id = ?`;

        db.get(query, [userId], (err, row) => {
            if (err) return res.status(500).json({ error: 'Internal server error.' });
            if (!row) return res.status(404).json({ error: 'User not found.' });
            res.json(row);
        });
    });


    // update a user
    router.put('/:id', authenticate, async (req, res) => {
        const { username, email, password, birthDate, languageId, statusId } = req.body;
        const user = { username, email, password, birthDate, languageId, statusId };

        const validationErrors = await validateUserFields(user, db);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        // ensure the email is not already registered to another account
        db.get('SELECT id FROM User WHERE email = ? AND id != ?', [email, req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ error: 'Email is already registered to another account.' });

            const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
            const query = `
            UPDATE User
            SET username = ?, email = ?, ${passwordHash ? 'passwordHash = ?,' : ''} birthDate = ?, languageId = ?, statusId = ?
            WHERE id = ?`;
            const params = [
                username,
                email,
                ...(passwordHash ? [passwordHash] : []),
                birthDate,
                languageId,
                statusId,
                req.params.id,
            ];

            db.run(query, params, function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'User not found.' });
                res.json({ message: 'User updated successfully!' });
            });
        });
    });


    // delete a user
    router.delete('/:id', authenticate, (req, res) => {
        db.run('DELETE FROM User WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found.' });
            res.json({ message: 'User deleted successfully!' });
        });
    });

    return router;
};
