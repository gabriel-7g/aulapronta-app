import React, { useState } from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  obterUsuarioLogado
} from '../utils/auth';

import {
  limparContextoPlano,
  obterContextoPlano
} from '../utils/planoSessao';

import {
  salvarPlanejamento
} from '../services/planejamentoService';

import {
  ConteudoPlano,
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

import './PlanoGerado.css';


/* =========================================================
   FUNÇÕES AUXILIARES
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


const criarConteudoInicial = (
  dados: DadosPlano
): ConteudoPlano => {
  return {
    titulo:
      dados.tema,

    objetivo:
      `Compreender os principais conceitos relacionados ao tema "${dados.tema}" e aplicá-los em situações práticas.`,

    introducao:
      'Inicie a aula retomando conhecimentos prévios da turma por meio de perguntas rápidas. Apresente o assunto de maneira contextualizada e explique o que será trabalhado durante a aula.',

    desenvolvimento:
      'Apresente os conceitos principais de forma progressiva, utilizando exemplos claros e situações próximas da realidade dos alunos. Durante a explicação, estimule a participação da turma com perguntas e pequenos desafios.',

    atividade:
      'Proponha uma atividade prática em que os alunos possam aplicar os conceitos apresentados. A atividade poderá ser realizada individualmente ou em pequenos grupos.',

    recursos:
      'Quadro, material didático, atividades impressas e recursos digitais, quando disponíveis.',

    avaliacao:
      'A avaliação será realizada de maneira contínua, considerando a participação dos alunos, a realização da atividade proposta e a compreensão demonstrada durante a aula.'
  };
};


/* =========================================================
   PÁGINA
   ========================================================= */

const PlanoGerado: React.FC = () => {
  const router = useIonRouter();
  const usuario = obterUsuarioLogado();


  /*
    O contexto é lido apenas uma vez.

    Isso é importante porque, depois de salvarmos,
    os dados temporários são removidos da sessão.
  */

  const [contexto] = useState(() =>
    obterContextoPlano(usuario?.id)
  );


  const [conteudo, setConteudo] =
    useState<ConteudoPlano | null>(() => {
      if (!contexto) {
        return null;
      }

      return (
        contexto.planoSelecionado?.conteudo ??
        criarConteudoInicial(contexto.dados)
      );
    });


  const [editando, setEditando] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [mensagemSucesso, setMensagemSucesso] =
    useState('');

  const [mensagemErro, setMensagemErro] =
    useState('');


  /* =======================================================
     CONTEXTO INVÁLIDO
     ======================================================= */

  if (!usuario) {
    return (
      <IonPage>
        <IonContent fullscreen>

          <div className="pagina-plano-gerado">

            <main className="plano-container">

              <section className="folha-plano">

                <span className="fita-plano" />

                <div className="plano-cabecalho">

                  <span className="plano-etiqueta">
                    acesso inválido
                  </span>

                  <h1>
                    Sessão não encontrada
                  </h1>

                  <p>
                    Faça login novamente para acessar seus planejamentos.
                  </p>

                  <div className="acoes-plano">

                    <button
                      type="button"
                      className="botao-salvar botao-salvar-grande"
                      onClick={() =>
                        router.push(
                          '/login',
                          'root'
                        )
                      }
                    >
                      Ir para o login
                    </button>

                  </div>

                </div>

              </section>

            </main>

          </div>

        </IonContent>
      </IonPage>
    );
  }


  if (!contexto || !conteudo) {
    return (
      <IonPage>
        <IonContent fullscreen>

          <div className="pagina-plano-gerado">

            <header className="plano-topo">

              <div className="topo-espaco" />

              <div className="marca-plano">
                <span className="marca-simbolo-plano" />
                Lousa
              </div>

              <div className="topo-espaco" />

            </header>


            <main className="plano-container">

              <section className="folha-plano">

                <span className="fita-plano" />

                <div className="plano-cabecalho">

                  <span className="plano-etiqueta">
                    dados inválidos
                  </span>

                  <h1>
                    Planejamento indisponível
                  </h1>

                  <p>
                    Não encontramos dados válidos para exibir este
                    planejamento. Ele pode ter sido removido ou o
                    endereço foi acessado diretamente.
                  </p>


                  <div className="acoes-plano">

                    <button
                      type="button"
                      className="botao-salvar botao-salvar-grande"
                      onClick={() =>
                        router.push(
                          '/planejamentos',
                          'root'
                        )
                      }
                    >
                      Voltar para meus planejamentos
                    </button>

                  </div>

                </div>

              </section>

            </main>

          </div>

        </IonContent>
      </IonPage>
    );
  }


  const {
    dados,
    planoSelecionado
  } = contexto;


  /* =======================================================
     EDIÇÃO
     ======================================================= */

  const atualizarCampo = (
    campo: keyof ConteudoPlano,
    valor: string
  ) => {
    setConteudo((anterior) => {
      if (!anterior) {
        return anterior;
      }

      return {
        ...anterior,
        [campo]: valor
      };
    });
  };


  const editarPlano = () => {
    setMensagemSucesso('');
    setMensagemErro('');
    setEditando(true);
  };


  /* =======================================================
     SALVAR
     ======================================================= */

  const salvarPlano = () => {
    if (salvando) {
      return;
    }

    setSalvando(true);
    setMensagemErro('');
    setMensagemSucesso('');


    const eraEdicao =
      Boolean(
        planoSelecionado
      );

    const agora =
      new Date().toISOString();


    const planejamento:
      PlanejamentoSalvo = {
      id:
        planoSelecionado?.id ??
        gerarId(),

      usuarioId:
        usuario.id,

      criadoEm:
        planoSelecionado?.criadoEm ??
        agora,

      atualizadoEm:
        agora,

      dados,

      conteudo
    };


    try {
      salvarPlanejamento(
        planejamento
      );

      setEditando(false);

      setMensagemSucesso(
        eraEdicao
          ? 'Alterações salvas com sucesso.'
          : 'Planejamento salvo com sucesso.'
      );


      /*
        Agora que o plano foi realmente salvo,
        podemos limpar os dados temporários.
      */

      limparContextoPlano();


      /*
        Dá tempo de o usuário visualizar
        a mensagem antes do redirecionamento.
      */

      window.setTimeout(() => {
        router.push(
          '/planejamentos',
          'root'
        );
      }, 1200);

    } catch (erro) {
      console.error(
        'Erro ao salvar planejamento:',
        erro
      );

      setSalvando(false);

      setMensagemErro(
        'Não foi possível salvar o planejamento. Tente novamente.'
      );
    }
  };


  /* =======================================================
     INTERFACE
     ======================================================= */

  return (
    <IonPage>

      <IonContent fullscreen>

        <div className="pagina-plano-gerado">

          {/* =============================================
              TOPO
             ============================================= */}

          <header className="plano-topo">

            <button
              type="button"
              className="botao-voltar"
              disabled={salvando}
              onClick={() =>
                router.goBack()
              }
            >
              ← Voltar
            </button>


            <div className="marca-plano">
              <span className="marca-simbolo-plano" />
              Lousa
            </div>


            <div className="topo-espaco" />

          </header>


          <main className="plano-container">

            {/* ===========================================
                TÍTULO
               =========================================== */}

            <section className="plano-cabecalho">

              <span className="plano-etiqueta">
                plano de aula
              </span>


              {editando ? (

                <input
                  className="titulo-edicao"
                  value={conteudo.titulo}
                  aria-label="Título do planejamento"
                  onChange={(evento) =>
                    atualizarCampo(
                      'titulo',
                      evento.target.value
                    )
                  }
                />

              ) : (

                <h1>
                  {conteudo.titulo}
                </h1>

              )}


              <p>
                Seu planejamento está pronto.
                Você pode revisar, editar e salvar antes de utilizá-lo.
              </p>

            </section>


            {/* ===========================================
                RESUMO
               =========================================== */}

            <section className="resumo-aula">

              <div>
                <span className="resumo-rotulo">
                  Matéria
                </span>

                <strong>
                  {dados.materia}
                </strong>
              </div>


              <div>
                <span className="resumo-rotulo">
                  Turma
                </span>

                <strong>
                  {dados.turma}
                </strong>
              </div>


              <div>
                <span className="resumo-rotulo">
                  Duração
                </span>

                <strong>
                  {dados.duracao
                    ? `${dados.duracao} min`
                    : 'Não informada'}
                </strong>
              </div>

            </section>


            {/* ===========================================
                CONTEÚDO
               =========================================== */}

            <section className="folha-plano">

              <span className="fita-plano" />


              <BlocoPlano
                numero="01"
                titulo="Objetivo da aula"
                campo="objetivo"
                valor={conteudo.objetivo}
                editando={editando}
                atualizar={atualizarCampo}
              />


              <BlocoPlano
                numero="02"
                titulo="Introdução"
                campo="introducao"
                valor={conteudo.introducao}
                editando={editando}
                atualizar={atualizarCampo}
              />


              <BlocoPlano
                numero="03"
                titulo="Desenvolvimento"
                campo="desenvolvimento"
                valor={conteudo.desenvolvimento}
                editando={editando}
                atualizar={atualizarCampo}
              />


              <BlocoPlano
                numero="04"
                titulo="Atividade"
                campo="atividade"
                valor={conteudo.atividade}
                editando={editando}
                atualizar={atualizarCampo}
              />


              <BlocoPlano
                numero="05"
                titulo="Recursos"
                campo="recursos"
                valor={conteudo.recursos}
                editando={editando}
                atualizar={atualizarCampo}
              />


              <BlocoPlano
                numero="06"
                titulo="Avaliação"
                campo="avaliacao"
                valor={conteudo.avaliacao}
                editando={editando}
                atualizar={atualizarCampo}
              />

            </section>


            {/* ===========================================
                OBSERVAÇÕES
               =========================================== */}

            {dados.observacoes && (

              <section className="observacao-professor">

                <span>
                  Observação informada pelo professor
                </span>

                <p>
                  {dados.observacoes}
                </p>

              </section>

            )}


            {/* ===========================================
                FEEDBACK
               =========================================== */}

            {mensagemSucesso && (

              <div
                className="mensagem-sucesso"
                role="status"
                aria-live="polite"
              >

                <span aria-hidden="true">
                  ✓
                </span>

                <div>

                  <strong>
                    {mensagemSucesso}
                  </strong>

                  <p>
                    Redirecionando para seus planejamentos...
                  </p>

                </div>

              </div>

            )}


            {mensagemErro && (

              <div
                role="alert"
                aria-live="assertive"
              >
                {mensagemErro}
              </div>

            )}


            {/* ===========================================
                BOTÕES
               =========================================== */}

            <div className="acoes-plano">

              {!editando ? (

                <>

                  <button
                    type="button"
                    className="botao-editar"
                    disabled={salvando}
                    onClick={editarPlano}
                  >
                    <span aria-hidden="true">
                      ✎
                    </span>

                    Editar planejamento
                  </button>


                  <button
                    type="button"
                    className="botao-salvar"
                    disabled={salvando}
                    aria-busy={salvando}
                    onClick={salvarPlano}
                  >
                    <span aria-hidden="true">
                      ✓
                    </span>

                    {salvando
                      ? 'Salvando...'
                      : 'Salvar planejamento'}
                  </button>

                </>

              ) : (

                <button
                  type="button"
                  className="botao-salvar botao-salvar-grande"
                  disabled={salvando}
                  aria-busy={salvando}
                  onClick={salvarPlano}
                >
                  <span aria-hidden="true">
                    ✓
                  </span>

                  {salvando
                    ? 'Salvando...'
                    : 'Salvar alterações'}
                </button>

              )}

            </div>

          </main>

        </div>

      </IonContent>

    </IonPage>
  );
};


/* =========================================================
   BLOCO DE CONTEÚDO
   ========================================================= */

interface BlocoPlanoProps {
  numero: string;
  titulo: string;
  campo: keyof ConteudoPlano;
  valor: string;
  editando: boolean;

  atualizar: (
    campo: keyof ConteudoPlano,
    valor: string
  ) => void;
}


const BlocoPlano:
React.FC<BlocoPlanoProps> = ({numero,titulo,campo,valor,editando,atualizar}) => {
  return (
    <article className="bloco-plano">

      <div className="bloco-cabecalho">

        <span className="bloco-numero">
          {numero}
        </span>

        <h2>
          {titulo}
        </h2>
      </div>
      {editando ? (

        <textarea
          className="campo-edicao-plano"
          aria-label={titulo}
          value={valor}
          onChange={(evento) =>
            atualizar(campo,evento.target.value)
          }
        />

      ) : (
        <p>
          {valor}
        </p>
      )}

    </article>
  );
};


export default PlanoGerado;