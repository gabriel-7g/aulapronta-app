import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  IonToast,
  useIonRouter
} from '@ionic/react';

import {
  obterUsuarioLogado,
  sair
} from '../utils/auth';

import {
  duplicarPlanejamentoDoUsuario,
  excluirPlanejamentoDoUsuario,
  listarPlanejamentosDoUsuario
} from '../services/planejamentoService';

import {
  PlanejamentoSalvo
} from '../types/planejamento';

import ModalConfirmacao
  from '../components/ModalConfirmacao';

import PlanejamentoCard
  from '../components/PlanejamentoCard';

import './Planejamentos.css';
import './FiltrosPlanejamentos.css';


/* =========================================================
   TIPOS
   ========================================================= */

type TipoOrdenacao =
  | 'recentes'
  | 'antigos'
  | 'titulo-az'
  | 'titulo-za';


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

const normalizarTexto = (
  texto: string
) => {
  return texto
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim();
};


/* =========================================================
   PÁGINA
   ========================================================= */

const Planejamentos:
React.FC = () => {

  const router =
    useIonRouter();

  const usuario =
    obterUsuarioLogado();


  /* =======================================================
     ESTADOS
     ======================================================= */

  const [
    planejamentos,
    setPlanejamentos
  ] =
    useState<PlanejamentoSalvo[]>([]);


  const [
    busca,
    setBusca
  ] =
    useState('');


  const [
    filtroMateria,
    setFiltroMateria
  ] =
    useState('todas');


  const [
    filtroTurma,
    setFiltroTurma
  ] =
    useState('todas');


  const [
    ordenacao,
    setOrdenacao
  ] =
    useState<TipoOrdenacao>(
      'recentes'
    );


  const [
    planejamentoParaExcluir,
    setPlanejamentoParaExcluir
  ] =
    useState<PlanejamentoSalvo | null>(
      null
    );


  const [
    mensagem,
    setMensagem
  ] =
    useState('');


  /* =======================================================
     CARREGAR PLANEJAMENTOS
     ======================================================= */

  const carregarPlanejamentos =
    () => {

      if (!usuario) {
        setPlanejamentos([]);
        return;
      }

      setPlanejamentos(
        listarPlanejamentosDoUsuario(
          usuario.id
        )
      );

    };


  useEffect(() => {

    if (!usuario?.id) {
      setPlanejamentos([]);
      return;
    }

    setPlanejamentos(
      listarPlanejamentosDoUsuario(
        usuario.id
      )
    );

  }, [usuario?.id]);


  /* =======================================================
     OPÇÕES DOS FILTROS
     ======================================================= */

  const materiasDisponiveis =
    useMemo(() => {

      const materias =
        planejamentos
          .map(
            (plano) =>
              plano.dados.materia.trim()
          )
          .filter(Boolean);


      return Array
        .from(
          new Set(materias)
        )
        .sort(
          (a, b) =>
            a.localeCompare(
              b,
              'pt-BR'
            )
        );

    }, [planejamentos]);


  const turmasDisponiveis =
    useMemo(() => {

      const turmas =
        planejamentos
          .map(
            (plano) =>
              plano.dados.turma.trim()
          )
          .filter(Boolean);


      return Array
        .from(
          new Set(turmas)
        )
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


  /* =======================================================
     BUSCA, FILTROS E ORDENAÇÃO
     ======================================================= */

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


  /* =======================================================
     FILTROS
     ======================================================= */

  const filtrosAtivos =
    busca.trim() !== '' ||
    filtroMateria !== 'todas' ||
    filtroTurma !== 'todas' ||
    ordenacao !== 'recentes';


  const limparFiltros =
    () => {

      setBusca('');

      setFiltroMateria(
        'todas'
      );

      setFiltroTurma(
        'todas'
      );

      setOrdenacao(
        'recentes'
      );

    };


  /* =======================================================
     ABRIR
     ======================================================= */

  const abrirPlanejamento = (
    plano: PlanejamentoSalvo
  ) => {

    if (
      !usuario ||
      plano.usuarioId !== usuario.id
    ) {
      return;
    }


    sessionStorage.setItem(
      'planoSelecionado',
      JSON.stringify(plano)
    );


    router.push(
      '/plano-gerado',
      'forward'
    );

  };


  /* =======================================================
     DUPLICAR
     ======================================================= */

  const duplicarPlanejamento = (
    plano: PlanejamentoSalvo
  ) => {

    if (
      !usuario ||
      plano.usuarioId !== usuario.id
    ) {
      return;
    }


    const copia =
      duplicarPlanejamentoDoUsuario(
        plano.id,
        usuario.id
      );


    if (!copia) {
      return;
    }


    carregarPlanejamentos();


    setMensagem(
      `"${copia.conteudo.titulo}" criado com sucesso.`
    );

  };


  /* =======================================================
     EXCLUIR
     ======================================================= */

  const solicitarExclusao = (
    plano: PlanejamentoSalvo
  ) => {

    if (
      !usuario ||
      plano.usuarioId !== usuario.id
    ) {
      return;
    }


    setPlanejamentoParaExcluir(
      plano
    );

  };


  const cancelarExclusao =
    () => {

      setPlanejamentoParaExcluir(
        null
      );

    };


  const confirmarExclusao =
    () => {

      if (
        !usuario ||
        !planejamentoParaExcluir
      ) {
        return;
      }


      if (
        planejamentoParaExcluir
          .usuarioId !==
        usuario.id
      ) {

        setPlanejamentoParaExcluir(
          null
        );

        return;

      }


      const excluido =
        excluirPlanejamentoDoUsuario(
          planejamentoParaExcluir.id,
          usuario.id
        );


      setPlanejamentoParaExcluir(
        null
      );


      if (excluido) {

        carregarPlanejamentos();

        setMensagem(
          'Planejamento excluído com sucesso.'
        );

      }

    };


  /* =======================================================
     NOVO PLANO
     ======================================================= */

  const criarNovoPlano =
    () => {

      sessionStorage.removeItem(
        'planoSelecionado'
      );

      sessionStorage.removeItem(
        'planoEmCriacao'
      );


      router.push(
        '/home',
        'forward'
      );

    };


  /* =======================================================
     LOGOUT
     ======================================================= */

  const fazerLogout =
    () => {

      sair();

      router.push(
        '/login',
        'root'
      );

    };


  /* =======================================================
     ORDENAÇÃO
     ======================================================= */

  const alterarOrdenacao = (
    evento:
      React.ChangeEvent<HTMLSelectElement>
  ) => {

    setOrdenacao(
      evento.target.value as TipoOrdenacao
    );
  };
  /* =======================================================
     CONTADOR
     ======================================================= */

  const textoContador =
    () => {

      if (
        planejamentosFiltrados.length !==
        planejamentos.length
      ) {

        return (
          `${planejamentosFiltrados.length} de ${planejamentos.length} planejamentos`
        );

      }


      if (
        planejamentos.length ===
        1
      ) {

        return (
          '1 planejamento salvo'
        );

      }


      return (
        `${planejamentos.length} planejamentos salvos`
      );

    };


  /* =======================================================
     INTERFACE
     ======================================================= */

  return (

    <IonPage>

      <IonContent
        fullscreen
        className=
          "conteudo-planejamentos"
      >

        <div
          className=
            "pagina-planejamentos"
        >


          {/* =============================================
              TOPO
             ============================================= */}

          <header
            className=
              "planejamentos-topo"
          >

            <div
              className=
                "planejamentos-usuario"
            >

              <div
                className=
                  "usuario-avatar"
              >
                {
                  usuario?.nome
                    ? usuario.nome
                        .charAt(0)
                        .toUpperCase()
                    : 'U'
                }
              </div>


              <div
                className=
                  "usuario-informacoes"
              >

                <span
                  className=
                    "usuario-nome"
                >
                  {
                    usuario?.nome ||
                    'Usuário'
                  }
                </span>


                <span
                  className=
                    "usuario-email"
                >
                  {
                    usuario?.email ||
                    ''
                  }
                </span>

              </div>

            </div>


            <div
              className=
                "marca-planejamentos"
            >

              <span
                className=
                  "marca-simbolo-planejamentos"
              />

              Lousa

            </div>


            <div
              className=
                "acoes-topo-planejamentos"
            >

              <button
                type="button"
                className=
                  "botao-novo-topo"
                onClick={
                  criarNovoPlano
                }
              >
                + Novo plano
              </button>


              <button
                type="button"
                className=
                  "botao-sair"
                onClick={
                  fazerLogout
                }
              >
                Sair
              </button>

            </div>

          </header>


          {/* =============================================
              CONTEÚDO
             ============================================= */}

          <main
            className=
              "planejamentos-container"
          >

            <section
              className=
                "planejamentos-cabecalho"
            >

              <span
                className=
                  "planejamentos-etiqueta"
              >
                sua estante
              </span>


              <h1>
                Meus planejamentos
              </h1>


              <p>
                Seus planos de aula
                salvos ficam organizados aqui.
              </p>

            </section>


            {/* ===========================================
                ESTADO VAZIO
               =========================================== */}

            {
              planejamentos.length === 0

                ? (

                  <section
                    className=
                      "estado-vazio"
                  >

                    <div
                      className=
                        "estado-vazio-icone"
                      aria-hidden="true"
                    >
                      ✎
                    </div>


                    <h2>
                      Você ainda não
                      possui planejamentos
                    </h2>


                    <p>
                      Crie seu primeiro plano
                      de aula e ele aparecerá aqui.
                    </p>


                    <button
                      type="button"
                      className=
                        "botao-criar-primeiro"
                      onClick={
                        criarNovoPlano
                      }
                    >
                      Criar planejamento
                    </button>

                  </section>

                )

                : (

                  <>

                    {/* =====================================
                        BUSCA
                       ===================================== */}

                    <section
                      className=
                        "planejamentos-ferramentas"
                      aria-label=
                        "Busca, filtros e ordenação dos planejamentos"
                    >

                      <div
                        className=
                          "campo-filtro campo-busca"
                      >

                        <label
                          htmlFor=
                            "busca-planejamentos"
                        >
                          Buscar
                        </label>


                        <div
                          className=
                            "busca-input-wrapper"
                        >

                          <span
                            className=
                              "icone-busca"
                            aria-hidden="true"
                          >
                            ⌕
                          </span>


                          <input
                            id=
                              "busca-planejamentos"
                            type="search"
                            placeholder=
                              "Buscar por título, tema, matéria..."
                            value={
                              busca
                            }
                            onChange={
                              (evento) =>
                                setBusca(
                                  evento.target.value
                                )
                            }
                          />


                          {
                            busca && (

                              <button
                                type="button"
                                className=
                                  "botao-limpar-busca"
                                aria-label=
                                  "Limpar busca"
                                title=
                                  "Limpar busca"
                                onClick={() =>
                                  setBusca('')
                                }
                              >
                                ×
                              </button>

                            )
                          }

                        </div>

                      </div>


                      {/* ===================================
                          FILTROS
                         =================================== */}

                      <div
                        className=
                          "filtros-planejamentos-grid"
                      >

                        <div
                          className=
                            "campo-filtro"
                        >

                          <label
                            htmlFor=
                              "filtro-materia"
                          >
                            Matéria
                          </label>


                          <select
                            id=
                              "filtro-materia"
                            value={
                              filtroMateria
                            }
                            onChange={
                              (evento) =>
                                setFiltroMateria(
                                  evento.target.value
                                )
                            }
                          >

                            <option
                              value="todas"
                            >
                              Todas as matérias
                            </option>


                            {
                              materiasDisponiveis
                                .map(
                                  (materia) => (

                                    <option
                                      key={materia}
                                      value={materia}
                                    >
                                      {materia}
                                    </option>

                                  )
                                )
                            }

                          </select>

                        </div>


                        <div
                          className=
                            "campo-filtro"
                        >

                          <label
                            htmlFor=
                              "filtro-turma"
                          >
                            Turma
                          </label>


                          <select
                            id=
                              "filtro-turma"
                            value={
                              filtroTurma
                            }
                            onChange={
                              (evento) =>
                                setFiltroTurma(
                                  evento.target.value
                                )
                            }
                          >

                            <option
                              value="todas"
                            >
                              Todas as turmas
                            </option>


                            {
                              turmasDisponiveis
                                .map(
                                  (turma) => (

                                    <option
                                      key={turma}
                                      value={turma}
                                    >
                                      {turma}
                                    </option>

                                  )
                                )
                            }

                          </select>

                        </div>


                        <div
                          className=
                            "campo-filtro"
                        >

                          <label
                            htmlFor=
                              "ordenacao-planejamentos"
                          >
                            Ordenar por
                          </label>


                          <select
                            id=
                              "ordenacao-planejamentos"
                            value={
                              ordenacao
                            }
                            onChange={
                              alterarOrdenacao
                            }
                          >

                            <option
                              value="recentes"
                            >
                              Mais recentes
                            </option>

                            <option
                              value="antigos"
                            >
                              Mais antigos
                            </option>

                            <option
                              value="titulo-az"
                            >
                              Título A–Z
                            </option>

                            <option
                              value="titulo-za"
                            >
                              Título Z–A
                            </option>

                          </select>

                        </div>

                      </div>


                      {
                        filtrosAtivos && (

                          <div
                            className=
                              "area-limpar-filtros"
                          >

                            <button
                              type="button"
                              className=
                                "botao-limpar-filtros"
                              onClick={
                                limparFiltros
                              }
                            >
                              × Limpar busca e filtros
                            </button>

                          </div>

                        )
                      }

                    </section>


                    {/* =====================================
                        CONTADOR
                       ===================================== */}

                    <div
                      className=
                        "lista-cabecalho lista-cabecalho-filtros"
                      aria-live="polite"
                    >

                      <span>
                        {
                          textoContador()
                        }
                      </span>


                      {
                        filtrosAtivos && (

                          <span
                            className=
                              "indicador-filtro-ativo"
                          >
                            Filtros ativos
                          </span>

                        )
                      }

                    </div>


                    {/* =====================================
                        RESULTADOS
                       ===================================== */}

                    {
                      planejamentosFiltrados
                        .length === 0

                        ? (

                          <section
                            className=
                              "estado-sem-resultados"
                          >

                            <div
                              className=
                                "estado-sem-resultados-icone"
                              aria-hidden="true"
                            >
                              ⌕
                            </div>


                            <h2>
                              Nenhum planejamento
                              encontrado
                            </h2>


                            <p>
                              Não encontramos
                              planejamentos com
                              os filtros selecionados.
                            </p>


                            <button
                              type="button"
                              className=
                                "botao-limpar-resultados"
                              onClick={
                                limparFiltros
                              }
                            >
                              Limpar filtros
                            </button>

                          </section>

                        )

                        : (

                          <section
                            className=
                              "grade-planejamentos"
                          >

                            {
                              planejamentosFiltrados
                                .map(
                                  (plano) => (

                                    <PlanejamentoCard
                                      key={
                                        plano.id
                                      }
                                      plano={
                                        plano
                                      }
                                      onAbrir={
                                        abrirPlanejamento
                                      }
                                      onDuplicar={
                                        duplicarPlanejamento
                                      }
                                      onExcluir={
                                        solicitarExclusao
                                      }
                                    />

                                  )
                                )
                            }

                          </section>

                        )
                    }

                  </>

                )
            }

          </main>


          {/* =============================================
              EXCLUSÃO
             ============================================= */}

          <ModalConfirmacao
            aberto={
              Boolean(
                planejamentoParaExcluir
              )
            }
            titulo=
              "Excluir planejamento?"
            descricao={
              planejamentoParaExcluir
                ? `Tem certeza de que deseja excluir "${planejamentoParaExcluir.conteudo.titulo}"? Essa ação não poderá ser desfeita.`
                : ''
            }
            textoCancelar=
              "Cancelar"
            textoConfirmar=
              "Excluir planejamento"
            perigo
            onCancelar={
              cancelarExclusao
            }
            onConfirmar={
              confirmarExclusao
            }
          />


          {/* =============================================
              FEEDBACK
             ============================================= */}

          <IonToast
            isOpen={
              Boolean(mensagem)
            }
            message={
              mensagem
            }
            duration={
              1800
            }
            position="top"
            onDidDismiss={() =>
              setMensagem('')
            }
          />

        </div>

      </IonContent>

    </IonPage>

  );

};


export default Planejamentos;