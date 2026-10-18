import { Router } from 'express';

import {
  gerarPlano
} from '../controllers/iaController';

import {
  autenticar
} from '../middlewares/autenticar';

const iaRoutes = Router();

iaRoutes.use(autenticar);

iaRoutes.post(
  '/gerar-plano',
  gerarPlano
);

export default iaRoutes;