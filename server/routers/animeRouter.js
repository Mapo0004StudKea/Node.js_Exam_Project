import express from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import upload from '../middleware/upload.js';
import db from '../database/connection.js';

const router = express.Router();

// CREATE (via CSV upload)
router.post('/upload', upload.single('file'), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          const sql = `
            INSERT INTO anime (title, genre, opinion, watch_again, times_watched, released, sub_dub)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          const values = [
            row.title || 'Ukendt titel',
            row.genre,
            row.opinion,
            row.watch_again,
            row.times_watched,
            row.released,
            row.sub_dub
          ];
          await db.query(sql, values);
        }
        res.send('CSV uploaded and data inserted.');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error processing CSV');
      }
    });
});

// CREATE
router.post('/anime', async (req, res) => {
  try {
    const { title, genre, opinion, watch_again, times_watched, released, sub_dub } = req.body;

    if (!title || !genre) {
      return res.status(400).json({ error: 'Title and genre are required' });
    }

    const sql = `
      INSERT INTO anime (title, genre, opinion, watch_again, times_watched, released, sub_dub)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      title,
      genre,
      opinion || null,
      watch_again || null,
      times_watched || 0,
      released || null,
      sub_dub || null
    ];

    const [result] = await db.query(sql, values);
    res.status(201).json({ message: 'Anime created', animeId: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create anime' });
  }
});

// READ all
router.get('/anime', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM anime');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch anime list' });
  }
});

// READ one
router.get('/anime/:id', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM anime WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Anime not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch anime' });
  }
});

// UPDATE
router.patch('/anime/:id', async (req, res) => {
  try {
    const { title, genre, opinion, watch_again, times_watched, released, sub_dub } = req.body;

    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (genre !== undefined) { fields.push('genre = ?'); values.push(genre); }
    if (opinion !== undefined) { fields.push('opinion = ?'); values.push(opinion); }
    if (watch_again !== undefined) { fields.push('watch_again = ?'); values.push(watch_again); }
    if (times_watched !== undefined) { fields.push('times_watched = ?'); values.push(times_watched); }
    if (released !== undefined) { fields.push('released = ?'); values.push(released); }
    if (sub_dub !== undefined) { fields.push('sub_dub = ?'); values.push(sub_dub); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const sql = `UPDATE anime SET ${fields.join(', ')} WHERE id = ?`;
    values.push(req.params.id);
    await db.query(sql, values);

    res.json({ message: 'Anime updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update anime' });
  }
});

// DELETE
router.delete('/anime/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM anime WHERE id = ?', [req.params.id]);
    res.json({ message: 'Anime deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete anime' });
  }
});

export default router;
