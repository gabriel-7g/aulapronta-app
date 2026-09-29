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

const USUARIOS_KEY =
  'lousaUsuarios';

const SESSAO_KEY =
  'lousaSessao';

/*
  ============================================================
  CONTA DO ADMINISTRADOR
  ============================================================

  IMPORTANTE:

  Troque os três valores abaixo pelos dados que você quiser
  usar para acessar a área administrativa.

  Como este projeto ainda é somente Front-End,
  essas informações ficam no código.

  Para trabalho acadêmico funciona normalmente.
  Em um sistema real, isso deveria ficar no Back-End.
*/

const ADMIN_INICIAL = {
  id: 'admin-principal',

  nome: 'Administrador',

  email:
    'admin@aulapronta.com',

  senha:
    'Admin@123'
};


/* =========================================================
   GERAR ID
   ========================================================= */

const gerarId = (): string => {

  if (
    typeof crypto !==
      'undefined' &&
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


/* =========================================================
   VALIDAR E-MAIL
   ========================================================= */

export const emailValido = (
  email: string
): boolean => {

  const regex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(
    email.trim()
  );
};


/* =========================================================
   LER USUÁRIOS DO LOCALSTORAGE
   ========================================================= */

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

      if (
        !Array.isArray(
          usuarios
        )
      ) {
        return [];
      }

      /*
        Normalização necessária porque
        usuários antigos do projeto podem
        não possuir a propriedade "tipo".
      */

      return usuarios
        .filter(
          (usuario) =>
            usuario &&
            usuario.id &&
            usuario.email
        )
        .map(
          (usuario) => ({
            id:
              String(
                usuario.id
              ),

            nome:
              String(
                usuario.nome ||
                  'Usuário'
              ),

            email:
              String(
                usuario.email
              )
                .trim()
                .toLowerCase(),

            senha:
              String(
                usuario.senha ||
                  ''
              ),

            tipo:
              usuario.tipo ===
              'admin'
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


/* =========================================================
   SALVAR USUÁRIOS
   ========================================================= */

const salvarUsuarios = (
  usuarios: Usuario[]
) => {

  localStorage.setItem(
    USUARIOS_KEY,
    JSON.stringify(
      usuarios
    )
  );

};


/* =========================================================
   GARANTIR ADMINISTRADOR
   ========================================================= */

const garantirAdministradorInicial =
  () => {

    let usuarios =
      lerUsuariosArmazenados();

    const indiceAdmin =
      usuarios.findIndex(
        (usuario) =>
          usuario.id ===
          ADMIN_INICIAL.id
      );

    /*
      Se o administrador já existe,
      atualizamos os dados de acordo
      com as constantes acima.
    */

    if (
      indiceAdmin !== -1
    ) {

      const adminExistente =
        usuarios[
          indiceAdmin
        ];

      usuarios[
        indiceAdmin
      ] = {

        ...adminExistente,

        nome:
          ADMIN_INICIAL.nome,

        email:
          ADMIN_INICIAL.email
            .trim()
            .toLowerCase(),

        senha:
          ADMIN_INICIAL.senha,

        tipo:
          'admin'
      };

      /*
        Evita outro usuário usando
        o mesmo e-mail do administrador.
      */

      usuarios =
        usuarios.filter(
          (
            usuario,
            indice
          ) =>
            indice ===
              indiceAdmin ||
            usuario.email !==
              ADMIN_INICIAL.email
                .trim()
                .toLowerCase()
        );

      salvarUsuarios(
        usuarios
      );

      return;
    }

    /*
      Remove uma eventual conta comum
      que esteja usando o mesmo e-mail
      escolhido para o administrador.
    */

    usuarios =
      usuarios.filter(
        (usuario) =>
          usuario.email !==
          ADMIN_INICIAL.email
            .trim()
            .toLowerCase()
      );

    const administrador:
      Usuario = {

      id:
        ADMIN_INICIAL.id,

      nome:
        ADMIN_INICIAL.nome,

      email:
        ADMIN_INICIAL.email
          .trim()
          .toLowerCase(),

      senha:
        ADMIN_INICIAL.senha,

      tipo:
        'admin',

      criadoEm:
        new Date()
          .toISOString()
    };

    usuarios.unshift(
      administrador
    );

    salvarUsuarios(
      usuarios
    );

  };


/* =========================================================
   OBTER USUÁRIOS
   ========================================================= */

export const obterUsuarios =
  (): Usuario[] => {

    garantirAdministradorInicial();

    return (
      lerUsuariosArmazenados()
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

      const sessao =
        JSON.parse(dados);

      if (
        !sessao?.id
      ) {

        sessionStorage
          .removeItem(
            SESSAO_KEY
          );

        return null;

      }

      /*
        Não confiamos apenas nos dados
        guardados na sessão.

        Conferimos se esse usuário
        ainda existe no sistema.
      */

      const usuarios =
        obterUsuarios();

      const usuario =
        usuarios.find(
          (item) =>
            item.id ===
            sessao.id
        );

      if (!usuario) {

        sessionStorage
          .removeItem(
            SESSAO_KEY
          );

        return null;

      }

      return {

        id:
          usuario.id,

        nome:
          usuario.nome,

        email:
          usuario.email,

        tipo:
          usuario.tipo
      };

    } catch {

      sessionStorage
        .removeItem(
          SESSAO_KEY
        );

      return null;

    }

  };


/* =========================================================
   VERIFICAR LOGIN
   ========================================================= */

export const estaAutenticado =
  (): boolean => {

    return (
      obterUsuarioLogado() !==
      null
    );

  };


/* =========================================================
   VERIFICAR ADMINISTRADOR
   ========================================================= */

export const ehAdministrador =
  (): boolean => {

    const usuario =
      obterUsuarioLogado();

    return (
      usuario?.tipo ===
      'admin'
    );

  };


/* =========================================================
   LOGIN
   ========================================================= */

export const fazerLogin = (
  email: string,
  senha: string
): ResultadoLogin => {

  garantirAdministradorInicial();

  const emailNormalizado =
    email
      .trim()
      .toLowerCase();

  if (
    !emailNormalizado
  ) {

    return {
      sucesso: false,
      mensagem:
        'Informe seu e-mail.'
    };

  }

  if (
    !emailValido(
      emailNormalizado
    )
  ) {

    return {
      sucesso: false,
      mensagem:
        'Informe um e-mail válido.'
    };

  }

  if (!senha) {

    return {
      sucesso: false,
      mensagem:
        'Informe sua senha.'
    };

  }

  const usuarios =
    obterUsuarios();

  const usuario =
    usuarios.find(
      (item) =>
        item.email ===
        emailNormalizado
    );

  if (
    !usuario ||
    usuario.senha !== senha
  ) {

    return {
      sucesso: false,
      mensagem:
        'E-mail ou senha incorretos.'
    };

  }

  const usuarioLogado:
    UsuarioLogado = {

    id:
      usuario.id,

    nome:
      usuario.nome,

    email:
      usuario.email,

    tipo:
      usuario.tipo
  };

  sessionStorage.setItem(
    SESSAO_KEY,
    JSON.stringify(
      usuarioLogado
    )
  );

  return {
    sucesso: true,
    usuario:
      usuarioLogado
  };

};


/* =========================================================
   CRIAR USUÁRIO
   SOMENTE ADMINISTRADOR
   ========================================================= */

export const criarUsuario = (
  nome: string,
  email: string,
  senha: string
): ResultadoOperacao => {

  /*
    Mesmo que alguém tente chamar
    esta função por outra página,
    somente um administrador logado
    poderá criar uma conta.
  */

  if (
    !ehAdministrador()
  ) {

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

  if (
    nomeNormalizado.length <
    2
  ) {

    return {
      sucesso: false,
      mensagem:
        'Informe o nome do usuário.'
    };

  }

  if (
    !emailValido(
      emailNormalizado
    )
  ) {

    return {
      sucesso: false,
      mensagem:
        'Informe um e-mail válido.'
    };

  }

  if (
    senha.length < 6
  ) {

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

  if (
    usuarioExistente
  ) {

    return {
      sucesso: false,
      mensagem:
        'Já existe uma conta cadastrada com este e-mail.'
    };

  }

  const novoUsuario:
    Usuario = {

    id:
      gerarId(),

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


/* =========================================================
   EXCLUIR USUÁRIO
   SOMENTE ADMINISTRADOR
   ========================================================= */

export const excluirUsuario = (
  usuarioId: string
): ResultadoOperacao => {

  if (
    !ehAdministrador()
  ) {

    return {
      sucesso: false,
      mensagem:
        'Apenas o administrador pode excluir usuários.'
    };

  }

  if (
    usuarioId ===
    ADMIN_INICIAL.id
  ) {

    return {
      sucesso: false,
      mensagem:
        'A conta do administrador não pode ser excluída.'
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

  if (
    !usuarioExiste
  ) {

    return {
      sucesso: false,
      mensagem:
        'Usuário não encontrado.'
    };

  }

  const novosUsuarios =
    usuarios.filter(
      (usuario) =>
        usuario.id !==
        usuarioId
    );

  salvarUsuarios(
    novosUsuarios
  );

  return {
    sucesso: true,
    mensagem:
      'Usuário excluído com sucesso.'
  };

};


/* =========================================================
   LOGOUT
   ========================================================= */

export const sair = () => {

  sessionStorage.removeItem(
    SESSAO_KEY
  );

  /*
    Limpamos apenas informações
    temporárias.

    Os usuários e planejamentos
    permanecem salvos.
  */

  sessionStorage.removeItem(
    'planoEmCriacao'
  );

  sessionStorage.removeItem(
    'planoSelecionado'
  );

};