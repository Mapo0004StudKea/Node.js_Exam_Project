import express from 'express';
import 'dotenv/config';
import session from 'express-session'; // Importer express-session

const app = express();

app.use(express.json());
app.use(express.static("public"));

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));