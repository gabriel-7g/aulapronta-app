import {
  ConteudoPlano,
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

const CHAVE_SELECIONADO = 'planoSelecionado';
const CHAVE_CRIACAO = 'planoEmCriacao';

export interface ContextoPlano {
  dados: DadosPlano;
  planoSelecionado: PlanejamentoSalvo | null;
}

const json = (valor: string): unknown => {
  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
};

const objeto = (
  valor: unknown
): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null;

const dadosValidos = (
  valor: unknown
): valor is DadosPlano => {
  if (!objeto(valor)) return false;

  return (
    typeof valor.materia === 'string' &&
    valor.materia.trim().length > 0 &&
    (
      valor.materiaId === null ||
      typeof valor.materiaId === 'string'
    ) &&
    typeof valor.turma === 'string' &&
    valor.turma.trim().length > 0 &&
    typeof valor.duracao === 'string' &&
    valor.duracao.trim().length > 0 &&
    typeof valor.tema === 'string' &&
    valor.tema.trim().length > 0 &&
    typeof valor.observacoes === 'string' &&
    (
      valor.nivelEnsino === undefined ||
      typeof valor.nivelEnsino === 'string'
    )
  );
};

const conteudoValido = (
  valor: unknown
): valor is ConteudoPlano => {
  if (!objeto(valor)) return false;

  return [
    'titulo',
    'objetivo',
    'introducao',
    'desenvolvimento',
    'atividade',
    'recursos',
    'avaliacao'
  ].every(
    (campo) =>
      typeof valor[campo] === 'string'
  );
};

const obterPlanoSelecionado = (
  usuarioId: string
): PlanejamentoSalvo | null => {
  const valor =
    sessionStorage.getItem(CHAVE_SELECIONADO);

  if (!valor) return null;

  const plano = json(valor);

  if (
    !objeto(plano) ||
    typeof plano.id !== 'string' ||
    typeof plano.usuarioId !== 'string' ||
    plano.usuarioId !== usuarioId ||
    typeof plano.criadoEm !== 'string' ||
    typeof plano.atualizadoEm !== 'string' ||
    !dadosValidos(plano.dados) ||
    !conteudoValido(plano.conteudo)
  ) {
    sessionStorage.removeItem(CHAVE_SELECIONADO);
    return null;
  }

  return plano as unknown as PlanejamentoSalvo;
};

const obterPlanoEmCriacao = (): DadosPlano | null => {
  const valor =
    sessionStorage.getItem(CHAVE_CRIACAO);

  if (!valor) return null;

  const dados = json(valor);

  if (!dadosValidos(dados)) {
    sessionStorage.removeItem(CHAVE_CRIACAO);
    return null;
  }

  return dados;
};

export const obterContextoPlano = (
  usuarioId?: string
): ContextoPlano | null => {
  if (!usuarioId) return null;

  const novoPlano = obterPlanoEmCriacao();

  if (novoPlano) {
    sessionStorage.removeItem(CHAVE_SELECIONADO);

    return {
      dados: novoPlano,
      planoSelecionado: null
    };
  }

  const selecionado =
    obterPlanoSelecionado(usuarioId);

  if (!selecionado) return null;

  return {
    dados: selecionado.dados,
    planoSelecionado: selecionado
  };
};

export const limparContextoPlano = () => {
  sessionStorage.removeItem(CHAVE_SELECIONADO);
  sessionStorage.removeItem(CHAVE_CRIACAO);
};