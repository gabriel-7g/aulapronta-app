import {
  NextFunction,
  Request,
  Response
} from 'express';

export const autorizarAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.usuario) {
    return res.status(401).json({
      erro: 'Usuário não autenticado.'
    });
  }

  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({
      erro: 'Acesso permitido apenas para administradores.'
    });
  }

  next();
};