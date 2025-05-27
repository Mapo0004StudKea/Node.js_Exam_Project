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

    } catch {
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
        const userId = req.params.id;

        let updateFields = [];
        let updateValues = [];

        if (username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (roles !== undefined) {
            updateFields.push('roles = ?');
            updateValues.push(roles);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        connection.query(query, [...updateValues, userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user or hash password' });
    }
});

// Delete
router.delete('/users/:id', (req, res) => {
    connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

export default router;