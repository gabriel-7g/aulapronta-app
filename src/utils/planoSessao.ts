import type {
  ConteudoPlano,
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

import { normalizarConteudoPlano } from './conteudoPlano';

const CHAVE_SELECIONADO = 'planoSelecionado';
const CHAVE_CRIACAO = 'planoEmCriacao';
const CHAVE_CONTEUDO = 'conteudoPlanoGerado';

export interface ContextoPlano {
  dados: DadosPlano;
  planoSelecionado: PlanejamentoSalvo | null;
  conteudoGerado: ConteudoPlano | null;
}

const lerJson = (chave: string): unknown => {
  try {
    return JSON.parse(sessionStorage.getItem(chave) || 'null');
  } catch {
    return null;
  }
};

const objeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const dadosValidos = (valor: unknown): valor is DadosPlano =>
  objeto(valor) &&
  typeof valor.materia === 'string' &&
  !!valor.materia.trim() &&
  (valor.materiaId == null || typeof valor.materiaId === 'string') &&
  typeof valor.turma === 'string' &&
  !!valor.turma.trim() &&
  typeof valor.duracao === 'string' &&
  !!valor.duracao.trim() &&
  typeof valor.tema === 'string' &&
  !!valor.tema.trim() &&
  typeof valor.observacoes === 'string' &&
  (valor.nivelEnsino === undefined || typeof valor.nivelEnsino === 'string');

const obterPlanoSelecionado = (
  usuarioId: string
): PlanejamentoSalvo | null => {
  const plano = lerJson(CHAVE_SELECIONADO);

  if (
    !objeto(plano) ||
    typeof plano.id !== 'string' ||
    typeof plano.usuarioId !== 'string' ||
    plano.usuarioId !== usuarioId ||
    typeof plano.criadoEm !== 'string' ||
    typeof plano.atualizadoEm !== 'string' ||
    !dadosValidos(plano.dados)
  ) {
    return null;
  }

  const conteudo = normalizarConteudoPlano(plano.conteudo);

  return conteudo
    ? { ...plano, dados: plano.dados, conteudo } as PlanejamentoSalvo
    : null;
};

export const obterContextoPlano = (
  usuarioId?: string
): ContextoPlano | null => {
  if (!usuarioId) return null;

  const dados = lerJson(CHAVE_CRIACAO);

  if (dadosValidos(dados)) {
    sessionStorage.removeItem(CHAVE_SELECIONADO);

    return {
      dados,
      planoSelecionado: null,
      conteudoGerado: normalizarConteudoPlano(
        lerJson(CHAVE_CONTEUDO)
      )
    };
  }

  const selecionado = obterPlanoSelecionado(usuarioId);

  if (!selecionado) return null;

  sessionStorage.removeItem(CHAVE_CONTEUDO);

  return {
    dados: selecionado.dados,
    planoSelecionado: selecionado,
    conteudoGerado: null
  };
};

export const limparContextoPlano = () => {
  [
    CHAVE_SELECIONADO,
    CHAVE_CRIACAO,
    CHAVE_CONTEUDO
  ].forEach((chave) => sessionStorage.removeItem(chave));
};