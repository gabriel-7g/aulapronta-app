
import { Request, Response } from 'express';

import {
  criarUsuario,
  excluirUsuario,
  listarUsuarios,
  redefinirSenhaUsuario
} from '../services/usuarioService';

// Listar professores
export const listar = async (_req: Request, res: Response) => {
  try {
    const usuarios = await listarUsuarios();
    return res.status(200).json({ usuarios });

  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};

// Cadastrar professor
export const criar = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    if (
      typeof nome !== 'string' || !nome.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof senha !== 'string' || senha.length < 6
    ) {
      return res.status(400).json({
        erro: 'Nome, email e senha são obrigatórios. A senha precisa ter pelo menos 6 caracteres.'
      });
    }

    const resultado = await criarUsuario({ nome, email, senha });

    if ('erro' in resultado) {
      return res.status(409).json({
        erro: 'Este email já está cadastrado.'
      });
    }

    return res.status(201).json(resultado);

  } catch (erro) {
    console.error('Erro ao criar usuário:', erro);
    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};

// Excluir professor
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
        erro: 'O administrador não pode excluir a própria conta.'
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
    console.error('Erro ao excluir usuário:', erro);
    return res.status(500).json({
      erro: 'Erro interno do servidor.'
    });
  }
};

// Redefinir senha de professor
export const redefinirSenha = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body ?? {};

    const uuidValido =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidValido.test(id)) {
      return res.status(400).json({
        erro: 'ID do professor inválido.'
      });
    }

    if (
      typeof novaSenha !== 'string' ||
      novaSenha.trim().length < 10 ||
      Buffer.byteLength(novaSenha, 'utf8') > 72
    ) {
      return res.status(400).json({
        erro: 'A senha deve ter pelo menos 10 caracteres e no máximo 72 bytes.'
      });
    }

    if (!req.usuario) {
      return res.status(401).json({
        erro: 'Usuário não autenticado.'
      });
    }

    if (req.usuario.id === id) {
      return res.status(403).json({
        erro: 'Não é permitido redefinir a própria senha por esta rota.'
      });
    }

    const resultado = await redefinirSenhaUsuario(
      req.usuario.id,
      id,
      novaSenha
    );

    if (resultado === 'SEM_PERMISSAO') {
      return res.status(403).json({
        erro: 'Acesso permitido apenas para administradores.'
      });
    }

    if (resultado === 'NAO_ENCONTRADO') {
      return res.status(404).json({
        erro: 'Professor não encontrado.'
      });
    }

    if (resultado === 'TIPO_NAO_PERMITIDO') {
      return res.status(403).json({
        erro: 'Somente senhas de professores podem ser redefinidas.'
      });
    }

    console.info('Senha de professor redefinida:', {
      administradorId: req.usuario.id,
      professorId: id
    });

    return res.status(200).json({
      mensagem: 'Senha redefinida com sucesso.'
    });

  } catch (erro) {
    console.error('Erro ao redefinir senha:', erro);

    return res.status(500).json({
      erro: 'Não foi possível redefinir a senha.'
    });
  }
};
