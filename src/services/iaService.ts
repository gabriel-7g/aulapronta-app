import type { ConteudoPlano, DadosPlano } from '../types/planejamento';

import { obterToken, sair } from '../utils/auth';
import { normalizarConteudoPlano } from '../utils/conteudoPlano';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RespostaIa {
  conteudo?: unknown;
  erro?: string;
}

export const gerarPlanoComIa = async (
  dados: DadosPlano,
  signal?: AbortSignal
): Promise<ConteudoPlano> => {
  const token = obterToken();

  if (!token) {
    sair();
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  const resposta = await fetch(`${API_URL}/api/ia/gerar-plano`, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nivelEnsino: dados.nivelEnsino,
      materia: dados.materia,
      turma: dados.turma,
      duracao: dados.duracao,
      tema: dados.tema,
      observacoes: dados.observacoes
    })
  });

  const resultado: RespostaIa = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    if (resposta.status === 401) sair();

    throw new Error(
      resultado.erro || 'Não foi possível gerar o planejamento.'
    );
  }

  const conteudo = normalizarConteudoPlano(resultado.conteudo);

  if (!conteudo) {
    throw new Error('A IA retornou um planejamento inválido.');
  }

  return conteudo;
};