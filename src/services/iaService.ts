
import type { ConteudoPlano, DadosPlano } from '../types/planejamento';

import { obterToken, sair } from '../utils/auth';
import { normalizarConteudoPlano } from '../utils/conteudoPlano';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RespostaIa {
  conteudo?: unknown;
  erro?: string;
}

// Requisição autenticada para o backend
const requisicaoIa = async (
  rota: string,
  corpo: unknown,
  signal?: AbortSignal
): Promise<ConteudoPlano> => {
  const token = obterToken();

  if (!token) {
    sair();
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  const resposta = await fetch(`${API_URL}/api/ia/${rota}`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(corpo)
  });

  const resultado: RespostaIa = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    if (resposta.status === 401) sair();

    throw new Error(
      resultado.erro ||
      (rota === 'gerar-plano'
        ? 'Não foi possível gerar o planejamento.'
        : 'Não foi possível editar o planejamento com IA.')
    );
  }

  const conteudo = normalizarConteudoPlano(resultado.conteudo);

  if (!conteudo) {
    throw new Error('A IA retornou um planejamento inválido.');
  }

  return conteudo;
};

// GERAR PLANEJAMENTO COM IA
export const gerarPlanoComIa = async (
  dados: DadosPlano,
  signal?: AbortSignal
): Promise<ConteudoPlano> => {
  return requisicaoIa(
    'gerar-plano',
    {
      nivelEnsino: dados.nivelEnsino,
      materia: dados.materia,
      turma: dados.turma,
      duracao: dados.duracao,
      quantidadeAulas: dados.quantidadeAulas ?? 1,
      tema: dados.tema,
      observacoes: dados.observacoes
    },
    signal
  );
};

// EDITAR PLANEJAMENTO COM IA
export const editarPlanejamentoComIa = async (
  dados: DadosPlano,
  conteudo: ConteudoPlano,
  instrucao: string
): Promise<ConteudoPlano> => {
  return requisicaoIa('editar-plano', {
    dados,
    conteudo,
    instrucao
  });
};
