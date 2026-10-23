import { Request, Response } from 'express';

import {
  atualizarPlanejamento,
  buscarPlanejamento,
  criarPlanejamento,
  excluirPlanejamento,
  listarPlanejamentos,
  PlanoInput
} from '../services/planejamentoService';

const textoValido = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0;

const planoValido = (valor: unknown): valor is PlanoInput => {
  if (typeof valor !== 'object' || valor === null) return false;

  const plano = valor as Partial<PlanoInput>;
  const dados = plano.dados;
  const conteudo = plano.conteudo;

  return (
    !!dados &&
    !!conteudo &&
    textoValido(dados.materia) &&
    textoValido(dados.turma) &&
    textoValido(dados.duracao) &&
    textoValido(dados.tema) &&
    textoValido(conteudo.titulo) &&
    Array.isArray(conteudo.secoes) &&
    conteudo.secoes.length > 0 &&
    conteudo.secoes.length <= 24 &&
    conteudo.secoes.every((secao) =>
      secao &&
      textoValido(secao.titulo) &&
      textoValido(secao.conteudo)
    )
  );
};

export const listar = async (req: Request, res: Response) => {
  try {
    return res.json({
      planejamentos: await listarPlanejamentos(req.usuario!.id)
    });
  } catch (erro) {
    console.error('Erro ao listar planejamentos:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const buscar = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const plano = await buscarPlanejamento(req.params.id, req.usuario!.id);

    if (!plano) {
      return res.status(404).json({
        erro: 'Planejamento não encontrado.'
      });
    }

    return res.json({ planejamento: plano });
  } catch (erro) {
    console.error('Erro ao buscar planejamento:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const criar = async (req: Request, res: Response) => {
  try {
    if (!planoValido(req.body)) {
      return res.status(400).json({
        erro: 'Os dados do planejamento são inválidos.'
      });
    }

    return res.status(201).json({
      planejamento: await criarPlanejamento(req.usuario!.id, req.body)
    });
  } catch (erro) {
    console.error('Erro ao criar planejamento:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const atualizar = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    if (!planoValido(req.body)) {
      return res.status(400).json({
        erro: 'Os dados do planejamento são inválidos.'
      });
    }

    const plano = await atualizarPlanejamento(
      req.params.id,
      req.usuario!.id,
      req.body
    );

    if (!plano) {
      return res.status(404).json({
        erro: 'Planejamento não encontrado.'
      });
    }

    return res.json({ planejamento: plano });
  } catch (erro) {
    console.error('Erro ao atualizar planejamento:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

export const excluir = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const plano = await excluirPlanejamento(req.params.id, req.usuario!.id);

    if (!plano) {
      return res.status(404).json({
        erro: 'Planejamento não encontrado.'
      });
    }

    return res.json({
      mensagem: 'Planejamento excluído com sucesso.'
    });
  } catch (erro) {
    console.error('Erro ao excluir planejamento:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};