import Groq from 'groq-sdk';
import { env } from '../config/env';

export interface DadosGeracaoPlano {
  nivelEnsino?: string;
  materia: string;
  turma: string;
  duracao: string;
  tema: string;
  observacoes?: string;
}

export interface ConteudoGerado {
  titulo: string;
  objetivo: string;
  introducao: string;
  desenvolvimento: string;
  atividade: string;
  recursos: string;
  avaliacao: string;
}

const groq = new Groq({
  apiKey: env.groqApiKey
});

const CAMPOS: Array<keyof ConteudoGerado> = [
  'titulo',
  'objetivo',
  'introducao',
  'desenvolvimento',
  'atividade',
  'recursos',
  'avaliacao'
];

const SCHEMA_PLANO = {
  type: 'object',
  properties: {
    titulo: { type: 'string' },
    objetivo: { type: 'string' },
    introducao: { type: 'string' },
    desenvolvimento: { type: 'string' },
    atividade: { type: 'string' },
    recursos: { type: 'string' },
    avaliacao: { type: 'string' }
  },
  required: CAMPOS,
  additionalProperties: false
} as const;

const INSTRUCOES = `
Você é um especialista em didática, planejamento pedagógico
e design instrucional.

Sua função é produzir planos de aula completos, específicos,
bem estruturados e realmente utilizáveis por professores.

Não escreva apenas orientações genéricas.
Entregue conteúdo que ajude o professor a executar a aula.

PRINCÍPIOS

- Adapte linguagem e profundidade ao nível de ensino.
- Considere o estágio da turma ou período informado.
- Respeite a duração real da aula.
- Relacione objetivos, conteúdo, atividade e avaliação.
- Explique os conceitos centrais do tema.
- Inclua exemplos concretos quando forem úteis.
- Mostre aplicações práticas.
- Evite repetições e textos apenas para preencher espaço.
- Não invente fontes, pesquisas, autores ou estatísticas.
- Utilize terminologia técnica quando adequada.

ADEQUAÇÃO POR NÍVEL

Educação Infantil:
• experiências concretas;
• ludicidade;
• participação;
• linguagem adequada à faixa etária.

Ensino Fundamental:
• progressão gradual;
• explicações claras;
• exemplos concretos;
• atividade compatível com o ano.

Ensino Médio:
• maior profundidade conceitual;
• relações entre conteúdos;
• situações-problema;
• aplicação e interpretação.

Ensino Técnico:
• fundamentos teóricos;
• aplicação profissional;
• procedimentos;
• situações reais da área;
• resolução de problemas.

Ensino Superior:
• rigor conceitual;
• terminologia técnica;
• relações entre conceitos;
• análise;
• aplicação;
• situações-problema;
• profundidade compatível com o período.

Curso Livre:
• foco prático;
• progressão;
• aplicação direta;
• resultado observável.

OBJETIVO

Escreva:

Objetivo geral:
uma finalidade clara e específica.

Objetivos específicos:
• apresente entre 2 e 4;
• utilize verbos observáveis;
• relacione-os ao conteúdo da aula.

INTRODUÇÃO

Informe o tempo previsto.

Explique concretamente:
• como iniciar;
• que pergunta ou situação apresentar;
• quais conhecimentos prévios recuperar;
• como conectar a introdução ao conteúdo principal.

Não escreva apenas "apresente o tema".

DESENVOLVIMENTO

Esta deve ser a parte mais completa do planejamento.

Informe o tempo previsto.

Divida o conteúdo em etapas numeradas.

Em cada etapa, sempre que adequado, inclua:
• conceito trabalhado;
• explicação essencial;
• exemplo concreto;
• aplicação;
• pergunta para a turma;
• relação com o próximo tópico.

Não escreva apenas:
"Explique o conteúdo."
"Apresente exemplos."
"Trabalhe o assunto."

Diga especificamente o que deve ser ensinado.

Selecione os conceitos mais relevantes para o tempo disponível.

ATIVIDADE

Informe o tempo previsto.

Descreva:
• objetivo da atividade;
• organização da turma;
• instruções;
• etapas;
• problema ou exercício;
• resultado esperado.

Quando possível, forneça um exemplo concreto.

A atividade deve praticar algo realmente trabalhado
durante o desenvolvimento.

RECURSOS

Liste somente materiais realmente úteis.

Use:
• recurso
• recurso
• recurso

AVALIAÇÃO

Não escreva apenas "avaliar a participação".

Informe:
• o que será observado;
• como verificar a compreensão;
• critérios de aprendizagem;
• erros ou dificuldades importantes;
• como verificar os objetivos propostos.

AULAS LONGAS

Para aulas superiores a 90 minutos:

• mantenha a mesma objetividade;
• divida a aula em blocos pedagógicos;
• use o tempo adicional para exercícios, prática,
  discussão, correção ou aprofundamento;
• não aumente artificialmente o tamanho da resposta;
• não repita conteúdo apenas para preencher tempo.

LEGIBILIDADE

O professor deve conseguir bater o olho e entender a aula.

Use:
1. Etapas numeradas.
• Marcadores para listas.
• Parágrafos curtos.
• Quebras de linha entre assuntos.

Evite grandes paredes de texto.

QUALIDADE FINAL

Antes de responder, verifique internamente se:

1. A aula cabe no tempo informado.
2. O conteúdo está adequado ao nível.
3. O desenvolvimento realmente ensina o tema.
4. A atividade pratica o conteúdo ensinado.
5. A avaliação verifica os objetivos.
6. Existem exemplos suficientes.
7. As instruções são concretas.
8. O plano pode ser executado por um professor real.

Pense antes de responder, mas apresente somente
o planejamento final.
`.trim();

const limiteTokens = (minutos: number): number => {
  const duracaoConsiderada = Math.min(minutos, 90);

  if (duracaoConsiderada <= 30) return 1500;
  if (duracaoConsiderada <= 45) return 1700;
  if (duracaoConsiderada <= 60) return 1900;

  return 2200;
};

const validarResposta = (
  valor: unknown
): valor is ConteudoGerado => {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }

  const resposta = valor as Record<string, unknown>;

  return CAMPOS.every(
    (campo) =>
      typeof resposta[campo] === 'string' &&
      resposta[campo].trim().length > 0
  );
};

export const gerarPlanoComIa = async (
  dados: DadosGeracaoPlano
): Promise<ConteudoGerado> => {
  const minutos = Number(dados.duracao);

  if (!Number.isFinite(minutos) || minutos < 1) {
    throw new Error('Informe uma duração válida.');
  }

  const maxTokens = limiteTokens(minutos);

  const contexto = `
Crie agora um planejamento com estes dados:

Nível de ensino:
${dados.nivelEnsino || 'Não informado'}

Matéria:
${dados.materia}

Turma / período:
${dados.turma}

Duração:
${minutos} minutos

Tema:
${dados.tema}

Observações do professor:
${dados.observacoes || 'Nenhuma'}

IMPORTANTE:

O planejamento deve ser específico para "${dados.tema}".

Não utilize explicações genéricas que poderiam servir
para qualquer tema.

Distribua os ${minutos} minutos de forma coerente entre
introdução, desenvolvimento, atividade e avaliação.

O desenvolvimento deve ensinar efetivamente o conteúdo,
não apenas dizer ao professor que ele deve ensiná-lo.

Forneça conteúdo suficiente para que o professor consiga
utilizar o planejamento como guia durante a aula.

Priorize detalhes úteis, exemplos, aplicações e instruções
concretas.

Se houver observações do professor, considere-as como
prioridade na construção da aula.
`.trim();

  const resposta = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',

    messages: [
      {
        role: 'system',
        content: INSTRUCOES
      },
      {
        role: 'user',
        content: contexto
      }
    ],

    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'planejamento_aula',
        strict: true,
        schema: SCHEMA_PLANO
      }
    },

    reasoning_effort: 'low',
    reasoning_format: 'hidden',

    temperature: 1,

    max_completion_tokens: maxTokens
  });

  if (resposta.usage) {
    console.log(
      `[IA] ${minutos} min | ` +
      `${dados.nivelEnsino || 'Sem nível'} | ` +
      `limite: ${maxTokens} | ` +
      `entrada: ${resposta.usage.prompt_tokens} | ` +
      `saída: ${resposta.usage.completion_tokens} | ` +
      `total: ${resposta.usage.total_tokens}`
    );
  }

  const texto = resposta.choices[0]?.message?.content;

  if (!texto) {
    throw new Error('A IA não retornou conteúdo.');
  }

  let conteudo: unknown;

  try {
    conteudo = JSON.parse(texto);
  } catch {
    throw new Error('A IA retornou uma resposta inválida.');
  }

  if (!validarResposta(conteudo)) {
    throw new Error(
      'A IA não retornou todos os campos necessários.'
    );
  }

  return conteudo;
};