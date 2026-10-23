import { db } from '../prisma/db';

export interface DadosPlanoInput {
  nivelEnsino?: string;
  materia: string;
  materiaId?: string | null;
  turma: string;
  duracao: string;
  tema: string;
  observacoes?: string;
}

export interface ConteudoPlanoInput {
  titulo: string;
  secoes: Array<{ titulo: string; conteudo: string }>;
}

export interface PlanoInput {
  dados: DadosPlanoInput;
  conteudo: ConteudoPlanoInput;
}

interface RegistroPlanejamento {
  id: string;
  usuarioId: string;
  nivelEnsino: string | null;
  materia: string;
  materiaId: string | null;
  turma: string;
  duracao: string;
  tema: string;
  observacoes: string | null;
  titulo: string;
  objetivo: string;
  introducao: string;
  desenvolvimento: string;
  atividade: string;
  recursos: string;
  avaliacao: string;
  criadoEm: string;
  atualizadoEm: string;
}

const PREFIXO = 'LOUSA_SECOES_V1:';

const serializarConteudo = (conteudo: ConteudoPlanoInput) => ({
  titulo: conteudo.titulo,
  objetivo: '',
  introducao: '',
  desenvolvimento: PREFIXO + JSON.stringify(conteudo.secoes),
  atividade: '',
  recursos: '',
  avaliacao: ''
});

const desserializarConteudo = (
  plano: RegistroPlanejamento
): ConteudoPlanoInput => {
  if (plano.desenvolvimento.startsWith(PREFIXO)) {
    try {
      const secoes: unknown = JSON.parse(
        plano.desenvolvimento.slice(PREFIXO.length)
      );

      if (
        Array.isArray(secoes) &&
        secoes.length > 0 &&
        secoes.every((secao) =>
          secao &&
          typeof secao.titulo === 'string' &&
          typeof secao.conteudo === 'string'
        )
      ) {
        return { titulo: plano.titulo, secoes };
      }
    } catch {
      // Caso o JSON esteja inválido, tenta ler o formato antigo.
    }
  }

  const historico = [
    ['Objetivo', plano.objetivo],
    ['Introdução', plano.introducao],
    ['Desenvolvimento', plano.desenvolvimento],
    ['Atividade', plano.atividade],
    ['Recursos', plano.recursos],
    ['Avaliação', plano.avaliacao]
  ];

  return {
    titulo: plano.titulo,
    secoes: historico
      .filter(([, conteudo]) => conteudo.trim())
      .map(([titulo, conteudo]) => ({ titulo, conteudo }))
  };
};

const formatarPlanejamento = (plano: RegistroPlanejamento) => ({
  id: plano.id,
  usuarioId: plano.usuarioId,
  criadoEm: plano.criadoEm,
  atualizadoEm: plano.atualizadoEm,
  dados: {
    nivelEnsino: plano.nivelEnsino ?? undefined,
    materia: plano.materia,
    materiaId: plano.materiaId,
    turma: plano.turma,
    duracao: plano.duracao,
    tema: plano.tema,
    observacoes: plano.observacoes ?? ''
  },
  conteudo: desserializarConteudo(plano)
});

export const listarPlanejamentos = async (usuarioId: string) => {
  const planos = await db.orm.public.Planejamento
    .where({ usuarioId })
    .orderBy((plano) => plano.atualizadoEm.desc())
    .all();

  return planos.map(formatarPlanejamento);
};

export const buscarPlanejamento = async (
  id: string,
  usuarioId: string
) => {
  const plano = await db.orm.public.Planejamento.first({ id, usuarioId });
  return plano ? formatarPlanejamento(plano) : null;
};

export const criarPlanejamento = async (
  usuarioId: string,
  { dados, conteudo }: PlanoInput
) => {
  const plano = await db.orm.public.Planejamento.create({
    usuarioId,
    nivelEnsino: dados.nivelEnsino || null,
    materia: dados.materia,
    materiaId: dados.materiaId ?? null,
    turma: dados.turma,
    duracao: dados.duracao,
    tema: dados.tema,
    observacoes: dados.observacoes || null,
    ...serializarConteudo(conteudo)
  });

  return formatarPlanejamento(plano);
};

export const atualizarPlanejamento = async (
  id: string,
  usuarioId: string,
  { dados, conteudo }: PlanoInput
) => {
  const plano = await db.orm.public.Planejamento
    .where({ id, usuarioId })
    .update({
      nivelEnsino: dados.nivelEnsino || null,
      materia: dados.materia,
      materiaId: dados.materiaId ?? null,
      turma: dados.turma,
      duracao: dados.duracao,
      tema: dados.tema,
      observacoes: dados.observacoes || null,
      ...serializarConteudo(conteudo)
    });

  return plano ? formatarPlanejamento(plano) : null;
};

export const excluirPlanejamento = async (
  id: string,
  usuarioId: string
) =>
  db.orm.public.Planejamento
    .where({ id, usuarioId })
    .delete();