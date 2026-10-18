import React, { useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';

import './Home.css';

interface Materia {
  id: string;
  nome: string;
}

const NIVEIS_ENSINO = [
  'Educação Infantil',
  'Ensino Fundamental',
  'Ensino Médio',
  'Ensino Técnico',
  'Ensino Superior',
  'Curso Livre',
  'Outro'
];

const MATERIAS: Materia[] = [
  { id: 'portugues', nome: 'Português' },
  { id: 'matematica', nome: 'Matemática' },
  { id: 'ciencias', nome: 'Ciências' },
  { id: 'historia', nome: 'História' },
  { id: 'geografia', nome: 'Geografia' },
  { id: 'ingles', nome: 'Inglês' },
  { id: 'artes', nome: 'Artes' },
  { id: 'educacao-fisica', nome: 'Educação Física' },
  { id: 'outra', nome: 'Outra matéria' }
];

const Home: React.FC = () => {
  const router = useIonRouter();

  const [nivelEnsino, setNivelEnsino] = useState('');
  const [materiaSelecionada, setMateriaSelecionada] =
    useState<string | null>(null);

  const [outraMateria, setOutraMateria] = useState('');
  const [turma, setTurma] = useState('');
  const [duracao, setDuracao] = useState('');
  const [tema, setTema] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const materiaAtual = MATERIAS.find(
    (materia) => materia.id === materiaSelecionada
  );

  const materiaFinal =
    materiaSelecionada === 'outra'
      ? outraMateria.trim()
      : materiaAtual?.nome || '';

  const podeGerar = Boolean(
    nivelEnsino &&
    materiaFinal &&
    turma.trim() &&
    duracao &&
    tema.trim()
  );

  const selecionarMateria = (id: string) => {
    setMateriaSelecionada(id);

    if (id !== 'outra') {
      setOutraMateria('');
    }
  };

  const gerarPlano = () => {
    if (!podeGerar) return;

    const dadosPlano = {
      nivelEnsino,
      materia: materiaFinal,
      materiaId: materiaSelecionada,
      turma: turma.trim(),
      duracao,
      tema: tema.trim(),
      observacoes: observacoes.trim()
    };

    // Evita conflito com um planejamento salvo aberto anteriormente
    sessionStorage.removeItem('planoSelecionado');

    // Salva os dados do novo planejamento
    sessionStorage.setItem(
      'planoEmCriacao',
      JSON.stringify(dadosPlano)
    );

    // Passa primeiro pela tela de geração
    router.push('/gerando-plano', 'forward');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-lousa">

        <div className="pagina-criar-plano">

          <header className="cabecalho">
            <div className="marca">
              <span className="marca-simbolo" />
              Lousa
            </div>
          </header>


          <div className="layout-principal">

            <section className="secao-formulario">

              <div className="formulario-cabecalho">

                <h1 className="formulario-titulo">
                  Vamos montar seu{' '}

                  <span className="destaque">
                    próximo planejamento

                    <svg
                      className="sublinhado-giz"
                      viewBox="0 0 220 20"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M4 14 C 60 4, 160 4, 216 12" />
                    </svg>
                  </span>
                  .
                </h1>

                <p className="formulario-descricao">
                  Informe o nível, a matéria e o contexto para a Lousa
                  montar uma proposta adequada.
                </p>

              </div>


              {/* NÍVEL DE ENSINO */}
              <div className="campo-grupo">

                <label
                  className="campo-rotulo"
                  htmlFor="nivelEnsino"
                >
                  Nível de ensino
                </label>

                <select
                  id="nivelEnsino"
                  className="campo-select"
                  value={nivelEnsino}
                  required
                  aria-required="true"
                  onChange={(e) =>
                    setNivelEnsino(e.target.value)
                  }
                >
                  <option value="">
                    Selecione
                  </option>

                  {NIVEIS_ENSINO.map((nivel) => (
                    <option
                      key={nivel}
                      value={nivel}
                    >
                      {nivel}
                    </option>
                  ))}
                </select>

              </div>


              {/* MATÉRIA */}
              <fieldset
                className="campo-grupo"
                style={{
                  border: 0,
                  padding: 0,
                  margin: 0
                }}
              >

                <legend className="campo-rotulo">
                  Matéria
                </legend>

                <div
                  className="grade-materias"
                  role="group"
                  aria-label="Selecione a matéria"
                >

                  {MATERIAS.map((materia) => {
                    const selecionada =
                      materiaSelecionada === materia.id;

                    return (
                      <button
                        key={materia.id}
                        type="button"
                        className={`materia-cartao ${
                          selecionada ? 'selecionada' : ''
                        }`}
                        aria-pressed={selecionada}
                        onClick={() =>
                          selecionarMateria(materia.id)
                        }
                      >
                        <span className="materia-nome">
                          {materia.nome}
                        </span>
                      </button>
                    );
                  })}

                </div>

              </fieldset>


              {/* OUTRA MATÉRIA */}
              {materiaSelecionada === 'outra' && (

                <div className="campo-grupo">

                  <label
                    className="campo-rotulo"
                    htmlFor="outraMateria"
                  >
                    Qual matéria?
                  </label>

                  <input
                    id="outraMateria"
                    className="campo-texto"
                    type="text"
                    required
                    aria-required="true"
                    placeholder="Ex: Direito Constitucional, Anatomia, Cálculo I..."
                    value={outraMateria}
                    onChange={(e) =>
                      setOutraMateria(e.target.value)
                    }
                  />

                </div>

              )}


              {/* TURMA / PERÍODO E DURAÇÃO */}
              <div className="campo-linha">

                <div className="campo-grupo">

                  <label
                    className="campo-rotulo"
                    htmlFor="turma"
                  >
                    Turma / período
                  </label>

                  <input
                    id="turma"
                    className="campo-texto"
                    type="text"
                    required
                    aria-required="true"
                    placeholder="Ex: 6º ano, 3º período, Turma A..."
                    value={turma}
                    onChange={(e) =>
                      setTurma(e.target.value)
                    }
                  />

                </div>


                <div className="campo-grupo">

                  <label
                    className="campo-rotulo"
                    htmlFor="duracao"
                  >
                    Duração (em minutos)
                  </label>

                  <input
                    id="duracao"
                    className="campo-texto"
                    type="number"
                    min={1}
                    required
                    aria-required="true"
                    inputMode="numeric"
                    placeholder="Ex: 50"
                    value={duracao}
                    onChange={(e) =>
                      setDuracao(e.target.value)
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
                  Tema
                </label>

                <input
                  id="tema"
                  className="campo-texto"
                  type="text"
                  required
                  aria-required="true"
                  placeholder="Ex: Direitos fundamentais"
                  value={tema}
                  onChange={(e) =>
                    setTema(e.target.value)
                  }
                />

              </div>


              {/* OBSERVAÇÕES */}
              <div className="campo-grupo">

                <label
                  className="campo-rotulo"
                  htmlFor="observacoes"
                >
                  Algo que a Lousa deveria saber? (opcional)
                </label>

                <textarea
                  id="observacoes"
                  className="campo-textarea"
                  rows={3}
                  placeholder="Ex: turma de graduação, conteúdo introdutório, foco em exemplos práticos..."
                  value={observacoes}
                  onChange={(e) =>
                    setObservacoes(e.target.value)
                  }
                />

              </div>


              {/* GERAR */}
              <button
                type="button"
                className="botao-gerar"
                disabled={!podeGerar}
                aria-disabled={!podeGerar}
                onClick={gerarPlano}
              >
                Gerar planejamento
              </button>


              {!podeGerar && (
                <p className="dica-preenchimento">
                  Preencha nível, matéria, turma/período,
                  duração e tema.
                </p>
              )}

            </section>


            {/* PRÉ-VISUALIZAÇÃO */}
            <aside className="pre-visualizacao">

              <div className="rascunho-cartao">

                <span
                  className="rascunho-fita"
                  aria-hidden="true"
                />

                <span className="rascunho-etiqueta">
                  rascunho ao vivo
                </span>


                <div className="rascunho-linha">

                  <span className="rascunho-materia">
                    {materiaFinal || 'Escolha uma matéria'}
                  </span>

                </div>


                <div className="rascunho-tags">

                  <span
                    className={`rascunho-tag ${
                      nivelEnsino ? 'preenchida' : ''
                    }`}
                  >
                    {nivelEnsino || 'nível'}
                  </span>


                  <span
                    className={`rascunho-tag ${
                      turma ? 'preenchida' : ''
                    }`}
                  >
                    {turma || 'turma / período'}
                  </span>


                  <span
                    className={`rascunho-tag ${
                      duracao ? 'preenchida' : ''
                    }`}
                  >
                    {duracao
                      ? `${duracao} min`
                      : 'duração'}
                  </span>

                </div>


                <p
                  className={`rascunho-tema ${
                    tema ? 'preenchida' : ''
                  }`}
                >
                  {tema || 'o tema aparece aqui...'}
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