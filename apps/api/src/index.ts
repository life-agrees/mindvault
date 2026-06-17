import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './routes/auth';
import chatRouter from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
// Allow local web dev servers (vite may pick 5174 or 5175) and optionally an
// env-configured origin via `WEB_ORIGIN`.
const allowedOrigins = [
  process.env.WEB_ORIGIN || '',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS not allowed'), false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

app.use('/auth', authRouter);
app.use('/chat', chatRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MindVault API',
    version: '0.1.0',
    powered_by: '0G Compute + 0G Storage',
  });
});

app.listen(PORT, () => {
  console.log(`🧠 MindVault API running on port ${PORT}`);
  console.log(`⚡ Powered by 0G Compute + 0G Storage`);
});

export default app;
