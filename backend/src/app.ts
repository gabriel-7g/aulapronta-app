import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';

import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';
import iaRoutes from './routes/iaRoutes';
import planejamentoRoutes from './routes/planejamentoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

app.use(
  express.json({
    limit: '100kb'
  })
);


const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    erro:
      'Muitas tentativas de login. Aguarde alguns minutos.'
  }
});


const limiteIa = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    erro:
      'Muitos planejamentos foram solicitados. Aguarde alguns minutos.'
  }
});


app.use(
  '/api/auth/login',
  limiteLogin
);

app.use(
  '/api/ia',
  limiteIa
);


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

app.use(
  '/api/planejamentos',
  planejamentoRoutes
);

app.use(
  '/api/ia',
  iaRoutes
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