import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import healthRoutes from './routes/health.routes.js';
import profileRoutes from './routes/profile.routes.js';
import scoreRoutes from './routes/score.routes.js';
import cvRoutes from './routes/cv.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';

const app = express();

app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:4000'];
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use(healthRoutes);
app.use('/api', profileRoutes);
app.use('/api', scoreRoutes);
app.use('/api', cvRoutes);
app.use('/api', roadmapRoutes);

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`API server running on http://localhost:${env.PORT}`);
});

export { app, server };
