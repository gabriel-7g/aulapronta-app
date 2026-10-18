import {
  NextFunction,
  Request,
  Response
} from 'express';

import jwt, {
  JwtPayload
} from 'jsonwebtoken';

import { env } from '../config/env';

interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  tipo: string;
}

export const autenticar = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      erro: 'Token não informado.'
    });
  }

  const [tipo, token] = authorization.split(' ');

  if (
    tipo !== 'Bearer' ||
    !token
  ) {
    return res.status(401).json({
      erro: 'Token inválido.'
    });
  }

  try {
    const dados = jwt.verify(
      token,
      env.jwtSecret
    ) as TokenPayload;

    if (
      typeof dados.sub !== 'string' ||
      typeof dados.email !== 'string' ||
      typeof dados.tipo !== 'string'
    ) {
      return res.status(401).json({
        erro: 'Token inválido.'
      });
    }

    req.usuario = {
      id: dados.sub,
      email: dados.email,
      tipo: dados.tipo
    };

    next();

  } catch {
    return res.status(401).json({
      erro: 'Token inválido ou expirado.'
    });
  }
};