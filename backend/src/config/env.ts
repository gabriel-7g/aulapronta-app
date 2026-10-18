import 'dotenv/config';

const porta = Number(process.env.PORT || 3000);

if (Number.isNaN(porta)) {
  throw new Error(
    'A variável PORT precisa ser um número.'
  );
}

const obrigatorias = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GROQ_API_KEY'
] as const;

for (const variavel of obrigatorias) {
  if (!process.env[variavel]) {
    throw new Error(
      `${variavel} não foi definida no .env.`
    );
  }
}

export const env = {
  port: porta,

  frontendUrl:
    process.env.FRONTEND_URL ||
    'http://localhost:8100',

  databaseUrl:
    process.env.DATABASE_URL!,

  jwtSecret:
    process.env.JWT_SECRET!,

  groqApiKey:
    process.env.GROQ_API_KEY!
};