import React, {
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import './Home.css';


interface Materia {
  id: string;
  nome: string;
}


const MATERIAS: Materia[] = [
  {
    id: 'portugues',
    nome: 'Português'
  },

  {
    id: 'matematica',
    nome: 'Matemática'
  },

  {
    id: 'ciencias',
    nome: 'Ciências'
  },

  {
    id: 'historia',
    nome: 'História'
  },

  {
    id: 'geografia',
    nome: 'Geografia'
  },

  {
    id: 'ingles',
    nome: 'Inglês'
  },

  {
    id: 'artes',
    nome: 'Artes'
  },

  {
    id: 'educacao-fisica',
    nome: 'Educação Física'
  }
];


const Home: React.FC = () => {
  const router =
    useIonRouter();


  const [
    materiaSelecionada,
    setMateriaSelecionada
  ] =
    useState<string | null>(
      null
    );


  const [
    turma,
    setTurma
  ] =
    useState('');


  const [
    duracao,
    setDuracao
  ] =
    useState('');


  const [
    tema,
    setTema
  ] =
    useState('');


  const [
    observacoes,
    setObservacoes
  ] =
    useState('');


  const materiaAtual =
    MATERIAS.find(
      (materia) =>
        materia.id ===
        materiaSelecionada
    );


  const podeGerar =
    Boolean(
      materiaSelecionada &&
      turma &&
      duracao &&
      tema.trim()
    );


  /* =======================================================
     GERAR PLANO
     ======================================================= */

  const gerarPlano = () => {

    if (!podeGerar) {
      return;
    }


    const dadosPlano = {

      materia:
        materiaAtual?.nome ||
        '',

      materiaId:
        materiaSelecionada,

      turma,

      duracao,

      tema,

      observacoes

    };


    /*
      TEMPORÁRIO.

      Depois esses dados serão enviados
      para o backend/IA.
    */
    sessionStorage.setItem(
      'planoEmCriacao',
      JSON.stringify(
        dadosPlano
      )
    );


    /*
      AGORA NÃO VAMOS DIRETAMENTE
      PARA O PLANO.

      Primeiro mostramos o carregamento.
    */
    router.push(
      '/gerando-plano',
      'forward'
    );

  };


  /* =======================================================
     MEUS PLANEJAMENTOS
     ======================================================= */

  const abrirPlanejamentos = () => {

    router.push(
      '/planejamentos',
      'forward'
    );

  };


  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-lousa"
      >

        <div className="pagina-criar-plano">


          {/* ===============================================
              CABEÇALHO
          =============================================== */}

          <header className="cabecalho">

            <div className="cabecalho-espaco" />


            <div className="marca">

              <span className="marca-simbolo" />

              Lousa

            </div>


            <button
              type="button"
              className="botao-meus-planejamentos"
              onClick={
                abrirPlanejamentos
              }
            >
              Meus planejamentos
            </button>

          </header>


          {/* ===============================================
              CONTEÚDO PRINCIPAL
          =============================================== */}

          <div className="layout-principal">


            {/* FORMULÁRIO */}

            <section className="secao-formulario">


              <div className="formulario-cabecalho">

                <h1 className="formulario-titulo">

                  Vamos montar sua{' '}

                  <span className="destaque">

                    próxima aula

                    <svg
                      className="sublinhado-giz"
                      viewBox="0 0 220 20"
                      preserveAspectRatio="none"
                    >

                      <path
                        d="M4 14 C 60 4, 160 4, 216 12"
                      />

                    </svg>

                  </span>

                  .

                </h1>


                <p className="formulario-descricao">

                  Escolha a matéria, conte o
                  contexto da turma e a Lousa
                  monta uma proposta completa.

                </p>

              </div>
              {/* MATÉRIA */}
              <div className="campo-grupo">
                <span className="campo-rotulo">
                  Matéria
                </span>

                <div className="grade-materias">

                  {MATERIAS.map(
                    (materia) => (

                      <button
                        key={
                          materia.id
                        }
                        type="button"
                        className={
                          `materia-cartao ${
                            materiaSelecionada ===
                            materia.id
                              ? 'selecionada'
                              : ''
                          }`
                        }
                        onClick={() =>
                          setMateriaSelecionada(
                            materia.id
                          )
                        }
                      >

                        <span className="materia-nome">

                          {
                            materia.nome
                          }

                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* TURMA + DURAÇÃO */}

              <div className="campo-linha">

                <div className="campo-grupo">

                  <label
                    className="campo-rotulo"
                    htmlFor="turma"
                  >
                    Turma / ano
                  </label>


                  <select
                    id="turma"
                    className="campo-select"
                    value={
                      turma
                    }
                    onChange={(e) =>
                      setTurma(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Selecione
                    </option>


                    <optgroup label="Ensino Fundamental I">

                      <option value="1º ano">
                        1º ano
                      </option>

                      <option value="2º ano">
                        2º ano
                      </option>

                      <option value="3º ano">
                        3º ano
                      </option>

                      <option value="4º ano">
                        4º ano
                      </option>

                      <option value="5º ano">
                        5º ano
                      </option>

                    </optgroup>


                    <optgroup label="Ensino Fundamental II">

                      <option value="6º ano">
                        6º ano
                      </option>

                      <option value="7º ano">
                        7º ano
                      </option>

                      <option value="8º ano">
                        8º ano
                      </option>

                      <option value="9º ano">
                        9º ano
                      </option>

                    </optgroup>


                    <optgroup label="Ensino Médio">

                      <option value="1ª série do Ensino Médio">
                        1ª série
                      </option>

                      <option value="2ª série do Ensino Médio">
                        2ª série
                      </option>

                      <option value="3ª série do Ensino Médio">
                        3ª série
                      </option>

                    </optgroup>

                  </select>

                </div>


                <div className="campo-grupo">

                  <label
                    className="campo-rotulo"
                    htmlFor="duracao"
                  >
                    Duração da aula (em minutos)
                  </label>


                  <input
                    id="duracao"
                    className="campo-texto"
                    type="number"
                    min={1}
                    placeholder="Ex: 50"
                    value={
                      duracao
                    }
                    onChange={(e) =>
                      setDuracao(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              {/* TEMA */}

              <div className="campo-grupo">

                <label
                  className="campo-rotulo"
                  htmlFor="tema"
                >
                  Tema da aula
                </label>


                <input
                  id="tema"
                  className="campo-texto"
                  type="text"
                  placeholder="Ex: Frações — introdução"
                  value={
                    tema
                  }
                  onChange={(e) =>
                    setTema(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* OBSERVAÇÕES */}

              <div className="campo-grupo">

                <label
                  className="campo-rotulo"
                  htmlFor="observacoes"
                >
                  Algo que a Lousa deveria
                  saber? (opcional)
                </label>


                <textarea
                  id="observacoes"
                  className="campo-textarea"
                  rows={3}
                  placeholder="Ex: a turma já viu isso de forma teórica, precisa de algo mais prático"
                  value={
                    observacoes
                  }
                  onChange={(e) =>
                    setObservacoes(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* GERAR */}

              <button
                type="button"
                className="botao-gerar"
                disabled={
                  !podeGerar
                }
                onClick={
                  gerarPlano
                }
              >
                Gerar plano de aula
              </button>


              {!podeGerar && (

                <p className="dica-preenchimento">

                  Escolha matéria, turma,
                  duração e tema para liberar
                  o botão.

                </p>

              )}

            </section>


            {/* =============================================
                RASCUNHO
            ============================================= */}

            <aside className="pre-visualizacao">

              <div className="rascunho-cartao">

                <span className="rascunho-fita" />


                <span className="rascunho-etiqueta">

                  rascunho ao vivo

                </span>


                <div className="rascunho-linha">

                  <span className="rascunho-materia">

                    {materiaAtual
                      ? materiaAtual.nome
                      : 'Escolha uma matéria'}

                  </span>

                </div>


                <div className="rascunho-tags">

                  <span
                    className={
                      `rascunho-tag ${
                        turma
                          ? 'preenchida'
                          : ''
                      }`
                    }
                  >

                    {turma ||
                      'turma'}

                  </span>


                  <span
                    className={
                      `rascunho-tag ${
                        duracao
                          ? 'preenchida'
                          : ''
                      }`
                    }
                  >

                    {duracao
                      ? `${duracao} min`
                      : 'duração'}

                  </span>
                </div>
                <p
                  className={
                    `rascunho-tema ${tema? 'preenchida': ''}`}>
                  {tema ||'o tema da aula aparece aqui...'}
                </p>

              </div>

            </aside>

          </div>

        </div>

      </IonContent>

    </IonPage>
  );
};

export default Home;