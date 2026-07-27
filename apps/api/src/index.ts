import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { prisma } from './lib/prisma.js';
import healthRoutes from './routes/health.routes.js';
import profileRoutes from './routes/profile.routes.js';
import scoreRoutes from './routes/score.routes.js';
import cvRoutes from './routes/cv.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';

const app = express();

app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:5173', 'http://localhost:4000'];
console.log('CORS allowed origins:', corsOrigin);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigin.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use(healthRoutes);
app.use('/api', profileRoutes);
app.use('/api', scoreRoutes);
app.use('/api', cvRoutes);
app.use('/api', roadmapRoutes);

app.use(errorHandler);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Fallback error:', err.message);
  if (!res.headersSent) {
    res.status(500).type('json').json({ success: false, error: 'Server error' });
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const server = app.listen(env.PORT, () => {
  console.log(`API server running on http://localhost:${env.PORT}`);
  prisma.$connect()
    .then(() => console.log('Database connected'))
    .catch((e) => console.error('Database connection failed:', e.message));
});

export { app, server };
