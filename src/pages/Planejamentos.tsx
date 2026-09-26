import React, {
  useEffect,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  obterUsuarioLogado,
  sair
} from '../utils/auth';

import './Planejamentos.css';


/* =========================================================
   TIPOS
   ========================================================= */

interface DadosPlano {
  materia: string;
  materiaId: string | null;
  turma: string;
  duracao: string;
  tema: string;
  observacoes: string;
}

interface ConteudoPlano {
  titulo: string;
  objetivo: string;
  introducao: string;
  desenvolvimento: string;
  atividade: string;
  recursos: string;
  avaliacao: string;
}

export interface PlanejamentoSalvo {
  id: string;

  criadoEm: string;

  atualizadoEm: string;

  dados: DadosPlano;

  conteudo: ConteudoPlano;
}


/* =========================================================
   COMPONENTE
   ========================================================= */

const Planejamentos: React.FC = () => {
  const router = useIonRouter();

  const usuario =
    obterUsuarioLogado();

  const [
    planejamentos,
    setPlanejamentos
  ] =
    useState<PlanejamentoSalvo[]>([]);


  /* =======================================================
     CARREGAR PLANEJAMENTOS
     ======================================================= */

  useEffect(() => {
    carregarPlanejamentos();
  }, []);


  const carregarPlanejamentos = () => {
    const salvos =
      localStorage.getItem(
        'planejamentosSalvos'
      );

    if (!salvos) {
      setPlanejamentos([]);

      return;
    }

    try {
      const lista:
        PlanejamentoSalvo[] =
        JSON.parse(salvos);

      /*
        Mais recentes aparecem primeiro.
      */
      lista.sort(
        (a, b) =>
          new Date(
            b.atualizadoEm
          ).getTime() -
          new Date(
            a.atualizadoEm
          ).getTime()
      );

      setPlanejamentos(lista);

    } catch (erro) {

      console.error(
        'Erro ao carregar planejamentos:',
        erro
      );

      setPlanejamentos([]);
    }
  };


  /* =======================================================
     ABRIR PLANEJAMENTO
     ======================================================= */

  const abrirPlanejamento = (
    planejamento:
      PlanejamentoSalvo
  ) => {

    sessionStorage.setItem(
      'planoSelecionado',
      JSON.stringify(
        planejamento
      )
    );

    router.push(
      '/plano-gerado',
      'forward'
    );
  };


  /* =======================================================
     EXCLUIR
     ======================================================= */

  const excluirPlanejamento = (
    id: string
  ) => {

    const confirmar =
      window.confirm(
        'Deseja realmente excluir este planejamento?'
      );

    if (!confirmar) {
      return;
    }

    const novaLista =
      planejamentos.filter(
        (plano) =>
          plano.id !== id
      );

    localStorage.setItem(
      'planejamentosSalvos',
      JSON.stringify(
        novaLista
      )
    );

    setPlanejamentos(
      novaLista
    );
  };


  /* =======================================================
     NOVO PLANO
     ======================================================= */

  const criarNovoPlano = () => {

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

  const fazerLogout = () => {

    /*
      Remove a sessão.
    */
    sair();

    /*
      Volta para login.

      "root" evita manter a tela
      atual na pilha normal do Ionic.
    */
    router.push(
      '/login',
      'root'
    );
  };


  /* =======================================================
     FORMATAR DATA
     ======================================================= */

  const formatarData = (
    data: string
  ) => {

    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',

        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(
      new Date(data)
    );
  };


  /* =======================================================
     INTERFACE
     ======================================================= */

  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-planejamentos"
      >

        <div className="pagina-planejamentos">


          {/* ===============================================
              CABEÇALHO
          =============================================== */}

          <header className="planejamentos-topo">


            {/* USUÁRIO */}

            <div className="planejamentos-usuario">

              <div className="usuario-avatar">

                {usuario?.nome
                  ? usuario.nome
                      .charAt(0)
                      .toUpperCase()
                  : 'U'}

              </div>


              <div className="usuario-informacoes">

                <span className="usuario-nome">

                  {usuario?.nome ||
                    'Usuário'}

                </span>

                <span className="usuario-email">

                  {usuario?.email || ''}

                </span>

              </div>

            </div>


            {/* LOGO */}

            <div className="marca-planejamentos">

              <span className="marca-simbolo-planejamentos" />

              Lousa

            </div>


            {/* AÇÕES */}

            <div className="acoes-topo-planejamentos">

              <button
                type="button"
                className="botao-novo-topo"
                onClick={
                  criarNovoPlano
                }
              >
                + Novo plano
              </button>


              <button
                type="button"
                className="botao-sair"
                onClick={
                  fazerLogout
                }
              >
                Sair
              </button>

            </div>

          </header>


          {/* ===============================================
              CONTEÚDO
          =============================================== */}

          <main className="planejamentos-container">


            {/* CABEÇALHO DA PÁGINA */}

            <section className="planejamentos-cabecalho">

              <span className="planejamentos-etiqueta">
                sua estante
              </span>

              <h1>
                Meus planejamentos
              </h1>

              <p>
                Seus planos de aula salvos
                ficam organizados aqui.
              </p>

            </section>


            {/* =============================================
                ESTADO VAZIO
            ============================================= */}

            {planejamentos.length === 0 ? (

              <section className="estado-vazio">

                <div className="estado-vazio-icone">
                  ✎
                </div>

                <h2>
                  Você ainda não possui
                  planejamentos
                </h2>

                <p>
                  Crie seu primeiro plano de
                  aula e ele aparecerá aqui.
                </p>

                <button
                  type="button"
                  className="botao-criar-primeiro"
                  onClick={
                    criarNovoPlano
                  }
                >
                  Criar planejamento
                </button>

              </section>

            ) : (

              <>

                {/* QUANTIDADE */}

                <div className="lista-cabecalho">

                  <span>

                    {planejamentos.length === 1
                      ? '1 planejamento salvo'
                      : `${planejamentos.length} planejamentos salvos`}

                  </span>

                </div>


                {/* =========================================
                    CARDS
                ========================================= */}

                <section className="grade-planejamentos">

                  {planejamentos.map(
                    (planejamento) => (

                      <article
                        key={
                          planejamento.id
                        }
                        className="planejamento-card"
                      >

                        <span className="planejamento-fita" />


                        {/* TOPO CARD */}

                        <div className="planejamento-card-topo">

                          <span className="planejamento-materia">

                            {
                              planejamento
                                .dados
                                .materia
                            }

                          </span>


                          <button
                            type="button"
                            className="botao-excluir"
                            onClick={() =>
                              excluirPlanejamento(
                                planejamento.id
                              )
                            }
                            aria-label="Excluir planejamento"
                            title="Excluir planejamento"
                          >
                            ×
                          </button>

                        </div>


                        {/* TÍTULO */}

                        <h2>

                          {
                            planejamento
                              .conteudo
                              .titulo
                          }

                        </h2>


                        {/* TAGS */}

                        <div className="planejamento-tags">

                          <span>

                            {
                              planejamento
                                .dados
                                .turma
                            }

                          </span>


                          {planejamento
                            .dados
                            .duracao && (

                            <span>

                              {
                                planejamento
                                  .dados
                                  .duracao
                              }{' '}
                              min

                            </span>

                          )}

                        </div>


                        {/* OBJETIVO */}

                        <p className="planejamento-resumo">

                          {
                            planejamento
                              .conteudo
                              .objetivo
                          }

                        </p>


                        {/* RODAPÉ */}

                        <div className="planejamento-rodape">

                          <span className="planejamento-data">

                            Atualizado em{' '}

                            {formatarData(
                              planejamento
                                .atualizadoEm
                            )}

                          </span>


                          <button
                            type="button"
                            className="botao-abrir-plano"
                            onClick={() =>
                              abrirPlanejamento(
                                planejamento
                              )
                            }
                          >
                            Ver planejamento →
                          </button>

                        </div>

                      </article>

                    )
                  )}

                </section>

              </>

            )}

          </main>

        </div>

      </IonContent>

    </IonPage>
  );
};

export default Planejamentos;