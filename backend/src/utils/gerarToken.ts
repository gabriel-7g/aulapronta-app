import jwt from 'jsonwebtoken';

import { env } from '../config/env';

interface DadosToken {
  id: string;
  email: string;
  tipo: string;
}

export const gerarToken = (
  usuario: DadosToken
): string => {
  return jwt.sign(
    {
      sub: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo
    },
    env.jwtSecret,
    {
      expiresIn: '8h'
    }
  );
};