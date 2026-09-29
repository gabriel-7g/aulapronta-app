import { PlanejamentoSalvo } from '../types/planejamento';


const PLANEJAMENTOS_KEY = 'planejamentosSalvos';


/* =========================================================
   FUNÇÕES INTERNAS
   ========================================================= */

const gerarId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};


const obterTodosPlanejamentos = (): PlanejamentoSalvo[] => {
  const dados = localStorage.getItem(PLANEJAMENTOS_KEY);

  if (!dados) {
    return [];
  }

  try {
    const lista = JSON.parse(dados);

    return Array.isArray(lista)
      ? lista
      : [];
  } catch {
    return [];
  }
};


const salvarTodosPlanejamentos = (
  planejamentos: PlanejamentoSalvo[]
) => {
  localStorage.setItem(
    PLANEJAMENTOS_KEY,
    JSON.stringify(planejamentos)
  );
};


const criarTituloDaCopia = (
  tituloOriginal: string,
  usuarioId: string
): string => {
  /*
    Se duplicarmos uma cópia, removemos:
    "(cópia)"
    "(cópia 2)"
    "(cópia 3)"
    etc.
  */

  const tituloBase = tituloOriginal
    .replace(/\s+\(cópia(?:\s+\d+)?\)$/i, '')
    .trim();

  const titulosExistentes = new Set(
    listarPlanejamentosDoUsuario(usuarioId)
      .map((plano) =>
        plano.conteudo.titulo.toLocaleLowerCase('pt-BR')
      )
  );

  let novoTitulo = `${tituloBase} (cópia)`;

  if (
    !titulosExistentes.has(
      novoTitulo.toLocaleLowerCase('pt-BR')
    )
  ) {
    return novoTitulo;
  }

  let numero = 2;

  while (
    titulosExistentes.has(
      `${tituloBase} (cópia ${numero})`
        .toLocaleLowerCase('pt-BR')
    )
  ) {
    numero++;
  }

  return `${tituloBase} (cópia ${numero})`;
};


/* =========================================================
   LISTAR PLANEJAMENTOS
   ========================================================= */

export const listarPlanejamentosDoUsuario = (
  usuarioId: string
): PlanejamentoSalvo[] => {
  return obterTodosPlanejamentos()
    .filter(
      (plano) =>
        plano.usuarioId === usuarioId
    )
    .sort(
      (a, b) =>
        new Date(b.atualizadoEm).getTime() -
        new Date(a.atualizadoEm).getTime()
    );
};


/* =========================================================
   BUSCAR PLANEJAMENTO
   ========================================================= */

export const buscarPlanejamentoPorId = (
  id: string,
  usuarioId: string
): PlanejamentoSalvo | null => {
  const planejamento = obterTodosPlanejamentos()
    .find(
      (plano) =>
        plano.id === id &&
        plano.usuarioId === usuarioId
    );

  return planejamento ?? null;
};


/* =========================================================
   SALVAR / ATUALIZAR
   ========================================================= */

export const salvarPlanejamento = (
  planejamento: PlanejamentoSalvo
): PlanejamentoSalvo => {
  const planejamentos = obterTodosPlanejamentos();

  const indice = planejamentos.findIndex(
    (plano) =>
      plano.id === planejamento.id &&
      plano.usuarioId === planejamento.usuarioId
  );

  if (indice >= 0) {
    planejamentos[indice] = planejamento;
  } else {
    planejamentos.push(planejamento);
  }

  salvarTodosPlanejamentos(planejamentos);

  return planejamento;
};


/* =========================================================
   DUPLICAR PLANEJAMENTO
   ========================================================= */

export const duplicarPlanejamentoDoUsuario = (
  planejamentoId: string,
  usuarioId: string
): PlanejamentoSalvo | null => {
  const original = buscarPlanejamentoPorId(
    planejamentoId,
    usuarioId
  );

  /*
    Impede duplicar um planejamento inexistente
    ou pertencente a outro usuário.
  */

  if (!original) {
    return null;
  }

  const agora = new Date().toISOString();

  const copia: PlanejamentoSalvo = {
    ...original,

    id: gerarId(),

    usuarioId,

    criadoEm: agora,

    atualizadoEm: agora,

    dados: {
      ...original.dados
    },

    conteudo: {
      ...original.conteudo,

      titulo: criarTituloDaCopia(
        original.conteudo.titulo,
        usuarioId
      )
    }
  };

  return salvarPlanejamento(copia);
};


/* =========================================================
   EXCLUIR PLANEJAMENTO
   ========================================================= */

export const excluirPlanejamentoDoUsuario = (
  planejamentoId: string,
  usuarioId: string
): boolean => {
  const planejamentos = obterTodosPlanejamentos();

  const novaLista = planejamentos.filter(
    (plano) =>
      !(
        plano.id === planejamentoId &&
        plano.usuarioId === usuarioId
      )
  );

  /*
    Nenhum plano foi removido.
  */

  if (
    novaLista.length ===
    planejamentos.length
  ) {
    return false;
  }

  salvarTodosPlanejamentos(novaLista);

  return true;
};