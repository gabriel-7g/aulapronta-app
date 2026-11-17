
import React, { useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import './Home.css';

type Materia = { id: string; nome: string };

type ConfigNivel = {
  rotuloTurma: string;
  ajudaTurma: string;
  placeholderTurma: string;
  placeholderTema: string;
  descricao: string;
  turmas: string[];
  materias: Materia[];
};

const OUTRA: Materia = { id: 'outra', nome: 'Outra matéria' };
const DURACOES = ['30', '45', '50', '60', '90'];

const criarMaterias = (itens: [string, string][]): Materia[] => [
  ...itens.map(([id, nome]) => ({ id, nome })),
  OUTRA
];

// Configurações de cada nível de ensino
const CONFIG_NIVEIS: Record<string, ConfigNivel> = {
  'Educação Infantil': {
    rotuloTurma: 'Grupo / faixa etária',
    ajudaTurma: 'Escolha uma faixa sugerida ou escreva como sua escola organiza a turma.',
    placeholderTurma: 'Ex: Pré II, Grupo 5, crianças de 4 a 5 anos...',
    placeholderTema: 'Ex: Cores, animais, coordenação motora...',
    descricao: 'A Lousa priorizará atividades lúdicas, concretas e adequadas à faixa etária.',
    turmas: ['Berçário', 'Maternal I', 'Maternal II', 'Pré I', 'Pré II'],
    materias: criarMaterias([
      ['linguagem', 'Linguagem'], ['matematica', 'Matemática'],
      ['natureza', 'Natureza'], ['artes', 'Artes'],
      ['musica', 'Música'], ['movimento', 'Movimento']
    ])
  },

  'Ensino Fundamental': {
    rotuloTurma: 'Ano escolar',
    ajudaTurma: 'Selecione o ano para ajustar linguagem, exemplos e dificuldade.',
    placeholderTurma: 'Ex: 6º ano, 5º ano B...',
    placeholderTema: 'Ex: Frações, relevo brasileiro, classes gramaticais...',
    descricao: 'O conteúdo será ajustado ao ano escolar e à progressão de aprendizagem.',
    turmas: [
      '1º ano', '2º ano', '3º ano', '4º ano', '5º ano',
      '6º ano', '7º ano', '8º ano', '9º ano'
    ],
    materias: criarMaterias([
      ['portugues', 'Português'], ['matematica', 'Matemática'],
      ['ciencias', 'Ciências'], ['historia', 'História'],
      ['geografia', 'Geografia'], ['ingles', 'Inglês'],
      ['artes', 'Artes'], ['educacao-fisica', 'Educação Física']
    ])
  },

  'Ensino Médio': {
    rotuloTurma: 'Série',
    ajudaTurma: 'A série ajuda a definir profundidade, vocabulário e conhecimentos prévios.',
    placeholderTurma: 'Ex: 2ª série, 3º ano B...',
    placeholderTema: 'Ex: Funções orgânicas, Modernismo, eletrodinâmica...',
    descricao: 'A Lousa priorizará maior aprofundamento conceitual e aplicação dos conteúdos.',
    turmas: ['1ª série', '2ª série', '3ª série'],
    materias: criarMaterias([
      ['portugues', 'Português'], ['matematica', 'Matemática'],
      ['biologia', 'Biologia'], ['fisica', 'Física'],
      ['quimica', 'Química'], ['historia', 'História'],
      ['geografia', 'Geografia'], ['ingles', 'Inglês'],
      ['filosofia', 'Filosofia'], ['sociologia', 'Sociologia'],
      ['redacao', 'Redação']
    ])
  },

  'Ensino Técnico': {
    rotuloTurma: 'Módulo / semestre',
    ajudaTurma: 'Informe em que etapa do curso técnico a turma está.',
    placeholderTurma: 'Ex: 2º módulo, 3º semestre...',
    placeholderTema: 'Ex: Banco de dados relacional, segurança do trabalho...',
    descricao: 'A Lousa equilibrará fundamentos teóricos e aplicação profissional.',
    turmas: [
      '1º módulo', '2º módulo', '3º módulo', '4º módulo',
      '1º semestre', '2º semestre', '3º semestre', '4º semestre'
    ],
    materias: criarMaterias([
      ['programacao', 'Programação'], ['informatica', 'Informática'],
      ['administracao', 'Administração'], ['eletronica', 'Eletrônica'],
      ['logistica', 'Logística'], ['seguranca-trabalho', 'Segurança do Trabalho']
    ])
  },

  'Ensino Superior': {
    rotuloTurma: 'Período / semestre',
    ajudaTurma: 'Informe a etapa da graduação para calibrar a complexidade acadêmica.',
    placeholderTurma: 'Ex: 4º período, 6º semestre...',
    placeholderTema: 'Ex: Árvores binárias, contratos administrativos, fisiologia renal...',
    descricao: 'A Lousa usará maior rigor conceitual, terminologia técnica e aplicações acadêmicas.',
    turmas: [
      '1º período', '2º período', '3º período', '4º período', '5º período',
      '6º período', '7º período', '8º período', '9º período', '10º período'
    ],
    materias: criarMaterias([
      ['programacao', 'Programação'], ['calculo', 'Cálculo'],
      ['estatistica', 'Estatística'], ['administracao', 'Administração'],
      ['direito', 'Direito'], ['anatomia', 'Anatomia'],
      ['metodologia', 'Metodologia']
    ])
  },

  'Curso Livre': {
    rotuloTurma: 'Turma / nível',
    ajudaTurma: 'Descreva o nível dos participantes ou escolha uma sugestão.',
    placeholderTurma: 'Ex: Iniciante, turma intermediária...',
    placeholderTema: 'Ex: Excel básico, conversação em inglês...',
    descricao: 'A Lousa priorizará objetivos práticos e aplicação direta do conhecimento.',
    turmas: ['Iniciante', 'Básico', 'Intermediário', 'Avançado'],
    materias: criarMaterias([
      ['idiomas', 'Idiomas'], ['tecnologia', 'Tecnologia'],
      ['negocios', 'Negócios'], ['artes', 'Artes'],
      ['musica', 'Música'], ['fotografia', 'Fotografia']
    ])
  },

  Outro: {
    rotuloTurma: 'Turma / etapa',
    ajudaTurma: 'Descreva livremente o grupo para que a IA tenha contexto.',
    placeholderTurma: 'Ex: turma iniciante, treinamento interno...',
    placeholderTema: 'Informe o assunto que deseja trabalhar...',
    descricao: 'Use os campos livres para explicar o contexto da sua aula.',
    turmas: [],
    materias: [OUTRA]
  }
};

// Componente reutilizável para os campos do formulário
const Campo = ({ id, rotulo, children }: {
  id: string;
  rotulo: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="campo-grupo">
    <label className="campo-rotulo" htmlFor={id}>{rotulo}</label>
    {children}
  </div>
);

const Home: React.FC = () => {
  const router = useIonRouter();

  // Dados do formulário
  const [nivelEnsino, setNivelEnsino] = useState('');
  const [materiaSelecionada, setMateriaSelecionada] = useState<string | null>(null);
  const [outraMateria, setOutraMateria] = useState('');
  const [turma, setTurma] = useState('');
  const [duracao, setDuracao] = useState('');
  const [quantidadeAulas, setQuantidadeAulas] = useState(1);
  const [tema, setTema] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const config = CONFIG_NIVEIS[nivelEnsino];
  const materiaAtual = config?.materias.find((item) => item.id === materiaSelecionada);

  const materiaFinal = materiaSelecionada === 'outra'
    ? outraMateria.trim()
    : materiaAtual?.nome ?? '';

  const podeGerar = Boolean(
    nivelEnsino && materiaFinal && turma.trim() && Number(duracao) > 0 &&
    Number.isInteger(quantidadeAulas) && quantidadeAulas >= 1 &&
    quantidadeAulas <= 5 && tema.trim()
  );

  // Seleção de nível e matéria
  const selecionarNivel = (nivel: string) => {
    setNivelEnsino(nivel);
    setMateriaSelecionada(null);
    setOutraMateria('');
    setTurma('');
  };

  const selecionarMateria = (id: string) => {
    setMateriaSelecionada(id);
    if (id !== 'outra') setOutraMateria('');
  };

  // Guarda os dados e abre a tela de geração
  const gerarPlano = () => {
    if (!podeGerar) return;

    sessionStorage.removeItem('planoSelecionado');
    sessionStorage.removeItem('conteudoPlanoGerado');

    sessionStorage.setItem('planoEmCriacao', JSON.stringify({
      nivelEnsino,
      materia: materiaFinal,
      materiaId: materiaSelecionada,
      turma: turma.trim(),
      duracao,
      quantidadeAulas,
      tema: tema.trim(),
      observacoes: observacoes.trim()
    }));

    router.push('/gerando-plano', 'forward');
  };

  // Informações exibidas no resumo lateral
  const tagsResumo = [
    { id: 'nivel', texto: nivelEnsino || 'nível', preenchida: !!nivelEnsino },
    { id: 'turma', texto: turma || config?.rotuloTurma || 'turma', preenchida: !!turma },
    { id: 'duracao', texto: duracao ? `${duracao} min` : 'duração', preenchida: !!duracao },
    { id: 'aulas', texto: `${quantidadeAulas} ${quantidadeAulas === 1 ? 'aula' : 'aulas'}`, preenchida: true }
  ];

  return (
    <IonPage>
      <IonContent fullscreen className="conteudo-lousa">
        <div className="pagina-criar-plano">

          <header className="cabecalho">
            <div className="marca"><span className="marca-simbolo" />Lousa</div>
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
                    >
                      <path d="M4 14 C 60 4, 160 4, 216 12" />
                    </svg>
                  </span>.
                </h1>
                <p className="formulario-descricao">
                  Conte o contexto da turma. A Lousa adapta profundidade,
                  linguagem e atividades ao nível escolhido.
                </p>
              </div>

              {/* Nível de ensino */}
              <Campo id="nivelEnsino" rotulo="Nível de ensino">
                <select
                  id="nivelEnsino"
                  className="campo-select"
                  value={nivelEnsino}
                  onChange={(e) => selecionarNivel(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {Object.keys(CONFIG_NIVEIS).map((nivel) => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>

                {config && (
                  <div className="nivel-contexto">
                    <span className="nivel-contexto-marcador" aria-hidden="true" />
                    <p>{config.descricao}</p>
                  </div>
                )}
              </Campo>

              {config && (
                <>
                  {/* Matérias */}
                  <fieldset className="campo-grupo campo-sem-borda">
                    <legend className="campo-rotulo">Matéria / disciplina</legend>
                    <div className="grade-materias">
                      {config.materias.map((item) => {
                        const selecionada = materiaSelecionada === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={selecionada}
                            className={`materia-cartao ${selecionada ? 'selecionada' : ''}`}
                            onClick={() => selecionarMateria(item.id)}
                          >
                            <span className="materia-nome">{item.nome}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {materiaSelecionada === 'outra' && (
                    <Campo id="outraMateria" rotulo="Qual disciplina?">
                      <input
                        id="outraMateria"
                        className="campo-texto"
                        type="text"
                        placeholder={nivelEnsino === 'Ensino Superior'
                          ? 'Ex: Estrutura de Dados, Direito Penal...'
                          : 'Digite o nome da disciplina...'}
                        value={outraMateria}
                        onChange={(e) => setOutraMateria(e.target.value)}
                      />
                    </Campo>
                  )}

                  {/* Turma */}
                  <div className="campo-grupo">
                    <div className="campo-titulo-linha">
                      <label className="campo-rotulo" htmlFor="turma">
                        {config.rotuloTurma}
                      </label>
                      <span className="campo-opcional">escolha ou digite</span>
                    </div>

                    {config.turmas.length > 0 && (
                      <div className="turma-opcoes">
                        {config.turmas.map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            aria-pressed={turma === opcao}
                            className={`turma-chip ${turma === opcao ? 'selecionada' : ''}`}
                            onClick={() => setTurma(opcao)}
                          >
                            {opcao}
                          </button>
                        ))}
                      </div>
                    )}

                    <input
                      id="turma"
                      className="campo-texto"
                      type="text"
                      placeholder={config.placeholderTurma}
                      value={turma}
                      onChange={(e) => setTurma(e.target.value)}
                    />
                    <p className="campo-ajuda">{config.ajudaTurma}</p>
                  </div>

                  {/* Duração */}
                  <Campo id="duracao" rotulo="Duração da aula">
                    <div className="duracao-opcoes">
                      {DURACOES.map((minutos) => (
                        <button
                          key={minutos}
                          type="button"
                          aria-pressed={duracao === minutos}
                          className={`duracao-chip ${duracao === minutos ? 'selecionada' : ''}`}
                          onClick={() => setDuracao(minutos)}
                        >
                          {minutos} min
                        </button>
                      ))}
                    </div>

                    <div className="duracao-personalizada">
                      <input
                        id="duracao"
                        className="campo-texto"
                        type="number"
                        min={1}
                        placeholder="Outro tempo em minutos"
                        value={duracao}
                        onChange={(e) => setDuracao(e.target.value)}
                      />
                      <span>minutos</span>
                    </div>
                  </Campo>

                  {/* Quantidade de aulas */}
                  <Campo id="quantidadeAulas" rotulo="Quantidade de aulas">
                    <input
                      id="quantidadeAulas"
                      className="campo-texto"
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      value={quantidadeAulas || ''}
                      onChange={(e) => setQuantidadeAulas(Number(e.target.value))}
                    />
                    <p className="campo-ajuda">
                      Escolha de 1 a 5 aulas. A duração informada acima
                      será considerada para cada aula.
                    </p>
                  </Campo>

                  {/* Tema */}
                  <Campo id="tema" rotulo="Tema da aula">
                    <input
                      id="tema"
                      className="campo-texto"
                      type="text"
                      placeholder={config.placeholderTema}
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                    />
                  </Campo>

                  {/* Observações */}
                  <Campo
                    id="observacoes"
                    rotulo={
                      <>
                        Algo que a Lousa deveria saber?{' '}
                        <span className="texto-opcional">(opcional)</span>
                      </>
                    }
                  >
                    <textarea
                      id="observacoes"
                      className="campo-textarea"
                      rows={3}
                      placeholder="Ex: a turma já domina a teoria; quero foco prático; há alunos com dificuldade no conteúdo..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    />
                  </Campo>

                  {/* Gerar planejamento */}
                  <button
                    type="button"
                    className="botao-gerar"
                    disabled={!podeGerar}
                    onClick={gerarPlano}
                  >
                    Gerar planejamento
                  </button>

                  {!podeGerar && (
                    <p className="dica-preenchimento">
                      Complete nível, matéria, turma, duração,
                      quantidade de aulas e tema.
                    </p>
                  )}
                </>
              )}
            </section>

            {/* Resumo lateral */}
            <aside className="pre-visualizacao">
              <div className="rascunho-cartao">
                <span className="rascunho-fita" aria-hidden="true" />
                <span className="rascunho-etiqueta">contexto da aula</span>

                <div className="rascunho-linha">
                  <span className="rascunho-materia">
                    {materiaFinal || 'Escolha uma matéria'}
                  </span>
                </div>

                <div className="rascunho-tags">
                  {tagsResumo.map(({ id, texto, preenchida }) => (
                    <span
                      key={id}
                      className={`rascunho-tag ${preenchida ? 'preenchida' : ''}`}
                    >
                      {texto}
                    </span>
                  ))}
                </div>

                <p className={`rascunho-tema ${tema ? 'preenchida' : ''}`}>
                  {tema || 'o tema aparece aqui...'}
                </p>

                {config && (
                  <p className="rascunho-contexto">{config.descricao}</p>
                )}
              </div>
            </aside>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
