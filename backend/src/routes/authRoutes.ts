import { Router } from 'express';

import {
  login,
  perfil
} from '../controllers/authController';

import {
  autenticar
} from '../middlewares/autenticar';

const authRoutes = Router();

authRoutes.post(
  '/login',
  login
);

authRoutes.get(
  '/me',
  autenticar,
  perfil
);

export default authRoutes;