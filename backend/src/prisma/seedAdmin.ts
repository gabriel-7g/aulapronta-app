import 'dotenv/config';
import bcrypt from 'bcryptjs';

import { db } from './db';

const criarAdmin = async () => {
  const nome = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_PASSWORD;

  if (!nome || !email || !senha) {
    throw new Error(
      'ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos no .env.'
    );
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const admin = await db.orm.public.Usuario.upsert({
    create: {
      nome,
      email,
      senha: senhaHash,
      tipo: 'admin'
    },

    update: {
      nome,
      senha: senhaHash,
      tipo: 'admin'
    },

    conflictOn: {
      email
    }
  });

  console.log('');
  console.log('Administrador criado/atualizado com sucesso.');
  console.log(`Nome: ${admin.nome}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Tipo: ${admin.tipo}`);
  console.log('');
};

criarAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((erro) => {
    console.error('Erro ao criar administrador:');
    console.error(erro);
    process.exit(1);
  });