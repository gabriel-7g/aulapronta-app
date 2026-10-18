import {
  Request,
  Response
} from 'express';

import {
  criarUsuario,
  excluirUsuario,
  listarUsuarios
} from '../services/usuarioService';


export const listar = async (
  _req: Request,
  res: Response
) => {
  try {
    const usuarios = await listarUsuarios();

    return res.status(200).json({
      usuarios
    });

  } catch (erro) {
    console.error(
      'Erro ao listar usuários:',
      erro
    );

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};


export const criar = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nome,
      email,
      senha
    } = req.body;

    if (
      typeof nome !== 'string' ||
      !nome.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof senha !== 'string' ||
      senha.length < 6
    ) {
      return res.status(400).json({
        erro:
          'Nome, email e senha são obrigatórios. A senha precisa ter pelo menos 6 caracteres.'
      });
    }

    const resultado = await criarUsuario({
      nome,
      email,
      senha
    });

    if ('erro' in resultado) {
      return res.status(409).json({
        erro: 'Este email já está cadastrado.'
      });
    }

    return res.status(201).json(
      resultado
    );

  } catch (erro) {
    console.error(
      'Erro ao criar usuário:',
      erro
    );

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};


export const excluir = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        erro: 'ID do usuário não informado.'
      });
    }

    if (req.usuario?.id === id) {
      return res.status(400).json({
        erro:
          'O administrador não pode excluir a própria conta.'
      });
    }

    const usuario = await excluirUsuario(id);

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.status(200).json({
      mensagem: 'Usuário excluído com sucesso.'
    });

  } catch (erro) {
    console.error(
      'Erro ao excluir usuário:',
      erro
    );

    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};