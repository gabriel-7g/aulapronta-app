import {
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

import {
  buscarPlanejamentoPorId
} from '../services/planejamentoService';


const CHAVE_PLANO_SELECIONADO = 'planoSelecionado';
const CHAVE_PLANO_EM_CRIACAO = 'planoEmCriacao';


/* =========================================================
   TIPOS
   ========================================================= */

export interface ContextoPlano {
  dados: DadosPlano;
  planoSelecionado: PlanejamentoSalvo | null;
}


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

const tentarConverterJson = (
  valor: string
): unknown => {
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
};


const ehObjeto = (
  valor: unknown
): valor is Record<string, unknown> => {
  return (
    typeof valor === 'object' &&
    valor !== null
  );
};


/* =========================================================
   VALIDAR DADOS DE UM NOVO PLANO
   ========================================================= */

const dadosPlanoSaoValidos = (
  valor: unknown
): valor is DadosPlano => {
  if (!ehObjeto(valor)) {
    return false;
  }

  const materiaIdValida =
    valor.materiaId === null ||
    typeof valor.materiaId === 'string';

  const camposSaoStrings =
    typeof valor.materia === 'string' &&
    typeof valor.turma === 'string' &&
    typeof valor.duracao === 'string' &&
    typeof valor.tema === 'string' &&
    typeof valor.observacoes === 'string';

  if (
    !materiaIdValida ||
    !camposSaoStrings
  ) {
    return false;
  }

  /*
    Estes dados são obrigatórios
    para existir um planejamento.
  */

  return (
    valor.materia.trim().length > 0 &&
    valor.turma.trim().length > 0 &&
    valor.tema.trim().length > 0
  );
};


/* =========================================================
   OBTER PLANO SELECIONADO
   ========================================================= */

const obterPlanoSelecionado = (
  usuarioId: string
): PlanejamentoSalvo | null => {
  const valor =
    sessionStorage.getItem(
      CHAVE_PLANO_SELECIONADO
    );

  if (!valor) {
    return null;
  }

  const dados = tentarConverterJson(valor);

  /*
    Para buscar o planejamento real,
    precisamos apenas de um ID válido.
  */

  if (
    !ehObjeto(dados) ||
    typeof dados.id !== 'string' ||
    !dados.id.trim()
  ) {
    sessionStorage.removeItem(
      CHAVE_PLANO_SELECIONADO
    );

    return null;
  }

  /*
    Não confiamos no objeto completo salvo
    na sessão.

    Buscamos novamente o plano no service,
    usando também o ID do usuário logado.

    Assim, um usuário não consegue abrir
    um plano pertencente a outra conta.
  */

  const planejamento =
    buscarPlanejamentoPorId(
      dados.id,
      usuarioId
    );

  if (!planejamento) {
    sessionStorage.removeItem(
      CHAVE_PLANO_SELECIONADO
    );

    return null;
  }

  return planejamento;
};


/* =========================================================
   OBTER DADOS DE UM NOVO PLANO
   ========================================================= */

const obterPlanoEmCriacao =
  (): DadosPlano | null => {
    const valor =
      sessionStorage.getItem(
        CHAVE_PLANO_EM_CRIACAO
      );

    if (!valor) {
      return null;
    }

    const dados =
      tentarConverterJson(valor);

    if (!dadosPlanoSaoValidos(dados)) {
      sessionStorage.removeItem(
        CHAVE_PLANO_EM_CRIACAO
      );

      return null;
    }

    return dados;
  };


/* =========================================================
   OBTER CONTEXTO DA PÁGINA
   ========================================================= */

export const obterContextoPlano = (
  usuarioId?: string
): ContextoPlano | null => {
  if (!usuarioId) {
    return null;
  }

  /*
    Se existe um plano selecionado,
    ele obrigatoriamente precisa ser válido.

    Não fazemos fallback para um plano em
    criação caso o plano selecionado esteja
    corrompido ou pertença a outra pessoa.
  */

  const existePlanoSelecionado =
    sessionStorage.getItem(
      CHAVE_PLANO_SELECIONADO
    ) !== null;

  if (existePlanoSelecionado) {
    const plano =
      obterPlanoSelecionado(
        usuarioId
      );

    if (!plano) {
      return null;
    }

    return {
      dados: plano.dados,
      planoSelecionado: plano
    };
  }


  /*
    Caso contrário, verificamos se existe
    um novo planejamento sendo criado.
  */

  const dados =
    obterPlanoEmCriacao();

  if (!dados) {
    return null;
  }

  return {
    dados,
    planoSelecionado: null
  };
};


/* =========================================================
   LIMPAR DADOS TEMPORÁRIOS
   ========================================================= */

export const limparContextoPlano = () => {
  sessionStorage.removeItem(
    CHAVE_PLANO_SELECIONADO
  );

  sessionStorage.removeItem(
    CHAVE_PLANO_EM_CRIACAO
  );
};