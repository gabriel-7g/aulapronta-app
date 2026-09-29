import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  duplicarPlanejamentoDoUsuario,
  excluirPlanejamentoDoUsuario,
  listarPlanejamentosDoUsuario
} from '../services/planejamentoService';

import {
  PlanejamentoSalvo
} from '../types/planejamento';

import {
  TipoOrdenacao
} from '../types/filtrosPlanejamento';


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

const normalizarTexto = (texto: string) => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};


/* =========================================================
   HOOK
   ========================================================= */

export const usePlanejamentos = (
  usuarioId?: string
) => {

  /* -------------------------------------------------------
     DADOS
     ------------------------------------------------------- */

  const [planejamentos, setPlanejamentos] =
    useState<PlanejamentoSalvo[]>([]);


  /* -------------------------------------------------------
     FILTROS
     ------------------------------------------------------- */

  const [busca, setBusca] =
    useState('');

  const [filtroMateria, setFiltroMateria] =
    useState('todas');

  const [filtroTurma, setFiltroTurma] =
    useState('todas');

  const [ordenacao, setOrdenacao] =
    useState<TipoOrdenacao>('recentes');


  /* -------------------------------------------------------
     CARREGAR
     ------------------------------------------------------- */

  const carregarPlanejamentos =
    useCallback(() => {

      if (!usuarioId) {
        setPlanejamentos([]);
        return;
      }

      const lista =
        listarPlanejamentosDoUsuario(
          usuarioId
        );

      setPlanejamentos(lista);

    }, [usuarioId]);


  useEffect(() => {
    carregarPlanejamentos();
  }, [carregarPlanejamentos]);


  /* -------------------------------------------------------
     MATÉRIAS
     ------------------------------------------------------- */

  const materiasDisponiveis =
    useMemo(() => {

      const materias = planejamentos
        .map(
          (plano) =>
            plano.dados.materia.trim()
        )
        .filter(Boolean);


      return Array
        .from(new Set(materias))
        .sort(
          (a, b) =>
            a.localeCompare(
              b,
              'pt-BR'
            )
        );

    }, [planejamentos]);


  /* -------------------------------------------------------
     TURMAS
     ------------------------------------------------------- */

  const turmasDisponiveis =
    useMemo(() => {

      const turmas = planejamentos
        .map(
          (plano) =>
            plano.dados.turma.trim()
        )
        .filter(Boolean);


      return Array
        .from(new Set(turmas))
        .sort(
          (a, b) =>
            a.localeCompare(
              b,
              'pt-BR',
              {
                numeric: true
              }
            )
        );

    }, [planejamentos]);


  /* -------------------------------------------------------
     FILTRAGEM
     ------------------------------------------------------- */

  const planejamentosFiltrados =
    useMemo(() => {

      let resultado = [
        ...planejamentos
      ];


      /* BUSCA */

      const termo =
        normalizarTexto(busca);


      if (termo) {
        resultado =
          resultado.filter(
            (plano) => {

              const texto =
                normalizarTexto(
                  [
                    plano.conteudo.titulo,
                    plano.dados.tema,
                    plano.dados.materia,
                    plano.dados.turma,
                    plano.conteudo.objetivo
                  ].join(' ')
                );


              return texto.includes(
                termo
              );

            }
          );
      }


      /* MATÉRIA */

      if (
        filtroMateria !==
        'todas'
      ) {
        resultado =
          resultado.filter(
            (plano) =>
              plano.dados.materia ===
              filtroMateria
          );
      }


      /* TURMA */

      if (
        filtroTurma !==
        'todas'
      ) {
        resultado =
          resultado.filter(
            (plano) =>
              plano.dados.turma ===
              filtroTurma
          );
      }


      /* ORDENAÇÃO */

      resultado.sort(
        (a, b) => {

          switch (ordenacao) {

            case 'antigos':
              return (
                new Date(
                  a.atualizadoEm
                ).getTime() -
                new Date(
                  b.atualizadoEm
                ).getTime()
              );


            case 'titulo-az':
              return (
                a.conteudo.titulo
                  .localeCompare(
                    b.conteudo.titulo,
                    'pt-BR'
                  )
              );


            case 'titulo-za':
              return (
                b.conteudo.titulo
                  .localeCompare(
                    a.conteudo.titulo,
                    'pt-BR'
                  )
              );


            case 'recentes':
            default:
              return (
                new Date(
                  b.atualizadoEm
                ).getTime() -
                new Date(
                  a.atualizadoEm
                ).getTime()
              );

          }

        }
      );


      return resultado;

    }, [
      planejamentos,
      busca,
      filtroMateria,
      filtroTurma,
      ordenacao
    ]);


  /* -------------------------------------------------------
     FILTROS ATIVOS
     ------------------------------------------------------- */

  const filtrosAtivos =
    busca.trim() !== '' ||
    filtroMateria !== 'todas' ||
    filtroTurma !== 'todas' ||
    ordenacao !== 'recentes';


  /* -------------------------------------------------------
     LIMPAR FILTROS
     ------------------------------------------------------- */

  const limparFiltros = () => {
    setBusca('');
    setFiltroMateria('todas');
    setFiltroTurma('todas');
    setOrdenacao('recentes');
  };


  /* -------------------------------------------------------
     DUPLICAR
     ------------------------------------------------------- */

  const duplicarPlanejamento =
    useCallback(
      (planejamentoId: string) => {

        if (!usuarioId) {
          return null;
        }


        const copia =
          duplicarPlanejamentoDoUsuario(
            planejamentoId,
            usuarioId
          );


        if (copia) {
          carregarPlanejamentos();
        }


        return copia;

      },
      [
        usuarioId,
        carregarPlanejamentos
      ]
    );


  /* -------------------------------------------------------
     EXCLUIR
     ------------------------------------------------------- */

  const excluirPlanejamento =
    useCallback(
      (planejamentoId: string) => {

        if (!usuarioId) {
          return false;
        }


        const excluido =
          excluirPlanejamentoDoUsuario(
            planejamentoId,
            usuarioId
          );


        if (excluido) {
          carregarPlanejamentos();
        }


        return excluido;

      },
      [
        usuarioId,
        carregarPlanejamentos
      ]
    );


  /* -------------------------------------------------------
     RETORNO
     ------------------------------------------------------- */

  return {
    planejamentos,
    planejamentosFiltrados,

    busca,
    setBusca,

    filtroMateria,
    setFiltroMateria,

    filtroTurma,
    setFiltroTurma,

    ordenacao,
    setOrdenacao,

    materiasDisponiveis,
    turmasDisponiveis,

    filtrosAtivos,

    limparFiltros,
    carregarPlanejamentos,
    duplicarPlanejamento,
    excluirPlanejamento
  };

};