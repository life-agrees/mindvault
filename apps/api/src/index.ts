import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import profileRouter from './routes/profile';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL,
  process.env.WEB_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/auth', authRouter);
app.use('/chat', chatRouter);
app.use('/profile', profileRouter);

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
