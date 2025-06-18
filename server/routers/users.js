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
        try {
        const [results] = await connection.query(
            query,
            [username, email, hashedPassword, roles || 'user']
        );
            res.status(201).json({ id: results.insertId, message: 'User created' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } catch {
        res.status(500).json({ error: 'Failed to hash password' });
    }
});

// Read all
router.get('/users/', async (req, res) => {
try {
    const [results] = await connection.query(
    'SELECT id, username, email, password, roles, created_at FROM users'
    );
    res.json(results);
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

// Read one
router.get('/users/:id', async (req, res) => {
  try {
    const [results] = await connection.query(
      'SELECT id, username, email, password, roles, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    await connection.query(query, [...updateValues, userId]);

    res.json({ message: 'User updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user or hash password' });
  }
});

// Delete
router.delete('/users/:id', async (req, res) => {
  try {
    await connection.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;