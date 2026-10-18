import {
  Request,
  Response
} from 'express';

import {
  autenticarUsuario
} from '../services/authService';

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      senha
    } = req.body;

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof senha !== 'string' ||
      !senha
    ) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios.'
      });
    }

    const resultado =
      await autenticarUsuario({
        email,
        senha
      });

    if (!resultado) {
      return res.status(401).json({
        erro: 'Email ou senha inválidos.'
      });
    }

    return res.status(200).json(resultado);

  } catch (erro) {
    console.error(
      'Erro durante o login:',
      erro
    );

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};


export const perfil = (
  req: Request,
  res: Response
) => {
  return res.status(200).json({
    usuario: req.usuario
  });
};