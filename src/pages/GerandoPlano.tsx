import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import './GerandoPlano.css';


type EstadoGeracao =
  | 'carregando'
  | 'erro';


const ETAPAS = [
  'Analisando as informações da turma...',
  'Organizando os objetivos da aula...',
  'Preparando o desenvolvimento...',
  'Pensando nas atividades...',
  'Montando a avaliação...',
  'Finalizando seu planejamento...'
];


/*
  TEMPORÁRIO.

  Deixe false para o funcionamento normal.

  Se quiser testar visualmente a tela
  de erro, coloque true.
*/
const SIMULAR_ERRO = false;


const GerandoPlano: React.FC = () => {
  const router = useIonRouter();

  const [estado, setEstado] =
    useState<EstadoGeracao>(
      'carregando'
    );

  const [etapaAtual, setEtapaAtual] =
    useState(0);

  const [tentativas, setTentativas] =
    useState(0);

  const intervaloRef =
    useRef<number | null>(
      null
    );

  const temporizadorRef =
    useRef<number | null>(
      null
    );


  /* =======================================================
     LIMPAR TEMPORIZADORES
     ======================================================= */

  const limparTemporizadores =
    useCallback(() => {

      if (
        intervaloRef.current !== null
      ) {
        window.clearInterval(
          intervaloRef.current
        );

        intervaloRef.current =
          null;
      }

      if (
        temporizadorRef.current !== null
      ) {
        window.clearTimeout(
          temporizadorRef.current
        );

        temporizadorRef.current =
          null;
      }

    }, []);


  /* =======================================================
     EXECUTAR GERAÇÃO
     ======================================================= */

  const executarGeracao =
    useCallback(() => {

      limparTemporizadores();

      const dadosPlano =
        sessionStorage.getItem(
          'planoEmCriacao'
        );


      /*
        Se não houver dados,
        não faz sentido gerar plano.
      */
      if (!dadosPlano) {
        router.push(
          '/home',
          'root'
        );

        return;
      }


      setEstado(
        'carregando'
      );

      setEtapaAtual(
        0
      );


      /*
        Muda as mensagens enquanto
        o plano está sendo preparado.
      */
      intervaloRef.current =
        window.setInterval(() => {

          setEtapaAtual(
            (anterior) => {

              if (
                anterior >=
                ETAPAS.length - 1
              ) {
                return anterior;
              }

              return anterior + 1;
            }
          );

        }, 550);


      /*
        SIMULAÇÃO DA IA.

        Quando tivermos backend,
        este trecho será substituído
        por uma requisição real.
      */
      temporizadorRef.current =
        window.setTimeout(() => {

          limparTemporizadores();


          /*
            Apenas para testar
            visualmente a tela de erro.
          */
          if (SIMULAR_ERRO) {

            setEstado(
              'erro'
            );

            return;
          }


          /*
            SUCESSO
          */
          router.push(
            '/plano-gerado',
            'forward'
          );

        }, 3300);

    }, [
      limparTemporizadores,
      router
    ]);


  /* =======================================================
     INICIAR
     ======================================================= */

  useEffect(() => {

    executarGeracao();

    return () => {
      limparTemporizadores();
    };

  }, [
    executarGeracao,
    limparTemporizadores,
    tentativas
  ]);


  /* =======================================================
     TENTAR NOVAMENTE
     ======================================================= */

  const tentarNovamente = () => {

    setTentativas(
      (anterior) =>
        anterior + 1
    );

  };


  /* =======================================================
     VOLTAR PARA EDITAR
     ======================================================= */

  const voltarParaEditar = () => {

    /*
      NÃO removemos planoEmCriacao.

      Assim a Home consegue recuperar
      os dados que o professor já digitou.
    */
    router.push(
      '/home',
      'back'
    );

  };


  /* =======================================================
     CANCELAR
     ======================================================= */

  const cancelarGeracao = () => {

    limparTemporizadores();

    sessionStorage.removeItem(
      'planoEmCriacao'
    );

    router.push(
      '/planejamentos',
      'root'
    );

  };


  const progresso =
    Math.min(
      (
        (etapaAtual + 1) /
        ETAPAS.length
      ) * 100,
      100
    );


  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-gerando"
      >

        <div className="pagina-gerando">


          {/* LOGO */}

          <header className="gerando-topo">

            <div className="marca-gerando">

              <span className="marca-simbolo-gerando" />

              Lousa

            </div>

          </header>


          <main className="gerando-container">


            {/* =================================================
                CARREGANDO
            ================================================= */}

            {estado === 'carregando' && (

              <section
                className="gerando-cartao"
                aria-live="polite"
                aria-busy="true"
              >

                <span className="gerando-fita" />


                <div
                  className="gerando-ilustracao"
                  aria-hidden="true"
                >

                  <div className="folha-gerando">

                    <span className="linha linha-1" />

                    <span className="linha linha-2" />

                    <span className="linha linha-3" />

                    <span className="linha linha-4" />

                  </div>


                  <div className="lapis-gerando">
                    ✎
                  </div>

                </div>


                <span className="gerando-etiqueta">
                  só um instante
                </span>


                <h1>
                  Preparando sua aula...
                </h1>


                <p className="gerando-descricao">

                  A Lousa está organizando uma
                  proposta de aula com base nas
                  informações que você enviou.

                </p>


                <div className="gerando-status">

                  <div
                    className="gerando-pontos"
                    aria-hidden="true"
                  >

                    <span />

                    <span />

                    <span />

                  </div>


                  <p>
                    {ETAPAS[etapaAtual]}
                  </p>

                </div>


                <div className="gerando-progresso">

                  <div className="gerando-progresso-topo">

                    <span>
                      Montando planejamento
                    </span>

                    <span>
                      {Math.round(
                        progresso
                      )}%
                    </span>

                  </div>


                  <div
                    className="gerando-barra"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={
                      Math.round(
                        progresso
                      )
                    }
                  >

                    <div
                      className="gerando-barra-preenchimento"
                      style={{
                        width:
                          `${progresso}%`
                      }}
                    />

                  </div>

                </div>


                <p className="gerando-aviso">
                  Isso pode levar alguns segundos.
                </p>


                <button
                  type="button"
                  className="botao-cancelar-geracao"
                  onClick={
                    cancelarGeracao
                  }
                >
                  Cancelar
                </button>

              </section>

            )}


            {/* =================================================
                ERRO
            ================================================= */}

            {estado === 'erro' && (

              <section
                className="gerando-cartao cartao-erro-geracao"
                role="alert"
              >

                <span className="gerando-fita fita-erro" />


                <div
                  className="erro-geracao-icone"
                  aria-hidden="true"
                >
                  !
                </div>


                <span className="erro-geracao-etiqueta">
                  algo não saiu como esperado
                </span>


                <h1>
                  Não conseguimos gerar
                  seu planejamento
                </h1>


                <p className="erro-geracao-descricao">

                  Houve um problema enquanto
                  preparávamos sua aula.
                  Seus dados foram mantidos e
                  você pode tentar novamente.

                </p>


                <div className="erro-geracao-aviso">

                  <strong>
                    Seus dados estão seguros.
                  </strong>

                  <span>
                    Você não precisa preencher
                    o formulário novamente.
                  </span>

                </div>


                <div className="erro-geracao-acoes">

                  <button
                    type="button"
                    className="botao-tentar-novamente"
                    onClick={
                      tentarNovamente
                    }
                  >
                    Tentar novamente
                  </button>


                  <button
                    type="button"
                    className="botao-voltar-editar"
                    onClick={
                      voltarParaEditar
                    }
                  >
                    ← Voltar para editar
                  </button>

                </div>

              </section>

            )}

          </main>

        </div>

      </IonContent>

    </IonPage>
  );
};


export default GerandoPlano;