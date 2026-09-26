export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  criadoEm: string;
}

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
}

const USUARIOS_KEY = 'lousaUsuarios';
const SESSAO_KEY = 'lousaSessao';


/* =========================================================
   USUÁRIOS
   ========================================================= */

export const obterUsuarios = (): Usuario[] => {
  const dados = localStorage.getItem(
    USUARIOS_KEY
  );

  if (!dados) {
    return [];
  }

  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
};


/* =========================================================
   CRIAR USUÁRIO
   ========================================================= */

export const criarUsuario = (
  nome: string,
  email: string,
  senha: string
) => {
  const usuarios = obterUsuarios();

  const emailNormalizado = email
    .trim()
    .toLowerCase();

  const usuarioExistente = usuarios.find(
    (usuario) =>
      usuario.email.toLowerCase() ===
      emailNormalizado
  );

  if (usuarioExistente) {
    return {
      sucesso: false,
      mensagem:
        'Já existe uma conta cadastrada com este e-mail.'
    };
  }

  const novoUsuario: Usuario = {
    id:
      typeof crypto !== 'undefined' &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),

    nome: nome.trim(),

    email: emailNormalizado,

    senha,

    criadoEm:
      new Date().toISOString()
  };

  usuarios.push(novoUsuario);

  localStorage.setItem(
    USUARIOS_KEY,
    JSON.stringify(usuarios)
  );

  return {
    sucesso: true,
    usuario: novoUsuario
  };
};


/* =========================================================
   LOGIN
   ========================================================= */

export const fazerLogin = (
  email: string,
  senha: string
) => {
  const usuarios = obterUsuarios();

  const emailNormalizado = email
    .trim()
    .toLowerCase();

  const usuario = usuarios.find(
    (item) =>
      item.email.toLowerCase() ===
      emailNormalizado
  );

  if (!usuario) {
    return {
      sucesso: false,
      mensagem:
        'E-mail ou senha incorretos.'
    };
  }

  if (usuario.senha !== senha) {
    return {
      sucesso: false,
      mensagem:
        'E-mail ou senha incorretos.'
    };
  }

  const usuarioLogado: UsuarioLogado = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email
  };

  /*
    A sessão fica somente enquanto
    o navegador/aba estiver aberto.
  */
  sessionStorage.setItem(
    SESSAO_KEY,
    JSON.stringify(usuarioLogado)
  );

  return {
    sucesso: true,
    usuario: usuarioLogado
  };
};


/* =========================================================
   VERIFICAR LOGIN
   ========================================================= */

export const estaAutenticado = (): boolean => {
  return Boolean(
    sessionStorage.getItem(
      SESSAO_KEY
    )
  );
};


/* =========================================================
   PEGAR USUÁRIO LOGADO
   ========================================================= */

export const obterUsuarioLogado =
  (): UsuarioLogado | null => {

    const dados =
      sessionStorage.getItem(
        SESSAO_KEY
      );

    if (!dados) {
      return null;
    }

    try {
      return JSON.parse(dados);
    } catch {
      return null;
    }
  };


/* =========================================================
   LOGOUT
   ========================================================= */

export const sair = () => {
  /*
    Apaga somente a sessão.

    NÃO apaga:
    - conta
    - e-mail
    - planejamentos
  */
  sessionStorage.removeItem(
    SESSAO_KEY
  );

  /*
    Também limpamos dados temporários
    de navegação.
  */
  sessionStorage.removeItem(
    'planoEmCriacao'
  );

  sessionStorage.removeItem(
    'planoSelecionado'
  );
};