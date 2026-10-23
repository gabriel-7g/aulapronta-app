import { Router } from 'express';
import { gerarPlano, meuConsumo } from '../controllers/iaController';
import { autenticar } from '../middlewares/autenticar';

const iaRoutes = Router();

iaRoutes.use(autenticar);

iaRoutes.post('/gerar-plano', gerarPlano);
iaRoutes.get('/meu-consumo', meuConsumo);

export default iaRoutes;