// Imports og konfiguration
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

import connection from './database/connection.js';
import userRoutes from './routers/users.js';
import authRouter from './routers/authRouter.js';
import meRouter from './routers/meRouter.js';
import { setupMailer } from './mail/mailer.js';

// Initier Express og http-server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 // 1 dag
  }
}));

// Socket.io logik
io.on('connection', (socket) => {
  console.log('En bruger forbundet:', socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Bruger forlod:', socket.id);
  });
});

// Routes
app.use(authRouter);
app.use(userRoutes);
app.use(meRouter);

// Opsætning (Mailer, Database)
await setupMailer();

const schema = fs.readFileSync('./database/schema.sql', 'utf8');
connection.query(schema, (err) => {
  if (err) {
    console.error('Database setup fejl:', err);
  } else {
    console.log('Database schema kørt.');
  }
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});