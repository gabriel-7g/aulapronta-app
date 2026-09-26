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
  criarUsuario
} from '../utils/auth';

import './Auth.css';

const CriarConta: React.FC = () => {
  const router =
    useIonRouter();

  const [nome, setNome] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [senha, setSenha] =
    useState('');

  const [
    confirmarSenha,
    setConfirmarSenha
  ] = useState('');

  const [
    mostrarSenha,
    setMostrarSenha
  ] = useState(false);

  const [erro, setErro] =
    useState('');

  const [sucesso, setSucesso] =
    useState('');

  const criarConta = (
    evento: FormEvent
  ) => {
    evento.preventDefault();

    setErro('');
    setSucesso('');

    if (nome.trim().length < 2) {
      setErro(
        'Informe seu nome.'
      );

      return;
    }

    if (!email.trim()) {
      setErro(
        'Informe seu e-mail.'
      );

      return;
    }

    if (senha.length < 6) {
      setErro(
        'A senha precisa ter pelo menos 6 caracteres.'
      );

      return;
    }

    if (
      senha !== confirmarSenha
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

    if (!resultado.sucesso) {
      setErro(
        resultado.mensagem ||
          'Não foi possível criar a conta.'
      );

      return;
    }

    setSucesso(
      'Conta criada com sucesso.'
    );

    /*
      Aguarda um pequeno momento
      apenas para mostrar o sucesso.
    */
    window.setTimeout(() => {
      router.push(
        '/login',
        'back'
      );
    }, 700);
  };

  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-auth"
      >

        <div className="pagina-auth">

          <main className="auth-container">

            <button
              type="button"
              className="auth-voltar"
              onClick={() =>
                router.push(
                  '/login',
                  'back'
                )
              }
            >
              ← Voltar
            </button>


            <div className="auth-marca">

              <span className="auth-marca-simbolo" />

              <span>
                Lousa
              </span>

            </div>


            <section className="auth-card">

              <span className="auth-fita" />

              <div className="auth-cabecalho">

                <span className="auth-etiqueta">
                  primeira aula?
                </span>

                <h1>
                  Crie sua conta
                </h1>

                <p>
                  Comece a organizar seus
                  planejamentos de aula.
                </p>

              </div>


              <form
                className="auth-formulario"
                onSubmit={criarConta}
              >

                {/* NOME */}

                <div className="auth-campo">

                  <label htmlFor="nome">
                    Nome
                  </label>

                  <input
                    id="nome"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => {
                      setNome(
                        e.target.value
                      );

                      setErro('');
                    }}
                  />

                </div>


                {/* EMAIL */}

                <div className="auth-campo">

                  <label htmlFor="emailCadastro">
                    E-mail
                  </label>

                  <input
                    id="emailCadastro"
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

                  <label htmlFor="senhaCadastro">
                    Senha
                  </label>

                  <div className="auth-senha-wrapper">

                    <input
                      id="senhaCadastro"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Mínimo de 6 caracteres"
                      autoComplete="new-password"
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


                {/* CONFIRMAR SENHA */}

                <div className="auth-campo">

                  <label htmlFor="confirmarSenha">
                    Confirmar senha
                  </label>

                  <input
                    id="confirmarSenha"
                    type={
                      mostrarSenha
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(
                        e.target.value
                      );

                      setErro('');
                    }}
                  />

                </div>


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


                {sucesso && (

                  <div className="auth-sucesso">

                    <span>
                      ✓
                    </span>

                    <p>
                      {sucesso}
                    </p>

                  </div>

                )}


                <button
                  type="submit"
                  className="auth-botao-principal"
                >
                  Criar conta
                </button>

              </form>


              <p className="auth-ja-tem-conta">

                Já possui uma conta?

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/login',
                      'back'
                    )
                  }
                >
                  Entrar
                </button>

              </p>

            </section>

          </main>

        </div>

      </IonContent>

    </IonPage>
  );
};

export default CriarConta;