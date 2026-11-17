
import { Router } from 'express';
import {
  gerarPlano,
  editarPlano,
  meuConsumo
} from '../controllers/iaController';
import { autenticar } from '../middlewares/autenticar';

const iaRoutes = Router();

iaRoutes.use(autenticar);

iaRoutes.post('/gerar-plano', gerarPlano);
iaRoutes.post('/editar-plano', editarPlano);
iaRoutes.get('/meu-consumo', meuConsumo);

export default iaRoutes;
