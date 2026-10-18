import bcrypt from 'bcryptjs';

import { db } from '../prisma/db';
import { gerarToken } from '../utils/gerarToken';

interface DadosLogin {
  email: string;
  senha: string;
}

export const autenticarUsuario = async ({
  email,
  senha
}: DadosLogin) => {
  const emailNormalizado =
    email.trim().toLowerCase();

  const usuario =
    await db.orm.public.Usuario.first({
      email: emailNormalizado
    });

  if (!usuario) {
    return null;
  }

  const senhaCorreta =
    await bcrypt.compare(
      senha,
      usuario.senha
    );

  if (!senhaCorreta) {
    return null;
  }

  const token = gerarToken({
    id: usuario.id,
    email: usuario.email,
    tipo: usuario.tipo
  });

  return {
    token,

    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    }
  };
};