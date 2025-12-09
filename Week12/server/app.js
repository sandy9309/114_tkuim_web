// server/app.js

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

import authRouter from './routes/auth.js';
import signupRouter from './routes/signup.js';

const app = express();
const port = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/signup', signupRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(' Server Error:', err);
  res.status(500).json({ error: 'Server Error' });
});


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(` Server running on http://localhost:${port}`);
      console.log(` Allowed CORS origin: ${ALLOWED_ORIGIN}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect MongoDB', error);
    process.exit(1);
  });
