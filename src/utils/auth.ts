export type TipoUsuario =
  | 'admin'
  | 'usuario';


export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  criadoEm: string;
}


export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
}


interface ResultadoOperacao {
  sucesso: boolean;
  mensagem?: string;
  usuario?: Usuario;
}


interface ResultadoLogin {
  sucesso: boolean;
  mensagem?: string;
  usuario?: UsuarioLogado;
}


interface Sessao {
  token: string;
  usuario: UsuarioLogado;
}


interface RespostaLoginApi {
  token: string;

  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: TipoUsuario;
  };
}


const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

const SESSAO_KEY =
  'lousaSessao';

const USUARIOS_KEY =
  'lousaUsuarios';


export const emailValido = (
  email: string
): boolean => {
  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(
    email.trim()
  );
};


// =====================================================
// SESSÃO
// =====================================================

const obterSessao = (): Sessao | null => {
  const dados =
    sessionStorage.getItem(
      SESSAO_KEY
    );

  if (!dados) {
    return null;
  }

  try {
    const sessao =
      JSON.parse(dados) as Sessao;

    if (
      !sessao?.token ||
      !sessao?.usuario?.id ||
      !sessao?.usuario?.email
    ) {
      sessionStorage.removeItem(
        SESSAO_KEY
      );

      return null;
    }

    return sessao;

  } catch {
    sessionStorage.removeItem(
      SESSAO_KEY
    );

    return null;
  }
};


export const obterToken = ():
  string | null => {
  return obterSessao()?.token ?? null;
};


export const obterUsuarioLogado = ():
  UsuarioLogado | null => {
  return obterSessao()?.usuario ?? null;
};


export const estaAutenticado = ():
  boolean => {
  return Boolean(
    obterSessao()?.token
  );
};


export const ehAdministrador = ():
  boolean => {
  return (
    obterUsuarioLogado()?.tipo ===
    'admin'
  );
};


// =====================================================
// LOGIN REAL
// =====================================================

export const fazerLogin = async (
  email: string,
  senha: string
): Promise<ResultadoLogin> => {
  const emailNormalizado =
    email
      .trim()
      .toLowerCase();

  if (!emailNormalizado) {
    return {
      sucesso: false,
      mensagem: 'Informe seu e-mail.'
    };
  }

  if (!emailValido(emailNormalizado)) {
    return {
      sucesso: false,
      mensagem: 'Informe um e-mail válido.'
    };
  }

  if (!senha) {
    return {
      sucesso: false,
      mensagem: 'Informe sua senha.'
    };
  }

  try {
    const resposta = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          email: emailNormalizado,
          senha
        })
      }
    );


    const dados =
      await resposta.json();


    if (!resposta.ok) {
      return {
        sucesso: false,

        mensagem:
          dados?.erro ||
          'E-mail ou senha incorretos.'
      };
    }


    const respostaLogin =
      dados as RespostaLoginApi;


    if (
      !respostaLogin.token ||
      !respostaLogin.usuario?.id
    ) {
      return {
        sucesso: false,
        mensagem:
          'Resposta inválida do servidor.'
      };
    }


    const usuario:
      UsuarioLogado = {
        id:
          respostaLogin.usuario.id,

        nome:
          respostaLogin.usuario.nome,

        email:
          respostaLogin.usuario.email,

        tipo:
          respostaLogin.usuario.tipo
      };


    const sessao: Sessao = {
      token: respostaLogin.token,
      usuario
    };


    sessionStorage.setItem(
      SESSAO_KEY,
      JSON.stringify(sessao)
    );


    return {
      sucesso: true,
      usuario
    };

  } catch (erro) {
    console.error(
      'Erro de conexão durante o login:',
      erro
    );

    return {
      sucesso: false,
      mensagem:
        'Não foi possível conectar ao servidor.'
    };
  }
};


// =====================================================
// LOGOUT
// =====================================================

export const sair = () => {
  sessionStorage.removeItem(
    SESSAO_KEY
  );

  sessionStorage.removeItem(
    'planoEmCriacao'
  );

  sessionStorage.removeItem(
    'planoSelecionado'
  );
};


// =====================================================
// FUNÇÕES TEMPORÁRIAS
// GERENCIAMENTO LOCAL DE USUÁRIOS
//
// Serão substituídas no próximo passo pela API.
// Mantidas agora apenas para não quebrar
// AdminUsuarios.tsx.
// =====================================================

const gerarId = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString() +
    Math.random()
      .toString(36)
      .substring(2)
  );
};


const lerUsuariosArmazenados =
  (): Usuario[] => {
    const dados =
      localStorage.getItem(
        USUARIOS_KEY
      );

    if (!dados) {
      return [];
    }

    try {
      const usuarios =
        JSON.parse(dados);

      if (!Array.isArray(usuarios)) {
        return [];
      }

      return usuarios
        .filter(
          (usuario) =>
            usuario &&
            usuario.id &&
            usuario.email
        )
        .map(
          (usuario): Usuario => ({
            id: String(usuario.id),

            nome: String(
              usuario.nome ||
              'Usuário'
            ),

            email: String(
              usuario.email
            )
              .trim()
              .toLowerCase(),

            senha: String(
              usuario.senha ||
              ''
            ),

            tipo:
              usuario.tipo === 'admin'
                ? 'admin'
                : 'usuario',

            criadoEm:
              usuario.criadoEm ||
              new Date()
                .toISOString()
          })
        );

    } catch {
      return [];
    }
  };


const salvarUsuarios = (
  usuarios: Usuario[]
) => {
  localStorage.setItem(
    USUARIOS_KEY,
    JSON.stringify(usuarios)
  );
};


export const obterUsuarios =
  (): Usuario[] => {
    return lerUsuariosArmazenados();
  };


export const criarUsuario = (
  nome: string,
  email: string,
  senha: string
): ResultadoOperacao => {
  if (!ehAdministrador()) {
    return {
      sucesso: false,
      mensagem:
        'Apenas o administrador pode criar usuários.'
    };
  }

  const nomeNormalizado =
    nome.trim();

  const emailNormalizado =
    email
      .trim()
      .toLowerCase();

  if (nomeNormalizado.length < 2) {
    return {
      sucesso: false,
      mensagem:
        'Informe o nome do usuário.'
    };
  }

  if (!emailValido(emailNormalizado)) {
    return {
      sucesso: false,
      mensagem:
        'Informe um e-mail válido.'
    };
  }

  if (senha.length < 6) {
    return {
      sucesso: false,
      mensagem:
        'A senha precisa ter pelo menos 6 caracteres.'
    };
  }

  const usuarios =
    obterUsuarios();

  const usuarioExistente =
    usuarios.find(
      (usuario) =>
        usuario.email ===
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
    id: gerarId(),

    nome:
      nomeNormalizado,

    email:
      emailNormalizado,

    senha,

    tipo:
      'usuario',

    criadoEm:
      new Date()
        .toISOString()
  };


  usuarios.push(
    novoUsuario
  );

  salvarUsuarios(
    usuarios
  );


  return {
    sucesso: true,
    usuario:
      novoUsuario
  };
};


export const excluirUsuario = (
  usuarioId: string
): ResultadoOperacao => {
  if (!ehAdministrador()) {
    return {
      sucesso: false,
      mensagem:
        'Apenas o administrador pode excluir usuários.'
    };
  }


  const usuarioLogado =
    obterUsuarioLogado();

  if (
    usuarioLogado?.id ===
    usuarioId
  ) {
    return {
      sucesso: false,
      mensagem:
        'O administrador não pode excluir a própria conta.'
    };
  }


  const usuarios =
    obterUsuarios();

  const usuarioExiste =
    usuarios.some(
      (usuario) =>
        usuario.id ===
        usuarioId
    );


  if (!usuarioExiste) {
    return {
      sucesso: false,
      mensagem:
        'Usuário não encontrado.'
    };
  }


  salvarUsuarios(
    usuarios.filter(
      (usuario) =>
        usuario.id !==
        usuarioId
    )
  );


  return {
    sucesso: true,
    mensagem:
      'Usuário excluído com sucesso.'
  };
};