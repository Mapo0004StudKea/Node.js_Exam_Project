import express from 'express';
import bcrypt from 'bcrypt';
import connection from '../database/connection.js';

const router = express.Router();

// Create
router.post('/users/', async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password, roles) VALUES (?, ?, ?, ?)';
        connection.query(query, [username, email, hashedPassword, roles || 'user'], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: results.insertId, message: 'User created' });
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

// Read all
router.get('/users/', (req, res) => {
    connection.query('SELECT id, username, email, password, roles, created_at FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Read one
router.get('/users/:id', (req, res) => {
    connection.query('SELECT id, username, email, password, roles, created_at FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
});

// Update
router.patch('/users/:id', async (req, res) => {
    try {
        const { username, email, password, roles } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'UPDATE users SET username = ?, email = ?, password = ?, roles = ? WHERE id = ?';
        connection.query(query, [username, email, hashedPassword, roles, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated' });
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

// Delete
router.delete('//users:id', (req, res) => {
    connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

export default router;