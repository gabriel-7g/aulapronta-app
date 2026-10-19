export type TipoUsuario =
  | 'admin'
  | 'usuario';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
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
  usuario: UsuarioLogado;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

const SESSAO_KEY = 'lousaSessao';


export const emailValido = (
  email: string
): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );


const lerSessao = (): Sessao | null => {
  const dados =
    sessionStorage.getItem(SESSAO_KEY);

  if (!dados) return null;

  try {
    const sessao =
      JSON.parse(dados) as Sessao;

    const usuario = sessao?.usuario;

    if (
      !sessao?.token ||
      !usuario?.id ||
      !usuario?.email ||
      !usuario?.nome ||
      !['admin', 'usuario'].includes(
        usuario.tipo
      )
    ) {
      sessionStorage.removeItem(SESSAO_KEY);
      return null;
    }

    return sessao;

  } catch {
    sessionStorage.removeItem(SESSAO_KEY);
    return null;
  }
};


export const obterToken = () =>
  lerSessao()?.token ?? null;


export const obterUsuarioLogado = () =>
  lerSessao()?.usuario ?? null;


export const estaAutenticado = () =>
  Boolean(obterToken());


export const ehAdministrador = () =>
  obterUsuarioLogado()?.tipo === 'admin';


export const fazerLogin = async (
  email: string,
  senha: string
): Promise<ResultadoLogin> => {
  const emailNormalizado =
    email.trim().toLowerCase();

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
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          email: emailNormalizado,
          senha
        })
      }
    );

    const dados = await resposta
      .json()
      .catch(() => ({}));

    if (!resposta.ok) {
      return {
        sucesso: false,
        mensagem:
          dados?.erro ||
          'E-mail ou senha inválidos.'
      };
    }

    const login =
      dados as RespostaLoginApi;

    if (
      !login.token ||
      !login.usuario?.id ||
      !login.usuario?.nome ||
      !login.usuario?.email ||
      !['admin', 'usuario'].includes(
        login.usuario.tipo
      )
    ) {
      return {
        sucesso: false,
        mensagem:
          'Resposta inválida do servidor.'
      };
    }

    const sessao: Sessao = {
      token: login.token,
      usuario: login.usuario
    };

    sessionStorage.setItem(
      SESSAO_KEY,
      JSON.stringify(sessao)
    );

    return {
      sucesso: true,
      usuario: login.usuario
    };

  } catch (erro) {
    console.error(
      'Erro durante o login:',
      erro
    );

    return {
      sucesso: false,
      mensagem:
        'Não foi possível conectar ao servidor.'
    };
  }
};


export const sair = () => {
  sessionStorage.removeItem(SESSAO_KEY);
  sessionStorage.removeItem('planoEmCriacao');
  sessionStorage.removeItem('planoSelecionado');
};