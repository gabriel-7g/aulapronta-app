import React, { useEffect, useState } from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import './Planejamentos.css';

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

const Planejamentos: React.FC = () => {
  const router = useIonRouter();

  const [planejamentos, setPlanejamentos] =
    useState<PlanejamentoSalvo[]>([]);

  useEffect(() => {
    carregarPlanejamentos();
  }, []);

  const carregarPlanejamentos = () => {
    const salvos = localStorage.getItem(
      'planejamentosSalvos'
    );

    if (!salvos) {
      setPlanejamentos([]);
      return;
    }

    try {
      const lista: PlanejamentoSalvo[] =
        JSON.parse(salvos);

      /*
        Mais recentes primeiro
      */
      lista.sort(
        (a, b) =>
          new Date(b.atualizadoEm).getTime() -
          new Date(a.atualizadoEm).getTime()
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

  const abrirPlanejamento = (
    planejamento: PlanejamentoSalvo
  ) => {
    /*
      Colocamos o planejamento escolhido temporariamente
      no sessionStorage.

      O PlanoGerado.tsx vai identificar esse plano
      e abrir o conteúdo salvo.
    */
    sessionStorage.setItem(
      'planoSelecionado',
      JSON.stringify(planejamento)
    );

    router.push(
      '/plano-gerado',
      'forward'
    );
  };

  const excluirPlanejamento = (
    id: string
  ) => {
    const confirmar = window.confirm(
      'Deseja realmente excluir este planejamento?'
    );

    if (!confirmar) return;

    const novaLista = planejamentos.filter(
      (plano) => plano.id !== id
    );

    localStorage.setItem(
      'planejamentosSalvos',
      JSON.stringify(novaLista)
    );

    setPlanejamentos(novaLista);
  };

  const criarNovoPlano = () => {
    sessionStorage.removeItem(
      'planoSelecionado'
    );

    sessionStorage.removeItem(
      'planoEmCriacao'
    );

    router.push(
      '/home',
      'back'
    );
  };

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

  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-planejamentos"
      >

        <div className="pagina-planejamentos">

          {/* CABEÇALHO */}
          <header className="planejamentos-topo">

            <button
              type="button"
              className="planejamentos-voltar"
              onClick={() =>
                router.push(
                  '/home',
                  'back'
                )
              }
            >
              ← Início
            </button>

            <div className="marca-planejamentos">

              <span className="marca-simbolo-planejamentos" />

              Lousa

            </div>

            <button
              type="button"
              className="botao-novo-topo"
              onClick={criarNovoPlano}
            >
              + Novo plano
            </button>

          </header>

          <main className="planejamentos-container">

            {/* TÍTULO */}
            <section className="planejamentos-cabecalho">

              <span className="planejamentos-etiqueta">
                sua estante
              </span>

              <h1>
                Meus planejamentos
              </h1>

              <p>
                Seus planos de aula salvos ficam
                organizados aqui.
              </p>

            </section>

            {/* ESTADO VAZIO */}
            {planejamentos.length === 0 ? (

              <section className="estado-vazio">

                <div className="estado-vazio-icone">
                  ✎
                </div>

                <h2>
                  Você ainda não possui planejamentos
                </h2>

                <p>
                  Crie seu primeiro plano de aula e
                  ele aparecerá aqui.
                </p>

                <button
                  type="button"
                  className="botao-criar-primeiro"
                  onClick={criarNovoPlano}
                >
                  Criar planejamento
                </button>

              </section>

            ) : (

              <>
                {/* INFORMAÇÃO DA LISTA */}
                <div className="lista-cabecalho">

                  <span>
                    {planejamentos.length === 1
                      ? '1 planejamento salvo'
                      : `${planejamentos.length} planejamentos salvos`}
                  </span>

                </div>

                {/* CARDS */}
                <section className="grade-planejamentos">

                  {planejamentos.map(
                    (planejamento) => (

                      <article
                        key={planejamento.id}
                        className="planejamento-card"
                      >

                        <span className="planejamento-fita" />

                        <div className="planejamento-card-topo">

                          <span className="planejamento-materia">
                            {planejamento.dados.materia}
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

                        <h2>
                          {planejamento.conteudo.titulo}
                        </h2>

                        <div className="planejamento-tags">

                          <span>
                            {planejamento.dados.turma}
                          </span>

                          {planejamento.dados.duracao && (
                            <span>
                              {
                                planejamento.dados
                                  .duracao
                              }{' '}
                              min
                            </span>
                          )}

                        </div>

                        <p className="planejamento-resumo">
                          {
                            planejamento.conteudo
                              .objetivo
                          }
                        </p>

                        <div className="planejamento-rodape">

                          <span className="planejamento-data">
                            Atualizado em{' '}
                            {formatarData(
                              planejamento.atualizadoEm
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