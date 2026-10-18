import type {
  ConteudoPlano,
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

import {
  obterToken,
  sair
} from '../utils/auth';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';


class ErroApi extends Error {
  status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}


const requisicao = async <T>(
  rota: string,
  opcoes: RequestInit = {}
): Promise<T> => {
  const token = obterToken();

  if (!token) {
    sair();

    throw new ErroApi(
      'Sessão expirada. Faça login novamente.',
      401
    );
  }

  const resposta = await fetch(
    `${API_URL}${rota}`,
    {
      ...opcoes,

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opcoes.headers as Record<string, string> | undefined)
      }
    }
  );

  const dados = await resposta
    .json()
    .catch(() => ({}));

  if (!resposta.ok) {
    if (resposta.status === 401) {
      sair();
    }

    throw new ErroApi(
      dados?.erro ||
      'Não foi possível concluir a operação.',
      resposta.status
    );
  }

  return dados as T;
};


const criarTituloDaCopia = (
  tituloOriginal: string,
  planejamentos: PlanejamentoSalvo[]
): string => {
  const tituloBase = tituloOriginal
    .replace(
      /\s+\(cópia(?:\s+\d+)?\)$/i,
      ''
    )
    .trim();

  const existentes = new Set(
    planejamentos.map((plano) =>
      plano.conteudo.titulo
        .toLocaleLowerCase('pt-BR')
    )
  );

  const primeiraCopia =
    `${tituloBase} (cópia)`;

  if (
    !existentes.has(
      primeiraCopia.toLocaleLowerCase('pt-BR')
    )
  ) {
    return primeiraCopia;
  }

  let numero = 2;

  while (
    existentes.has(
      `${tituloBase} (cópia ${numero})`
        .toLocaleLowerCase('pt-BR')
    )
  ) {
    numero++;
  }

  return `${tituloBase} (cópia ${numero})`;
};


export const listarPlanejamentosDoUsuario =
  async (): Promise<PlanejamentoSalvo[]> => {
    const resposta = await requisicao<{
      planejamentos: PlanejamentoSalvo[];
    }>('/api/planejamentos');

    return resposta.planejamentos;
  };


export const buscarPlanejamentoPorId =
  async (
    id: string
  ): Promise<PlanejamentoSalvo | null> => {
    try {
      const resposta = await requisicao<{
        planejamento: PlanejamentoSalvo;
      }>(
        `/api/planejamentos/${id}`
      );

      return resposta.planejamento;

    } catch (erro) {
      if (
        erro instanceof ErroApi &&
        erro.status === 404
      ) {
        return null;
      }

      throw erro;
    }
  };


export const salvarPlanejamento = async (
  dados: DadosPlano,
  conteudo: ConteudoPlano,
  planejamentoId?: string
): Promise<PlanejamentoSalvo> => {
  const editando =
    Boolean(planejamentoId);

  const rota =
    editando
      ? `/api/planejamentos/${planejamentoId}`
      : '/api/planejamentos';

  const resposta = await requisicao<{
    planejamento: PlanejamentoSalvo;
  }>(
    rota,
    {
      method:
        editando
          ? 'PUT'
          : 'POST',

      body: JSON.stringify({
        dados,
        conteudo
      })
    }
  );

  return resposta.planejamento;
};


export const duplicarPlanejamentoDoUsuario =
  async (
    planejamentoId: string
  ): Promise<PlanejamentoSalvo | null> => {
    const planejamentos =
      await listarPlanejamentosDoUsuario();

    const original =
      planejamentos.find(
        (plano) =>
          plano.id === planejamentoId
      );

    if (!original) {
      return null;
    }

    const titulo =
      criarTituloDaCopia(
        original.conteudo.titulo,
        planejamentos
      );

    return salvarPlanejamento(
      {
        ...original.dados
      },
      {
        ...original.conteudo,
        titulo
      }
    );
  };


export const excluirPlanejamentoDoUsuario =
  async (
    planejamentoId: string
  ): Promise<boolean> => {
    try {
      await requisicao(
        `/api/planejamentos/${planejamentoId}`,
        {
          method: 'DELETE'
        }
      );

      return true;

    } catch (erro) {
      if (
        erro instanceof ErroApi &&
        erro.status === 404
      ) {
        return false;
      }

      throw erro;
    }
  };