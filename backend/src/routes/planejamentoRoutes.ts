import { Router } from 'express';

import {
  atualizar,
  buscar,
  criar,
  excluir,
  listar
} from '../controllers/planejamentoController';

import {
  autenticar
} from '../middlewares/autenticar';


const planejamentoRoutes = Router();

planejamentoRoutes.use(autenticar);

planejamentoRoutes.get('/', listar);
planejamentoRoutes.get('/:id', buscar);
planejamentoRoutes.post('/', criar);
planejamentoRoutes.put('/:id', atualizar);
planejamentoRoutes.delete('/:id', excluir);

export default planejamentoRoutes;