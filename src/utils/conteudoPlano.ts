import type { ConteudoPlano, SecaoPlano } from '../types/planejamento';

const antigo = [
  ['objetivo', 'Objetivo'],
  ['introducao', 'Introdução'],
  ['desenvolvimento', 'Desenvolvimento'],
  ['atividade', 'Atividade'],
  ['recursos', 'Recursos'],
  ['avaliacao', 'Avaliação']
] as const;

const objeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const secaoValida = (valor: unknown): valor is SecaoPlano =>
  objeto(valor) &&
  typeof valor.titulo === 'string' &&
  valor.titulo.trim().length > 0 &&
  typeof valor.conteudo === 'string' &&
  valor.conteudo.trim().length > 0;

export const normalizarConteudoPlano = (
  valor: unknown
): ConteudoPlano | null => {
  if (!objeto(valor) || typeof valor.titulo !== 'string' || !valor.titulo.trim()) {
    return null;
  }

  if (
    Array.isArray(valor.secoes) &&
    valor.secoes.length > 0 &&
    valor.secoes.every(secaoValida)
  ) {
    return {
      titulo: valor.titulo,
      secoes: valor.secoes
    };
  }

  const secoes = antigo.flatMap(([campo, titulo]) => {
    const conteudo = valor[campo];

    return typeof conteudo === 'string' && conteudo.trim()
      ? [{ titulo, conteudo }]
      : [];
  });

  return secoes.length
    ? { titulo: valor.titulo, secoes }
    : null;
};