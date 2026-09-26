import React, {
  FormEvent,
  useState
} from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  estaAutenticado,
  fazerLogin
} from '../utils/auth';

import './Auth.css';

const Login: React.FC = () => {
  const router =
    useIonRouter();

  const [email, setEmail] =
    useState('');

  const [senha, setSenha] =
    useState('');

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [erro, setErro] =
    useState('');

  const [carregando, setCarregando] =
    useState(false);

  /*
    Se já existe uma sessão,
    não faz sentido permanecer
    no login.
  */
  React.useEffect(() => {
    if (estaAutenticado()) {
      router.push(
        '/planejamentos',
        'root'
      );
    }
  }, [router]);

  const entrar = (
    evento: FormEvent
  ) => {
    evento.preventDefault();

    setErro('');

    if (!email.trim()) {
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

    if (!resultado.sucesso) {
      setErro(
        resultado.mensagem ||
          'Não foi possível entrar.'
      );

      setCarregando(false);

      return;
    }

    setCarregando(false);

    router.push(
      '/planejamentos',
      'root'
    );
  };

  const abrirCadastro = () => {
    router.push(
      '/criar-conta',
      'forward'
    );
  };

  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-auth"
      >

        <div className="pagina-auth">

          <div className="auth-decoracao auth-decoracao-esquerda" />

          <main className="auth-container">

            {/* LOGO */}

            <div className="auth-marca">

              <span className="auth-marca-simbolo" />

              <span>
                Lousa
              </span>

            </div>


            {/* CARTÃO */}

            <section className="auth-card">

              <span className="auth-fita" />

              <div className="auth-cabecalho">

                <span className="auth-etiqueta">
                  bem-vindo de volta
                </span>

                <h1>
                  Entre na sua conta
                </h1>

                <p>
                  Continue de onde parou e
                  acesse seus planejamentos.
                </p>

              </div>


              <form
                onSubmit={entrar}
                className="auth-formulario"
              >

                {/* EMAIL */}

                <div className="auth-campo">

                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="professor@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(
                        e.target.value
                      );

                      setErro('');
                    }}
                  />

                </div>


                {/* SENHA */}

                <div className="auth-campo">

                  <label htmlFor="senha">
                    Senha
                  </label>

                  <div className="auth-senha-wrapper">

                    <input
                      id="senha"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      value={senha}
                      onChange={(e) => {
                        setSenha(
                          e.target.value
                        );

                        setErro('');
                      }}
                    />

                    <button
                      type="button"
                      className="auth-mostrar-senha"
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


                {/* ERRO */}

                {erro && (

                  <div
                    className="auth-erro"
                    role="alert"
                  >
                    <span>
                      !
                    </span>

                    <p>
                      {erro}
                    </p>
                  </div>

                )}


                {/* ENTRAR */}

                <button
                  type="submit"
                  className="auth-botao-principal"
                  disabled={carregando}
                >

                  {carregando
                    ? 'Entrando...'
                    : 'Entrar'}

                </button>

              </form>


              {/* DIVISÃO */}

              <div className="auth-divisor">

                <span />

                <p>
                  ainda não possui conta?
                </p>

                <span />

              </div>


              {/* CRIAR CONTA */}

              <button
                type="button"
                className="auth-botao-secundario"
                onClick={abrirCadastro}
              >
                Criar uma conta
              </button>

            </section>

            <p className="auth-rodape">
              Planejamentos mais simples.
              Aulas mais organizadas.
            </p>

          </main>

        </div>

      </IonContent>

    </IonPage>
  );
};

export default Login;