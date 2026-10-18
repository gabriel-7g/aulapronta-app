import 'dotenv/config';

const porta = Number(process.env.PORT || 3000);

if (Number.isNaN(porta)) {
  throw new Error('A variável PORT precisa ser um número.');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não foi definida no .env.');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não foi definida no .env.');
}

export const env = {
  port: porta,

  frontendUrl:
    process.env.FRONTEND_URL ||
    'http://localhost:8100',

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET
};