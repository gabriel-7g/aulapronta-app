import 'dotenv/config';

const porta = Number(process.env.PORT || 3000);

if (Number.isNaN(porta)) {
  throw new Error('A variável PORT precisa ser um número.');
}

export const env = {
  port: porta,
  frontendUrl:
    process.env.FRONTEND_URL || 'http://localhost:8100'
};