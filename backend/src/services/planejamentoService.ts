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
  objetivo: string;
  introducao: string;
  desenvolvimento: string;
  atividade: string;
  recursos: string;
  avaliacao: string;
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

const formatarPlanejamento = (
  plano: RegistroPlanejamento
) => ({
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

  conteudo: {
    titulo: plano.titulo,
    objetivo: plano.objetivo,
    introducao: plano.introducao,
    desenvolvimento: plano.desenvolvimento,
    atividade: plano.atividade,
    recursos: plano.recursos,
    avaliacao: plano.avaliacao
  }
});


export const listarPlanejamentos = async (
  usuarioId: string
) => {
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
  const plano = await db.orm.public.Planejamento.first({
    id,
    usuarioId
  });

  return plano
    ? formatarPlanejamento(plano)
    : null;
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

    titulo: conteudo.titulo,
    objetivo: conteudo.objetivo,
    introducao: conteudo.introducao,
    desenvolvimento: conteudo.desenvolvimento,
    atividade: conteudo.atividade,
    recursos: conteudo.recursos,
    avaliacao: conteudo.avaliacao
  });

  return formatarPlanejamento(plano);
};


export const atualizarPlanejamento = async (
  id: string,
  usuarioId: string,
  { dados, conteudo }: PlanoInput
) => {
  const plano = await db.orm.public.Planejamento
    .where({
      id,
      usuarioId
    })
    .update({
      nivelEnsino: dados.nivelEnsino || null,
      materia: dados.materia,
      materiaId: dados.materiaId ?? null,
      turma: dados.turma,
      duracao: dados.duracao,
      tema: dados.tema,
      observacoes: dados.observacoes || null,

      titulo: conteudo.titulo,
      objetivo: conteudo.objetivo,
      introducao: conteudo.introducao,
      desenvolvimento: conteudo.desenvolvimento,
      atividade: conteudo.atividade,
      recursos: conteudo.recursos,
      avaliacao: conteudo.avaliacao
    });

  return plano
    ? formatarPlanejamento(plano)
    : null;
};


export const excluirPlanejamento = async (
  id: string,
  usuarioId: string
) => {
  return db.orm.public.Planejamento
    .where({
      id,
      usuarioId
    })
    .delete();
};