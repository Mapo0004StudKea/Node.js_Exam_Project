import express from 'express';
import 'dotenv/config';
import session from 'express-session';
import connection from './database/connection.js'
import fs from 'fs';
import userRoutes from './routers/users.js';

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use('/users', userRoutes);

// Konfigurer express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'enhemmeligstreng', // Her konfigureres secret optionen korrekt
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

const schema = fs.readFileSync('./database/schema.sql', 'utf8');

connection.query(schema);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));