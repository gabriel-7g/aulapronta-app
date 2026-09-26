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

/*
  Chaves usadas pelo navegador.
*/
const USUARIOS_KEY = 'lousaUsuarios';
const SESSAO_KEY = 'lousaSessao';


/*
  Retorna todos os usuários cadastrados.
*/
export const obterUsuarios = (): Usuario[] => {
  const dados = localStorage.getItem(USUARIOS_KEY);

  if (!dados) {
    return [];
  }

  try {
    return JSON.parse(dados);
  } catch {
    return [];
  }
};


/*
  Cria um novo usuário.
*/
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


/*
  Faz login verificando e-mail e senha.
*/
export const fazerLogin = (
  email: string,
  senha: string
) => {
  const usuarios =
    obterUsuarios();

  const emailNormalizado =
    email
      .trim()
      .toLowerCase();

  const usuario =
    usuarios.find(
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

  const usuarioLogado:
    UsuarioLogado = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    };

  /*
    sessionStorage:
    mantém login enquanto a sessão da aba
    permanecer aberta.
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


/*
  Verifica se existe usuário logado.
*/
export const estaAutenticado = () => {
  return Boolean(
    sessionStorage.getItem(
      SESSAO_KEY
    )
  );
};


/*
  Retorna o usuário da sessão.
*/
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


/*
  Encerra a sessão.
*/
export const sair = () => {
  sessionStorage.removeItem(
    SESSAO_KEY
  );
};