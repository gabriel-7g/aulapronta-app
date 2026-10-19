import React, {
  useCallback,
  useRef,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';

import { gerarPlanoComIa } from '../services/iaService';
import type { DadosPlano } from '../types/planejamento';

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

const obterDadosPlano = (): DadosPlano | null => {
  const valor =
    sessionStorage.getItem('planoEmCriacao');

  if (!valor) return null;

  try {
    const dados =
      JSON.parse(valor) as DadosPlano;

    if (
      !dados.materia ||
      !dados.turma ||
      !dados.duracao ||
      !dados.tema
    ) {
      return null;
    }

    return dados;
  } catch {
    return null;
  }
};

const GerandoPlano: React.FC = () => {
  const router = useIonRouter();

  const [estado, setEstado] =
    useState<EstadoGeracao>('carregando');

  const [etapaAtual, setEtapaAtual] =
    useState(0);

  const [mensagemErro, setMensagemErro] =
    useState('');

  const intervaloRef =
    useRef<number | null>(null);

  const requisicaoRef =
    useRef<AbortController | null>(null);

  const pararAnimacao = useCallback(() => {
    if (intervaloRef.current !== null) {
      window.clearInterval(
        intervaloRef.current
      );

      intervaloRef.current = null;
    }
  }, []);

  const cancelarRequisicao = useCallback(() => {
    requisicaoRef.current?.abort();
    requisicaoRef.current = null;
  }, []);

  const executarGeracao =
    useCallback(async () => {
      pararAnimacao();
      cancelarRequisicao();

      const dados = obterDadosPlano();

      if (!dados) {
        router.push(
          '/home',
          'root',
          'replace'
        );

        return;
      }

      sessionStorage.removeItem(
        'conteudoPlanoGerado'
      );

      setEstado('carregando');
      setEtapaAtual(0);
      setMensagemErro('');

      intervaloRef.current =
        window.setInterval(() => {
          setEtapaAtual((atual) =>
            Math.min(
              atual + 1,
              ETAPAS.length - 1
            )
          );
        }, 800);

      const controller =
        new AbortController();

      requisicaoRef.current =
        controller;

      try {
        const conteudo =
          await gerarPlanoComIa(
            dados,
            controller.signal
          );

        if (controller.signal.aborted) {
          return;
        }

        pararAnimacao();

        sessionStorage.setItem(
          'conteudoPlanoGerado',
          JSON.stringify(conteudo)
        );

        router.push(
          '/plano-gerado',
          'forward'
        );

      } catch (erro) {
        if (controller.signal.aborted) {
          return;
        }

        pararAnimacao();

        console.error(
          'Erro ao gerar planejamento:',
          erro
        );

        setMensagemErro(
          erro instanceof Error
            ? erro.message
            : 'Não foi possível gerar seu planejamento.'
        );

        setEstado('erro');

      } finally {
        if (
          requisicaoRef.current ===
          controller
        ) {
          requisicaoRef.current = null;
        }
      }
    }, [
      cancelarRequisicao,
      pararAnimacao,
      router
    ]);

  useIonViewWillEnter(() => {
    void executarGeracao();
  });

  useIonViewWillLeave(() => {
    pararAnimacao();
    cancelarRequisicao();
  });

  const tentarNovamente = () => {
    void executarGeracao();
  };

  const voltarParaEditar = () => {
    pararAnimacao();
    cancelarRequisicao();

    sessionStorage.removeItem(
      'conteudoPlanoGerado'
    );

    router.push('/home', 'back');
  };

  const cancelarGeracao = () => {
    pararAnimacao();
    cancelarRequisicao();

    sessionStorage.removeItem(
      'planoEmCriacao'
    );

    sessionStorage.removeItem(
      'conteudoPlanoGerado'
    );

    router.push(
      '/planejamentos',
      'root'
    );
  };

  const progresso = Math.min(
    ((etapaAtual + 1) / ETAPAS.length) * 100,
    100
  );

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="conteudo-gerando"
      >
        <div className="pagina-gerando">

          <header className="gerando-topo">
            <div className="marca-gerando">
              <span className="marca-simbolo-gerando" />
              Lousa
            </div>
          </header>

          <main className="gerando-container">

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
                  A Lousa está organizando uma proposta
                  de aula com base nas informações que
                  você enviou.
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
                      {Math.round(progresso)}%
                    </span>
                  </div>

                  <div
                    className="gerando-barra"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={
                      Math.round(progresso)
                    }
                  >
                    <div
                      className="gerando-barra-preenchimento"
                      style={{
                        width: `${progresso}%`
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
                  onClick={cancelarGeracao}
                >
                  Cancelar
                </button>
              </section>
            )}

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
                  Não conseguimos gerar seu planejamento
                </h1>

                <p className="erro-geracao-descricao">
                  {mensagemErro}
                </p>

                <div className="erro-geracao-aviso">
                  <strong>
                    Seus dados foram mantidos.
                  </strong>

                  <span>
                    Você não precisa preencher o
                    formulário novamente.
                  </span>
                </div>

                <div className="erro-geracao-acoes">

                  <button
                    type="button"
                    className="botao-tentar-novamente"
                    onClick={tentarNovamente}
                  >
                    Tentar novamente
                  </button>

                  <button
                    type="button"
                    className="botao-voltar-editar"
                    onClick={voltarParaEditar}
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