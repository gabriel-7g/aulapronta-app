import {
  PlanejamentoSalvo
} from '../types/planejamento';


const PLANEJAMENTOS_KEY =
  'planejamentosSalvos';


/* =========================================================
   BUSCAR TODOS OS PLANOS DO NAVEGADOR

   Essa função é interna.
   As páginas não precisam usá-la diretamente.
   ========================================================= */

const obterTodosPlanejamentos =
  (): PlanejamentoSalvo[] => {

    const dados =
      localStorage.getItem(
        PLANEJAMENTOS_KEY
      );

    if (!dados) {
      return [];
    }

    try {
      const lista =
        JSON.parse(dados);

      if (!Array.isArray(lista)) {
        return [];
      }

      return lista;

    } catch {
      return [];
    }
  };


/* =========================================================
   SALVAR LISTA COMPLETA

   Também é uma função interna.
   ========================================================= */

const salvarTodosPlanejamentos = (
  planejamentos:
    PlanejamentoSalvo[]
) => {

  localStorage.setItem(
    PLANEJAMENTOS_KEY,
    JSON.stringify(
      planejamentos
    )
  );
};


/* =========================================================
   LISTAR SOMENTE OS PLANOS DE UM USUÁRIO
   ========================================================= */

export const listarPlanejamentosDoUsuario = (
  usuarioId: string
): PlanejamentoSalvo[] => {

  const todos =
    obterTodosPlanejamentos();

  const planejamentosDoUsuario =
    todos.filter(
      (plano) =>
        plano.usuarioId ===
        usuarioId
    );

  /*
    Mais recentes primeiro.
  */
  planejamentosDoUsuario.sort(
    (a, b) =>
      new Date(
        b.atualizadoEm
      ).getTime() -
      new Date(
        a.atualizadoEm
      ).getTime()
  );

  return planejamentosDoUsuario;
};


/* =========================================================
   BUSCAR UM PLANO ESPECÍFICO

   Repare que também verificamos usuarioId.

   Portanto:
   usuário A não consegue carregar plano do usuário B.
   ========================================================= */

export const buscarPlanejamentoPorId = (
  id: string,
  usuarioId: string
): PlanejamentoSalvo | null => {

  const todos =
    obterTodosPlanejamentos();

  const planejamento =
    todos.find(
      (plano) =>
        plano.id === id &&
        plano.usuarioId === usuarioId
    );

  return planejamento || null;
};


/* =========================================================
   SALVAR NOVO PLANO OU ATUALIZAR EXISTENTE
   ========================================================= */

export const salvarPlanejamento = (
  planejamento:
    PlanejamentoSalvo
): PlanejamentoSalvo => {

  const todos =
    obterTodosPlanejamentos();

  /*
    Só considera o mesmo plano se:
    - ID for igual
    - usuário também for igual
  */
  const indice =
    todos.findIndex(
      (plano) =>
        plano.id ===
          planejamento.id &&
        plano.usuarioId ===
          planejamento.usuarioId
    );

  if (indice >= 0) {

    /*
      Atualiza plano existente.
    */
    todos[indice] =
      planejamento;

  } else {

    /*
      Cria novo plano.
    */
    todos.push(
      planejamento
    );
  }

  salvarTodosPlanejamentos(
    todos
  );

  return planejamento;
};


/* =========================================================
   EXCLUIR PLANO

   O usuarioId também é obrigatório.
   ========================================================= */

export const excluirPlanejamentoDoUsuario = (
  planejamentoId: string,
  usuarioId: string
): boolean => {

  const todos =
    obterTodosPlanejamentos();

  const quantidadeAntes =
    todos.length;

  /*
    Remove somente se:
    - ID for igual
    - usuário for o dono
  */
  const novaLista =
    todos.filter(
      (plano) =>
        !(
          plano.id ===
            planejamentoId &&
          plano.usuarioId ===
            usuarioId
        )
    );

  if (
    novaLista.length ===
    quantidadeAntes
  ) {
    return false;
  }

  salvarTodosPlanejamentos(
    novaLista
  );

  return true;
};