import express from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import upload from '../middleware/upload.js';
import db from '../database/connection.js';

const router = express.Router();

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

export default router;
