import type {
  ConteudoPlano,
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

const CHAVE_SELECIONADO =
  'planoSelecionado';

const CHAVE_CRIACAO =
  'planoEmCriacao';

const CHAVE_CONTEUDO =
  'conteudoPlanoGerado';

export interface ContextoPlano {
  dados: DadosPlano;
  planoSelecionado: PlanejamentoSalvo | null;
  conteudoGerado: ConteudoPlano | null;
}

const lerJson = (
  chave: string
): unknown => {
  const valor =
    sessionStorage.getItem(chave);

  if (!valor) return null;

  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
};

const objeto = (
  valor: unknown
): valor is Record<string, unknown> =>
  typeof valor === 'object' &&
  valor !== null;

const dadosValidos = (
  valor: unknown
): valor is DadosPlano => {
  if (!objeto(valor)) return false;

  return (
    typeof valor.materia === 'string' &&
    valor.materia.trim().length > 0 &&

    (
      valor.materiaId === undefined ||
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
      typeof valor[campo] === 'string' &&
      valor[campo].trim().length > 0
  );
};

const obterPlanoSelecionado = (
  usuarioId: string
): PlanejamentoSalvo | null => {
  const plano =
    lerJson(CHAVE_SELECIONADO);

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
    return null;
  }

  return plano as unknown as PlanejamentoSalvo;
};

export const obterContextoPlano = (
  usuarioId?: string
): ContextoPlano | null => {
  if (!usuarioId) return null;

  const dados =
    lerJson(CHAVE_CRIACAO);

  if (dadosValidos(dados)) {
    const conteudo =
      lerJson(CHAVE_CONTEUDO);

    sessionStorage.removeItem(
      CHAVE_SELECIONADO
    );

    return {
      dados,
      planoSelecionado: null,
      conteudoGerado:
        conteudoValido(conteudo)
          ? conteudo
          : null
    };
  }

  const selecionado =
    obterPlanoSelecionado(usuarioId);

  if (!selecionado) {
    return null;
  }

  sessionStorage.removeItem(
    CHAVE_CONTEUDO
  );

  return {
    dados: selecionado.dados,
    planoSelecionado: selecionado,
    conteudoGerado: null
  };
};

export const limparContextoPlano = () => {
  sessionStorage.removeItem(
    CHAVE_SELECIONADO
  );

  sessionStorage.removeItem(
    CHAVE_CRIACAO
  );

  sessionStorage.removeItem(
    CHAVE_CONTEUDO
  );
};