import express from 'express';
import connection from '../database/connection.js'

const router = express.Router();

// Create
router.post('/', (req, res) => {
    const { username, email, password, roles } = req.body;
    const query = 'INSERT INTO users (username, email, password, roles) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, email, password, roles || 'user'], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, message: 'User created' });
    });
});

// Read all
router.get('/', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Read one
router.get('/:id', (req, res) => {
    connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
});

// Update
router.put('/:id', (req, res) => {
    const { username, email, password, roles } = req.body;
    const query = 'UPDATE users SET username = ?, email = ?, password = ?, roles = ? WHERE id = ?';
    connection.query(query, [username, email, password, roles, req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated' });
    });
});

// Delete
router.delete('/:id', (req, res) => {
    connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

export default router;