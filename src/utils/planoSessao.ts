import { DadosPlano, PlanejamentoSalvo } from '../types/planejamento';
import { buscarPlanejamentoPorId } from '../services/planejamentoService';

const CHAVE_PLANO_SELECIONADO = 'planoSelecionado';
const CHAVE_PLANO_EM_CRIACAO = 'planoEmCriacao';


export interface ContextoPlano {
  dados: DadosPlano;
  planoSelecionado: PlanejamentoSalvo | null;
}


const tentarConverterJson = (valor: string): unknown => {
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
};


const ehObjeto = (
  valor: unknown
): valor is Record<string, unknown> => {
  return typeof valor === 'object' && valor !== null;
};


const dadosPlanoSaoValidos = (
  valor: unknown
): valor is DadosPlano => {
  if (!ehObjeto(valor)) return false;

  const materiaIdValida =
    valor.materiaId === null ||
    typeof valor.materiaId === 'string';

  const nivelEnsinoValido =
    valor.nivelEnsino === undefined ||
    (
      typeof valor.nivelEnsino === 'string' &&
      valor.nivelEnsino.trim().length > 0
    );

  const camposSaoStrings =
    typeof valor.materia === 'string' &&
    typeof valor.turma === 'string' &&
    typeof valor.duracao === 'string' &&
    typeof valor.tema === 'string' &&
    typeof valor.observacoes === 'string';

  if (
    !materiaIdValida ||
    !nivelEnsinoValido ||
    !camposSaoStrings
  ) {
    return false;
  }

  return (
    valor.materia.trim().length > 0 &&
    valor.turma.trim().length > 0 &&
    valor.duracao.trim().length > 0 &&
    valor.tema.trim().length > 0
  );
};


const obterPlanoSelecionado = (
  usuarioId: string
): PlanejamentoSalvo | null => {
  const valor = sessionStorage.getItem(
    CHAVE_PLANO_SELECIONADO
  );

  if (!valor) return null;

  const dados = tentarConverterJson(valor);

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

  const planejamento = buscarPlanejamentoPorId(
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


const obterPlanoEmCriacao = (): DadosPlano | null => {
  const valor = sessionStorage.getItem(
    CHAVE_PLANO_EM_CRIACAO
  );

  if (!valor) return null;

  const dados = tentarConverterJson(valor);

  if (!dadosPlanoSaoValidos(dados)) {
    sessionStorage.removeItem(
      CHAVE_PLANO_EM_CRIACAO
    );

    return null;
  }

  return dados;
};


export const obterContextoPlano = (
  usuarioId?: string
): ContextoPlano | null => {
  if (!usuarioId) return null;

  /*
    Novo planejamento tem prioridade.

    Isso evita que um plano selecionado antigo
    interfira na geração de um novo plano.
  */
  const planoEmCriacao = obterPlanoEmCriacao();

  if (planoEmCriacao) {
    sessionStorage.removeItem(
      CHAVE_PLANO_SELECIONADO
    );

    return {
      dados: planoEmCriacao,
      planoSelecionado: null
    };
  }

  /*
    Se não existe novo plano em criação,
    verificamos se o usuário abriu um plano salvo.
  */
  const planoSelecionado =
    obterPlanoSelecionado(usuarioId);

  if (!planoSelecionado) {
    return null;
  }

  return {
    dados: planoSelecionado.dados,
    planoSelecionado
  };
};


export const limparContextoPlano = () => {
  sessionStorage.removeItem(
    CHAVE_PLANO_SELECIONADO
  );

  sessionStorage.removeItem(
    CHAVE_PLANO_EM_CRIACAO
  );
};