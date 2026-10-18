import express from 'express';
import cors from 'cors';

import { env } from './config/env';

import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';

const app = express();

app.use(
  cors({
    origin: env.frontendUrl
  })
);

app.use(express.json());

app.use(
  '/api/health',
  healthRoutes
);

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/usuarios',
  usuarioRoutes
);

app.get('/', (_req, res) => {
  res.json({
    name: 'AulaPronta API',
    status: 'online'
  });
});

app.use((_req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada.'
  });
});

export default app;