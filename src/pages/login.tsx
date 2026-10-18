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
  const router = useIonRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);


  useEffect(() => {
    if (!estaAutenticado()) {
      return;
    }

    const usuario = obterUsuarioLogado();

    if (usuario?.tipo === 'admin') {
      router.push(
        '/admin/usuarios',
        'root',
        'replace'
      );

      return;
    }

    router.push(
      '/planejamentos',
      'root',
      'replace'
    );
  }, [router]);


  const entrar = async (
    evento: FormEvent
  ) => {
    evento.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }

    if (!senha) {
      setErro('Informe sua senha.');
      return;
    }

    setCarregando(true);

    try {
      const resultado = await fazerLogin(
        email,
        senha
      );

      if (!resultado.sucesso) {
        setErro(
          resultado.mensagem ||
          'Não foi possível entrar.'
        );

        return;
      }

      if (
        resultado.usuario?.tipo ===
        'admin'
      ) {
        router.push(
          '/admin/usuarios',
          'root',
          'replace'
        );

        return;
      }

      router.push(
        '/planejamentos',
        'root',
        'replace'
      );

    } catch (erro) {
      console.error(
        'Erro ao realizar login:',
        erro
      );

      setErro(
        'Não foi possível conectar ao servidor.'
      );

    } finally {
      setCarregando(false);
    }
  };


  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-auth"
      >

        <div className="pagina-auth">

          <div
            className="auth-decoracao auth-decoracao-esquerda"
            aria-hidden="true"
          />


          <main className="auth-container">

            <div className="auth-marca">

              <span
                className="auth-marca-simbolo"
                aria-hidden="true"
              />

              <span>
                Lousa
              </span>

            </div>


            <section className="auth-card">

              <span
                className="auth-fita"
                aria-hidden="true"
              />


              <div className="auth-cabecalho">

                <span className="auth-etiqueta">
                  bem-vindo de volta
                </span>

                <h1>
                  Entre na sua conta
                </h1>

                <p>
                  Acesse utilizando as credenciais
                  fornecidas pelo administrador.
                </p>

              </div>


              <form
                onSubmit={entrar}
                className="auth-formulario"
                noValidate
              >

                <div className="auth-campo">

                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="professor@email.com"
                    autoComplete="email"
                    value={email}
                    disabled={carregando}
                    aria-invalid={Boolean(erro)}
                    onChange={(evento) => {
                      setEmail(
                        evento.target.value
                      );

                      setErro('');
                    }}
                  />

                </div>


                <div className="auth-campo">

                  <label htmlFor="senha">
                    Senha
                  </label>


                  <div className="auth-senha-wrapper">

                    <input
                      id="senha"
                      name="senha"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                      value={senha}
                      disabled={carregando}
                      aria-invalid={Boolean(erro)}
                      onChange={(evento) => {
                        setSenha(
                          evento.target.value
                        );

                        setErro('');
                      }}
                    />


                    <button
                      type="button"
                      className="auth-mostrar-senha"
                      disabled={carregando}
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


                {erro && (
                  <div
                    className="auth-erro"
                    role="alert"
                    aria-live="assertive"
                  >
                    <span aria-hidden="true">
                      !
                    </span>

                    <p>
                      {erro}
                    </p>
                  </div>
                )}


                <button
                  type="submit"
                  className="auth-botao-principal"
                  disabled={carregando}
                  aria-busy={carregando}
                >
                  {carregando
                    ? 'Entrando...'
                    : 'Entrar'}
                </button>

              </form>


              <p className="auth-ja-tem-conta">
                Não possui acesso?
                Solicite uma conta ao administrador.
              </p>

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