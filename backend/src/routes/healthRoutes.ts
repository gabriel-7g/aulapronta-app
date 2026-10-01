import { Router } from 'express';

const healthRoutes = Router();

healthRoutes.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API AulaPronta funcionando.'
  });
});

export default healthRoutes;