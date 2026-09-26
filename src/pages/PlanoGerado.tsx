import React, { useState } from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import './PlanoGerado.css';

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

interface PlanejamentoSalvo {
  id: string;

  criadoEm: string;

  atualizadoEm: string;

  dados: DadosPlano;

  conteudo: ConteudoPlano;
}

const PlanoGerado: React.FC = () => {
  const router = useIonRouter();

  /*
    Verifica se estamos abrindo um planejamento
    que já foi salvo anteriormente.
  */
  const planoSelecionadoString =
    sessionStorage.getItem(
      'planoSelecionado'
    );

  let planoSelecionado:
    PlanejamentoSalvo | null = null;

  if (planoSelecionadoString) {
    try {
      planoSelecionado =
        JSON.parse(
          planoSelecionadoString
        );
    } catch {
      planoSelecionado = null;
    }
  }

  /*
    Dados vindos do formulário da HOME.
  */
  const dadosSalvos =
    sessionStorage.getItem(
      'planoEmCriacao'
    );

  let dadosFormulario:
    DadosPlano | null = null;

  if (dadosSalvos) {
    try {
      dadosFormulario =
        JSON.parse(dadosSalvos);
    } catch {
      dadosFormulario = null;
    }
  }

  /*
    Se abriu um planejamento salvo,
    usamos os dados dele.

    Caso contrário, usamos o formulário.
  */
  const dados: DadosPlano =
    planoSelecionado?.dados ||
    dadosFormulario || {
      materia: 'Português',
      materiaId: 'portugues',
      turma: '6º ano',
      duracao: '50',
      tema: 'Plano de aula',
      observacoes: ''
    };

  /*
    MOCK DO CONTEÚDO.

    Depois isso será substituído pela
    resposta da IA.
  */
  const conteudoInicial:
    ConteudoPlano =
    planoSelecionado?.conteudo || {
      titulo:
        dados.tema ||
        'Plano de aula',

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

  const [
    conteudo,
    setConteudo
  ] =
    useState<ConteudoPlano>(
      conteudoInicial
    );

  const [
    editando,
    setEditando
  ] =
    useState(false);

  const atualizarCampo = (
    campo: keyof ConteudoPlano,
    valor: string
  ) => {
    setConteudo(
      (anterior) => ({
        ...anterior,

        [campo]: valor
      })
    );
  };

  const editarPlano = () => {
    setEditando(true);
  };

  const gerarId = () => {
    if (
      typeof crypto !== 'undefined' &&
      crypto.randomUUID
    ) {
      return crypto.randomUUID();
    }

    return Date.now().toString();
  };

  const salvarPlano = () => {
    /*
      Busca planejamentos existentes.
    */
    const salvosString =
      localStorage.getItem(
        'planejamentosSalvos'
      );

    let planejamentos:
      PlanejamentoSalvo[] = [];

    if (salvosString) {
      try {
        planejamentos =
          JSON.parse(
            salvosString
          );
      } catch {
        planejamentos = [];
      }
    }

    const agora =
      new Date().toISOString();

    /*
      Se abriu um plano já salvo,
      mantém o ID.

      Caso contrário,
      cria um novo ID.
    */
    const planejamento:
      PlanejamentoSalvo = {
      id:
        planoSelecionado?.id ||
        gerarId(),

      criadoEm:
        planoSelecionado?.criadoEm ||
        agora,

      atualizadoEm: agora,

      dados,

      conteudo
    };

    /*
      Verifica se esse plano
      já existe.
    */
    const indice =
      planejamentos.findIndex(
        (plano) =>
          plano.id ===
          planejamento.id
      );

    if (indice >= 0) {
      /*
        Atualização de plano existente
      */
      planejamentos[indice] =
        planejamento;
    } else {
      /*
        Novo planejamento
      */
      planejamentos.push(
        planejamento
      );
    }

    /*
      Salva todos os planos.
    */
    localStorage.setItem(
      'planejamentosSalvos',
      JSON.stringify(
        planejamentos
      )
    );

    /*
      Limpa os temporários.
    */
    sessionStorage.removeItem(
      'planoSelecionado'
    );

    sessionStorage.removeItem(
      'planoEmCriacao'
    );

    /*
      Depois de salvar,
      vai para a página
      dos planejamentos.
    */
    router.push(
      '/planejamentos',
      'forward'
    );
  };

  return (
    <IonPage>

      <IonContent fullscreen>

        <div className="pagina-plano-gerado">

          <header className="plano-topo">

            <button
              type="button"
              className="botao-voltar"
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

            <section className="plano-cabecalho">

              <span className="plano-etiqueta">
                plano de aula
              </span>

              {editando ? (

                <input
                  className="titulo-edicao"
                  value={
                    conteudo.titulo
                  }
                  onChange={(e) =>
                    atualizarCampo(
                      'titulo',
                      e.target.value
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
                Você pode revisar, editar e
                salvar antes de utilizá-lo.
              </p>

            </section>

            {/* RESUMO */}

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

            {/* CONTEÚDO */}

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
                valor={
                  conteudo.desenvolvimento
                }
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

            {/* BOTÕES */}

            <div className="acoes-plano">

              {!editando ? (

                <>

                  <button
                    type="button"
                    className="botao-editar"
                    onClick={
                      editarPlano
                    }
                  >
                    <span>
                      ✎
                    </span>

                    Editar planejamento
                  </button>

                  <button
                    type="button"
                    className="botao-salvar"
                    onClick={
                      salvarPlano
                    }
                  >
                    <span>
                      ✓
                    </span>

                    Salvar planejamento
                  </button>

                </>

              ) : (

                <button
                  type="button"
                  className="botao-salvar botao-salvar-grande"
                  onClick={
                    salvarPlano
                  }
                >
                  <span>
                    ✓
                  </span>

                  Salvar alterações
                </button>

              )}

            </div>

          </main>

        </div>

      </IonContent>

    </IonPage>
  );
};

interface BlocoPlanoProps {
  numero: string;

  titulo: string;

  campo:
    keyof ConteudoPlano;

  valor: string;

  editando: boolean;

  atualizar: (
    campo:
      keyof ConteudoPlano,

    valor: string
  ) => void;
}

const BlocoPlano:
React.FC<BlocoPlanoProps> = ({
  numero,
  titulo,
  campo,
  valor,
  editando,
  atualizar
}) => {
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
          value={valor}
          onChange={(e) =>
            atualizar(
              campo,
              e.target.value
            )
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