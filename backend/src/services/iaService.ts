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

const camposObrigatorios: Array<
  keyof ConteudoGerado
> = [
  'titulo',
  'objetivo',
  'introducao',
  'desenvolvimento',
  'atividade',
  'recursos',
  'avaliacao'
];


const validarResposta = (
  valor: unknown
): valor is ConteudoGerado => {
  if (
    typeof valor !== 'object' ||
    valor === null
  ) {
    return false;
  }

  const resposta =
    valor as Record<string, unknown>;

  return camposObrigatorios.every(
    (campo) =>
      typeof resposta[campo] === 'string' &&
      resposta[campo].trim().length > 0
  );
};


export const gerarPlanoComIa = async (
  dados: DadosGeracaoPlano
): Promise<ConteudoGerado> => {
  const prompt = `
Crie um plano de aula completo em português do Brasil.

DADOS DA AULA:
- Nível de ensino: ${dados.nivelEnsino || 'Não informado'}
- Matéria: ${dados.materia}
- Turma/período: ${dados.turma}
- Duração: ${dados.duracao} minutos
- Tema: ${dados.tema}
- Observações do professor: ${dados.observacoes || 'Nenhuma'}

REGRAS:
1. O conteúdo deve ser adequado ao nível de ensino informado.
2. O plano deve caber no tempo disponível.
3. Seja pedagógico, objetivo e aplicável em sala.
4. Não invente informações sobre a instituição ou os alunos.
5. Considere as observações do professor quando existirem.
6. Retorne somente um objeto JSON válido.
7. Não use Markdown.
8. Não escreva nada antes ou depois do JSON.

Use EXATAMENTE esta estrutura:

{
  "titulo": "Título claro da aula",
  "objetivo": "Objetivo da aula",
  "introducao": "Como iniciar a aula",
  "desenvolvimento": "Como desenvolver o conteúdo",
  "atividade": "Atividade proposta",
  "recursos": "Recursos necessários",
  "avaliacao": "Forma de avaliação"
}
`.trim();

  const resposta =
    await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',

      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente pedagógico especializado na criação de planos de aula claros, úteis e adequados ao contexto informado.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],

      response_format: {
        type: 'json_object'
      },

      reasoning_effort: 'none',
      temperature: 0.5,
      max_completion_tokens: 1400
    });

  const texto =
    resposta.choices[0]
      ?.message
      ?.content;

  if (!texto) {
    throw new Error(
      'A IA não retornou conteúdo.'
    );
  }

  let conteudo: unknown;

  try {
    conteudo = JSON.parse(texto);
  } catch {
    throw new Error(
      'A IA retornou uma resposta inválida.'
    );
  }

  if (!validarResposta(conteudo)) {
    throw new Error(
      'A IA não retornou todos os campos necessários.'
    );
  }

  return conteudo;
};