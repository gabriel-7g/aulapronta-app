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
  estaAutenticado,
  fazerLogin,
  obterUsuarioLogado
} from '../utils/auth';

import './Auth.css';


const Login: React.FC = () => {

  const router =
    useIonRouter();

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
    mostrarSenha,
    setMostrarSenha
  ] =
    useState(false);

  const [
    erro,
    setErro
  ] =
    useState('');

  const [
    carregando,
    setCarregando
  ] =
    useState(false);


  /* =====================================================
     SE JÁ ESTIVER LOGADO
     ===================================================== */

  useEffect(() => {

    if (
      !estaAutenticado()
    ) {
      return;
    }

    const usuario =
      obterUsuarioLogado();

    if (
      usuario?.tipo ===
      'admin'
    ) {

      router.push(
        '/admin/usuarios',
        'root'
      );

      return;
    }

    router.push(
      '/planejamentos',
      'root'
    );

  }, [router]);


  /* =====================================================
     ENTRAR
     ===================================================== */

  const entrar = (
    evento: FormEvent
  ) => {

    evento.preventDefault();

    setErro('');

    if (
      !email.trim()
    ) {

      setErro(
        'Informe seu e-mail.'
      );

      return;
    }

    if (!senha) {

      setErro(
        'Informe sua senha.'
      );

      return;
    }

    setCarregando(true);

    const resultado =
      fazerLogin(
        email,
        senha
      );

    if (
      !resultado.sucesso
    ) {

      setErro(
        resultado.mensagem ||
        'Não foi possível entrar.'
      );

      setCarregando(false);

      return;
    }

    setCarregando(false);

    /*
      Administrador vai para
      gerenciamento de usuários.

      Usuário comum vai para
      seus planejamentos.
    */

    if (
      resultado.usuario
        ?.tipo ===
      'admin'
    ) {

      router.push(
        '/admin/usuarios',
        'root'
      );

      return;
    }

    router.push(
      '/planejamentos',
      'root'
    );

  };


  return (

    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-auth"
      >

        <div className="pagina-auth">

          <div
            className=
              "auth-decoracao auth-decoracao-esquerda"
          />

          <main
            className="auth-container"
          >

            {/* LOGO */}

            <div
              className="auth-marca"
            >

              <span
                className=
                  "auth-marca-simbolo"
              />

              <span>
                Lousa
              </span>

            </div>


            {/* CARTÃO */}

            <section
              className="auth-card"
            >

              <span
                className="auth-fita"
              />


              <div
                className="auth-cabecalho"
              >

                <span
                  className="auth-etiqueta"
                >
                  bem-vindo de volta
                </span>

                <h1>
                  Entre na sua conta
                </h1>

                <p>
                  Acesse utilizando
                  as credenciais
                  fornecidas pelo
                  administrador.
                </p>

              </div>


              <form
                onSubmit={entrar}
                className=
                  "auth-formulario"
                noValidate
              >

                {/* E-MAIL */}

                <div
                  className="auth-campo"
                >

                  <label
                    htmlFor="email"
                  >
                    E-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder=
                      "professor@email.com"
                    autoComplete="email"
                    value={email}

                    aria-invalid={
                      Boolean(erro)
                    }

                    onChange={(
                      evento
                    ) => {

                      setEmail(
                        evento
                          .target
                          .value
                      );

                      setErro('');

                    }}
                  />

                </div>


                {/* SENHA */}

                <div
                  className="auth-campo"
                >

                  <label
                    htmlFor="senha"
                  >
                    Senha
                  </label>


                  <div
                    className=
                      "auth-senha-wrapper"
                  >

                    <input
                      id="senha"
                      name="senha"

                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }

                      placeholder=
                        "Digite sua senha"

                      autoComplete=
                        "current-password"

                      value={senha}

                      onChange={(
                        evento
                      ) => {

                        setSenha(
                          evento
                            .target
                            .value
                        );

                        setErro('');

                      }}
                    />


                    <button
                      type="button"

                      className=
                        "auth-mostrar-senha"

                      aria-label={
                        mostrarSenha
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      }

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


                {/* ERRO */}

                {erro && (

                  <div
                    className="auth-erro"
                    role="alert"
                    aria-live="assertive"
                  >

                    <span>
                      !
                    </span>

                    <p>
                      {erro}
                    </p>

                  </div>

                )}


                {/* BOTÃO */}

                <button
                  type="submit"

                  className=
                    "auth-botao-principal"

                  disabled={
                    carregando
                  }
                >

                  {
                    carregando
                      ? 'Entrando...'
                      : 'Entrar'
                  }

                </button>

              </form>


              <p
                className=
                  "auth-ja-tem-conta"
              >
                Não possui acesso?
                Solicite uma conta
                ao administrador.
              </p>

            </section>


            <p
              className=
                "auth-rodape"
            >
              Planejamentos mais
              simples. Aulas mais
              organizadas.
            </p>

          </main>

        </div>

      </IonContent>

    </IonPage>

  );

};


export default Login;