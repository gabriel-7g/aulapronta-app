import { Router } from 'express';

import {
  criar,
  excluir,
  listar
} from '../controllers/usuarioController';

import {
  autenticar
} from '../middlewares/autenticar';

import {
  autorizarAdmin
} from '../middlewares/autorizarAdmin';

const usuarioRoutes = Router();

usuarioRoutes.use(
  autenticar,
  autorizarAdmin
);

usuarioRoutes.get(
  '/',
  listar
);

usuarioRoutes.post(
  '/',
  criar
);

usuarioRoutes.delete(
  '/:id',
  excluir
);

export default usuarioRoutes;