import React, {
  FormEvent,
  useEffect,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  criarUsuario,
  excluirUsuario,
  obterUsuarioLogado,
  obterUsuarios,
  sair,
  Usuario
} from '../utils/auth';

import './AdminUsuarios.css';


const AdminUsuarios:
React.FC = () => {

  const router =
    useIonRouter();


  /* =====================================================
     USUÁRIOS
     ===================================================== */

  const [
    usuarios,
    setUsuarios
  ] =
    useState<Usuario[]>(
      []
    );


  /* =====================================================
     FORMULÁRIO
     ===================================================== */

  const [
    nome,
    setNome
  ] =
    useState('');

  const [
    email,
    setEmail
  ] =
    useState('');

  const [
    senha,
    setSenha
  ] =
    useState('');

  const [
    confirmarSenha,
    setConfirmarSenha
  ] =
    useState('');

  const [
    mostrarSenha,
    setMostrarSenha
  ] =
    useState(false);


  /* =====================================================
     MENSAGENS
     ===================================================== */

  const [
    erro,
    setErro
  ] =
    useState('');

  const [
    sucesso,
    setSucesso
  ] =
    useState('');


  /* =====================================================
     MODAL DE EXCLUSÃO
     ===================================================== */

  const [
    usuarioParaExcluir,
    setUsuarioParaExcluir
  ] =
    useState<Usuario | null>(
      null
    );


  const usuarioLogado =
    obterUsuarioLogado();


  /* =====================================================
     CARREGAR USUÁRIOS
     ===================================================== */

  const carregarUsuarios =
    () => {

      setUsuarios(
        obterUsuarios()
      );

    };


  useEffect(() => {

    carregarUsuarios();

  }, []);


  /* =====================================================
     LIMPAR MENSAGENS
     ===================================================== */

  const limparMensagens =
    () => {

      setErro('');
      setSucesso('');

    };


  /* =====================================================
     CRIAR USUÁRIO
     ===================================================== */

  const cadastrarUsuario = (
    evento: FormEvent
  ) => {

    evento.preventDefault();

    limparMensagens();


    if (
      nome.trim().length <
      2
    ) {

      setErro(
        'Informe o nome do usuário.'
      );

      return;
    }


    if (
      !email.trim()
    ) {

      setErro(
        'Informe o e-mail do usuário.'
      );

      return;
    }


    if (
      senha.length < 6
    ) {

      setErro(
        'A senha precisa ter pelo menos 6 caracteres.'
      );

      return;
    }


    if (
      senha !==
      confirmarSenha
    ) {

      setErro(
        'As senhas não coincidem.'
      );

      return;
    }


    const resultado =
      criarUsuario(
        nome,
        email,
        senha
      );


    if (
      !resultado.sucesso
    ) {

      setErro(
        resultado.mensagem ||
        'Não foi possível criar o usuário.'
      );

      return;
    }


    setNome('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');

    carregarUsuarios();

    setSucesso(
      'Usuário criado com sucesso.'
    );

  };


  /* =====================================================
     EXCLUIR USUÁRIO
     ===================================================== */

  const confirmarExclusao =
    () => {

      if (
        !usuarioParaExcluir
      ) {
        return;
      }


      limparMensagens();


      const resultado =
        excluirUsuario(
          usuarioParaExcluir.id
        );


      if (
        !resultado.sucesso
      ) {

        setErro(
          resultado.mensagem ||
          'Não foi possível excluir o usuário.'
        );

        setUsuarioParaExcluir(
          null
        );

        return;

      }


      setUsuarioParaExcluir(
        null
      );

      carregarUsuarios();

      setSucesso(
        'Usuário excluído com sucesso.'
      );

    };


  /* =====================================================
     LOGOUT
     ===================================================== */

  const fazerLogout =
    () => {

      sair();

      router.push(
        '/login',
        'root'
      );

    };


  return (

    <IonPage>

      <IonContent
        fullscreen
        className=
          "admin-conteudo"
      >

        <div
          className=
            "admin-pagina"
        >


          {/* CABEÇALHO */}

          <header
            className=
              "admin-cabecalho"
          >

            <div>

              <div
                className=
                  "admin-marca"
              >

                <span
                  className=
                    "admin-marca-simbolo"
                />

                <span>
                  Lousa
                </span>

              </div>


              <p
                className=
                  "admin-etiqueta"
              >
                painel administrativo
              </p>

              <h1>
                Gerenciar usuários
              </h1>

              <p
                className=
                  "admin-subtitulo"
              >
                Olá,{' '}
                {
                  usuarioLogado
                    ?.nome
                }.
                Cadastre e gerencie
                quem pode acessar
                o sistema.
              </p>

            </div>


            <div
              className=
                "admin-acoes-topo"
            >

              <button
                type="button"

                className=
                  "admin-botao-secundario"

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

                className=
                  "admin-botao-sair"

                onClick={
                  fazerLogout
                }
              >
                Sair
              </button>

            </div>

          </header>


          {/* MENSAGENS */}

          {erro && (

            <div
              className=
                "admin-mensagem admin-mensagem-erro"

              role="alert"
            >
              {erro}
            </div>

          )}


          {sucesso && (

            <div
              className=
                "admin-mensagem admin-mensagem-sucesso"

              role="status"

              aria-live="polite"
            >
              {sucesso}
            </div>

          )}


          <main
            className=
              "admin-grid"
          >


            {/* CADASTRO */}

            <section
              className=
                "admin-card admin-card-cadastro"
            >

              <div
                className=
                  "admin-card-cabecalho"
              >

                <span>
                  NOVO USUÁRIO
                </span>

                <h2>
                  Criar uma conta
                </h2>

                <p>
                  Somente você,
                  administrador,
                  pode cadastrar
                  novos usuários.
                </p>

              </div>


              <form
                onSubmit={
                  cadastrarUsuario
                }

                className=
                  "admin-formulario"
              >


                {/* NOME */}

                <div
                  className=
                    "admin-campo"
                >

                  <label
                    htmlFor=
                      "adminNome"
                  >
                    Nome
                  </label>

                  <input
                    id="adminNome"
                    type="text"

                    placeholder=
                      "Nome do usuário"

                    value={nome}

                    onChange={(
                      evento
                    ) => {

                      setNome(
                        evento
                          .target
                          .value
                      );

                      limparMensagens();

                    }}
                  />

                </div>


                {/* EMAIL */}

                <div
                  className=
                    "admin-campo"
                >

                  <label
                    htmlFor=
                      "adminEmail"
                  >
                    E-mail
                  </label>

                  <input
                    id="adminEmail"
                    type="email"

                    placeholder=
                      "usuario@email.com"

                    value={email}

                    onChange={(
                      evento
                    ) => {

                      setEmail(
                        evento
                          .target
                          .value
                      );

                      limparMensagens();

                    }}
                  />

                </div>


                {/* SENHA */}

                <div
                  className=
                    "admin-campo"
                >

                  <label
                    htmlFor=
                      "adminSenha"
                  >
                    Senha
                  </label>


                  <div
                    className=
                      "admin-senha-wrapper"
                  >

                    <input
                      id=
                        "adminSenha"

                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }

                      placeholder=
                        "Mínimo de 6 caracteres"

                      value={senha}

                      onChange={(
                        evento
                      ) => {

                        setSenha(
                          evento
                            .target
                            .value
                        );

                        limparMensagens();

                      }}
                    />


                    <button
                      type="button"

                      onClick={() =>
                        setMostrarSenha(
                          !mostrarSenha
                        )
                      }
                    >

                      {
                        mostrarSenha
                          ? 'Ocultar'
                          : 'Mostrar'
                      }

                    </button>

                  </div>

                </div>


                {/* CONFIRMAR */}

                <div
                  className=
                    "admin-campo"
                >

                  <label
                    htmlFor=
                      "adminConfirmarSenha"
                  >
                    Confirmar senha
                  </label>

                  <input
                    id=
                      "adminConfirmarSenha"

                    type={
                      mostrarSenha
                        ? 'text'
                        : 'password'
                    }

                    placeholder=
                      "Digite novamente"

                    value={
                      confirmarSenha
                    }

                    onChange={(
                      evento
                    ) => {

                      setConfirmarSenha(
                        evento
                          .target
                          .value
                      );

                      limparMensagens();

                    }}
                  />

                </div>


                <button
                  type="submit"

                  className=
                    "admin-botao-principal"
                >
                  Criar usuário
                </button>

              </form>

            </section>


            {/* LISTA */}

            <section
              className=
                "admin-card admin-card-lista"
            >

              <div
                className=
                  "admin-lista-topo"
              >

                <div>

                  <span
                    className=
                      "admin-label"
                  >
                    CONTAS
                  </span>

                  <h2>
                    Usuários cadastrados
                  </h2>

                </div>


                <span
                  className=
                    "admin-contador"
                >
                  {
                    usuarios.length
                  }
                </span>

              </div>


              <div
                className=
                  "admin-lista"
              >

                {
                  usuarios.map(
                    (usuario) => (

                      <article
                        className=
                          "admin-usuario"

                        key={
                          usuario.id
                        }
                      >

                        <div
                          className=
                            "admin-avatar"
                        >
                          {
                            usuario.nome
                              .charAt(0)
                              .toUpperCase()
                          }
                        </div>


                        <div
                          className=
                            "admin-usuario-info"
                        >

                          <div
                            className=
                              "admin-usuario-nome"
                          >

                            <strong>
                              {
                                usuario.nome
                              }
                            </strong>


                            {
                              usuario.tipo ===
                              'admin'
                              && (

                                <span
                                  className=
                                    "admin-badge"
                                >
                                  Admin
                                </span>

                              )
                            }

                          </div>


                          <span>
                            {
                              usuario.email
                            }
                          </span>

                        </div>


                        {
                          usuario.tipo !==
                          'admin'
                          && (

                            <button
                              type="button"

                              className=
                                "admin-excluir"

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

                          )
                        }

                      </article>

                    )
                  )
                }

              </div>

            </section>

          </main>

        </div>


        {/* =================================================
            MODAL EXCLUIR
           ================================================= */}

        {
          usuarioParaExcluir
          && (

            <div
              className=
                "admin-modal-overlay"

              role="presentation"

              onMouseDown={() =>
                setUsuarioParaExcluir(
                  null
                )
              }
            >

              <div
                className=
                  "admin-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby=
                  "tituloExcluirUsuario"

                onMouseDown={(
                  evento
                ) =>
                  evento
                    .stopPropagation()
                }
              >

                <span
                  className=
                    "admin-modal-icone"
                >
                  !
                </span>

                <h2
                  id=
                    "tituloExcluirUsuario"
                >
                  Excluir usuário?
                </h2>

                <p>
                  A conta de{' '}
                  <strong>
                    {
                      usuarioParaExcluir
                        .nome
                    }
                  </strong>{' '}
                  não poderá mais
                  acessar o sistema.
                </p>


                <div
                  className=
                    "admin-modal-acoes"
                >

                  <button
                    type="button"

                    className=
                      "admin-modal-cancelar"

                    onClick={() =>
                      setUsuarioParaExcluir(
                        null
                      )
                    }
                  >
                    Cancelar
                  </button>


                  <button
                    type="button"

                    className=
                      "admin-modal-confirmar"

                    onClick={
                      confirmarExclusao
                    }
                  >
                    Excluir usuário
                  </button>

                </div>

              </div>

            </div>

          )
        }

      </IonContent>

    </IonPage>

  );

};


export default AdminUsuarios;