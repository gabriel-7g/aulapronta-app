import bcrypt from 'bcryptjs';

import { db } from '../prisma/db';

interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
}

export const listarUsuarios = async () => {
  const usuarios = await db.orm.public.Usuario
    .orderBy((usuario) => usuario.nome.asc())
    .all();

  return usuarios.map((usuario) => ({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm
  }));
};

export const criarUsuario = async ({
  nome,
  email,
  senha
}: NovoUsuario) => {
  const emailNormalizado = email.trim().toLowerCase();

  const existente = await db.orm.public.Usuario.first({
    email: emailNormalizado
  });

  if (existente) {
    return {
      erro: 'EMAIL_EM_USO' as const
    };
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const usuario = await db.orm.public.Usuario.create({
    nome: nome.trim(),
    email: emailNormalizado,
    senha: senhaHash,
    tipo: 'usuario'
  });

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      criadoEm: usuario.criadoEm,
      atualizadoEm: usuario.atualizadoEm
    }
  };
};

export const excluirUsuario = async (
  id: string
) => {
  const usuario = await db.orm.public.Usuario.first({
    id
  });

  if (!usuario) {
    return null;
  }

  await db.orm.public.Usuario
    .where({ id })
    .delete();

  return usuario;
};


export const redefinirSenhaUsuario = async (
  administradorId: string,
  usuarioId: string,
  novaSenha: string
) => {
  // Confirma que o administrador ainda possui permissão.
  const administrador = await db.orm.public.Usuario.first({
    id: administradorId
  });

  if (administrador?.tipo !== 'admin') {
    return 'SEM_PERMISSAO' as const;
  }

  const usuario = await db.orm.public.Usuario.first({
    id: usuarioId
  });

  if (!usuario) {
    return 'NAO_ENCONTRADO' as const;
  }

  // Somente contas de professores podem ser alteradas.
  if (usuario.tipo !== 'usuario') {
    return 'TIPO_NAO_PERMITIDO' as const;
  }

  const senhaHash = await bcrypt.hash(novaSenha, 12);

  await db.orm.public.Usuario
    .where({ id: usuarioId })
    .update({ senha: senhaHash });

  return 'OK' as const;
};
