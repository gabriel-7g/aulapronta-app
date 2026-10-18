import React, {
  FormEvent,
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  emailValido,
  obterToken,
  obterUsuarioLogado,
  sair,
  TipoUsuario
} from '../utils/auth';

import './AdminUsuarios.css';


interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  criadoEm?: string;
  atualizadoEm?: string;
}

interface ErroApi extends Error {
  status?: number;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';


const AdminUsuarios: React.FC = () => {
  const router = useIonRouter();
  const usuarioLogado = obterUsuarioLogado();

  const [usuarios, setUsuarios] =
    useState<UsuarioAdmin[]>([]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [usuarioParaExcluir, setUsuarioParaExcluir] =
    useState<UsuarioAdmin | null>(null);


  const limparMensagens = () => {
    setErro('');
    setSucesso('');
  };


  const encerrarSessao = useCallback(() => {
    sair();
    router.push('/login', 'root', 'replace');
  }, [router]);


  const requisicao = useCallback(
    async <T,>(
      rota: string,
      opcoes: RequestInit = {}
    ): Promise<T> => {
      const token = obterToken();

      if (!token) {
        encerrarSessao();
        throw new Error('Sessão expirada.');
      }

      const resposta = await fetch(
        `${API_URL}${rota}`,
        {
          ...opcoes,

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(opcoes.headers as Record<string, string> | undefined)
          }
        }
      );

      let dados: any = {};

      try {
        dados = await resposta.json();
      } catch {
        dados = {};
      }

      if (!resposta.ok) {
        if (resposta.status === 401) {
          encerrarSessao();
        }

        const erroApi = new Error(
          dados?.erro ||
          'Não foi possível concluir a operação.'
        ) as ErroApi;

        erroApi.status = resposta.status;

        throw erroApi;
      }

      return dados as T;
    },
    [encerrarSessao]
  );


  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);

    try {
      const dados = await requisicao<{
        usuarios: UsuarioAdmin[];
      }>('/api/usuarios');

      setUsuarios(dados.usuarios);

    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : 'Não foi possível carregar os usuários.';

      setErro(mensagem);

    } finally {
      setCarregando(false);
    }
  }, [requisicao]);


  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);


  const cadastrarUsuario = async (
    evento: FormEvent
  ) => {
    evento.preventDefault();
    limparMensagens();

    if (nome.trim().length < 2) {
      setErro('Informe o nome do usuário.');
      return;
    }

    if (!emailValido(email)) {
      setErro('Informe um e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      setErro(
        'A senha precisa ter pelo menos 6 caracteres.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setSalvando(true);

    try {
      await requisicao('/api/usuarios', {
        method: 'POST',

        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          senha
        })
      });

      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');

      await carregarUsuarios();

      setSucesso(
        'Usuário criado com sucesso.'
      );

    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível criar o usuário.'
      );

    } finally {
      setSalvando(false);
    }
  };


  const confirmarExclusao = async () => {
    if (!usuarioParaExcluir || excluindo) {
      return;
    }

    limparMensagens();
    setExcluindo(true);

    try {
      await requisicao(
        `/api/usuarios/${usuarioParaExcluir.id}`,
        {
          method: 'DELETE'
        }
      );

      setUsuarioParaExcluir(null);

      await carregarUsuarios();

      setSucesso(
        'Usuário excluído com sucesso.'
      );

    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível excluir o usuário.'
      );

      setUsuarioParaExcluir(null);

    } finally {
      setExcluindo(false);
    }
  };


  const fazerLogout = () => {
    sair();
    router.push('/login', 'root', 'replace');
  };


  return (
    <IonPage>
      <IonContent
        fullscreen
        className="admin-conteudo"
      >
        <div className="admin-pagina">

          {/* CABEÇALHO */}
          <header className="admin-cabecalho">

            <div>
              <div className="admin-marca">
                <span
                  className="admin-marca-simbolo"
                  aria-hidden="true"
                />
                <span>Lousa</span>
              </div>

              <p className="admin-etiqueta">
                painel administrativo
              </p>

              <h1>
                Gerenciar usuários
              </h1>

              <p className="admin-subtitulo">
                Olá, {usuarioLogado?.nome}.
                Cadastre e gerencie quem pode acessar o sistema.
              </p>
            </div>


            <div className="admin-acoes-topo">

              <button
                type="button"
                className="admin-botao-secundario"
                onClick={() =>
                  router.push(
                    '/planejamentos',
                    'forward'
                  )
                }
              >
                Meus planejamentos
              </button>

              <button
                type="button"
                className="admin-botao-sair"
                onClick={fazerLogout}
              >
                Sair
              </button>

            </div>

          </header>


          {/* MENSAGENS */}
          {erro && (
            <div
              className="admin-mensagem admin-mensagem-erro"
              role="alert"
            >
              {erro}
            </div>
          )}

          {sucesso && (
            <div
              className="admin-mensagem admin-mensagem-sucesso"
              role="status"
              aria-live="polite"
            >
              {sucesso}
            </div>
          )}


          <main className="admin-grid">

            {/* CADASTRO */}
            <section className="admin-card admin-card-cadastro">

              <div className="admin-card-cabecalho">
                <span>
                  NOVO USUÁRIO
                </span>

                <h2>
                  Criar uma conta
                </h2>

                <p>
                  Somente você, administrador,
                  pode cadastrar novos usuários.
                </p>
              </div>


              <form
                onSubmit={cadastrarUsuario}
                className="admin-formulario"
              >

                <div className="admin-campo">
                  <label htmlFor="adminNome">
                    Nome
                  </label>

                  <input
                    id="adminNome"
                    type="text"
                    autoComplete="name"
                    placeholder="Nome do usuário"
                    value={nome}
                    disabled={salvando}
                    onChange={(e) => {
                      setNome(e.target.value);
                      limparMensagens();
                    }}
                  />
                </div>


                <div className="admin-campo">
                  <label htmlFor="adminEmail">
                    E-mail
                  </label>

                  <input
                    id="adminEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@email.com"
                    value={email}
                    disabled={salvando}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      limparMensagens();
                    }}
                  />
                </div>


                <div className="admin-campo">
                  <label htmlFor="adminSenha">
                    Senha
                  </label>

                  <div className="admin-senha-wrapper">

                    <input
                      id="adminSenha"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      placeholder="Mínimo de 6 caracteres"
                      value={senha}
                      disabled={salvando}
                      onChange={(e) => {
                        setSenha(e.target.value);
                        limparMensagens();
                      }}
                    />

                    <button
                      type="button"
                      disabled={salvando}
                      aria-label={
                        mostrarSenha
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }
                      aria-pressed={mostrarSenha}
                      onClick={() =>
                        setMostrarSenha(
                          !mostrarSenha
                        )
                      }
                    >
                      {mostrarSenha
                        ? 'Ocultar'
                        : 'Mostrar'}
                    </button>

                  </div>
                </div>


                <div className="admin-campo">
                  <label htmlFor="adminConfirmarSenha">
                    Confirmar senha
                  </label>

                  <input
                    id="adminConfirmarSenha"
                    type={
                      mostrarSenha
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    placeholder="Digite novamente"
                    value={confirmarSenha}
                    disabled={salvando}
                    onChange={(e) => {
                      setConfirmarSenha(
                        e.target.value
                      );

                      limparMensagens();
                    }}
                  />
                </div>


                <button
                  type="submit"
                  className="admin-botao-principal"
                  disabled={salvando}
                  aria-busy={salvando}
                >
                  {salvando
                    ? 'Criando...'
                    : 'Criar usuário'}
                </button>

              </form>

            </section>


            {/* LISTA */}
            <section className="admin-card admin-card-lista">

              <div className="admin-lista-topo">

                <div>
                  <span className="admin-label">
                    CONTAS
                  </span>

                  <h2>
                    Usuários cadastrados
                  </h2>
                </div>

                <span className="admin-contador">
                  {usuarios.length}
                </span>

              </div>


              {carregando ? (

                <div className="admin-lista">
                  <p>
                    Carregando usuários...
                  </p>
                </div>

              ) : usuarios.length === 0 ? (

                <div className="admin-lista">
                  <p>
                    Nenhum usuário cadastrado.
                  </p>
                </div>

              ) : (

                <div className="admin-lista">

                  {usuarios.map((usuario) => (
                    <article
                      className="admin-usuario"
                      key={usuario.id}
                    >

                      <div className="admin-avatar">
                        {usuario.nome
                          .charAt(0)
                          .toUpperCase()}
                      </div>


                      <div className="admin-usuario-info">

                        <div className="admin-usuario-nome">

                          <strong>
                            {usuario.nome}
                          </strong>

                          {usuario.tipo === 'admin' && (
                            <span className="admin-badge">
                              Admin
                            </span>
                          )}

                        </div>

                        <span>
                          {usuario.email}
                        </span>

                      </div>


                      {usuario.tipo !== 'admin' && (
                        <button
                          type="button"
                          className="admin-excluir"
                          disabled={excluindo}
                          aria-label={
                            `Excluir usuário ${usuario.nome}`
                          }
                          onClick={() => {
                            limparMensagens();
                            setUsuarioParaExcluir(
                              usuario
                            );
                          }}
                        >
                          Excluir
                        </button>
                      )}

                    </article>
                  ))}

                </div>

              )}

            </section>

          </main>

        </div>


        {/* MODAL */}
        {usuarioParaExcluir && (

          <div
            className="admin-modal-overlay"
            role="presentation"
            onMouseDown={() =>
              !excluindo &&
              setUsuarioParaExcluir(null)
            }
          >

            <div
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tituloExcluirUsuario"
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              <span
                className="admin-modal-icone"
                aria-hidden="true"
              >
                !
              </span>

              <h2 id="tituloExcluirUsuario">
                Excluir usuário?
              </h2>

              <p>
                A conta de{' '}
                <strong>
                  {usuarioParaExcluir.nome}
                </strong>{' '}
                não poderá mais acessar o sistema.
              </p>


              <div className="admin-modal-acoes">

                <button
                  type="button"
                  className="admin-modal-cancelar"
                  disabled={excluindo}
                  onClick={() =>
                    setUsuarioParaExcluir(null)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="admin-modal-confirmar"
                  disabled={excluindo}
                  aria-busy={excluindo}
                  onClick={confirmarExclusao}
                >
                  {excluindo
                    ? 'Excluindo...'
                    : 'Excluir usuário'}
                </button>

              </div>

            </div>

          </div>

        )}

      </IonContent>
    </IonPage>
  );
};


export default AdminUsuarios;