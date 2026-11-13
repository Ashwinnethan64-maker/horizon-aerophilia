import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin === FRONTEND_ORIGIN ||
      /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)
    ) {
      callback(null, true);
      return;
    }
    callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'YatraGrid Backend', health: '/health', api: '/api/health' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'YatraGrid Backend' });
});

// API route prefix
app.use('/api', apiRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
    console.log(`API endpoints accessible at http://0.0.0.0:${PORT}/api`);
  });
}

export default app;

