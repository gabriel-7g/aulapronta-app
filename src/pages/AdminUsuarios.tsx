
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';

import {
  emailValido,
  obterToken,
  obterUsuarioLogado,
  sair
} from '../utils/auth';

import type { TipoUsuario } from '../utils/auth';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const mensagemErro = (erro: unknown, padrao: string) =>
  erro instanceof Error ? erro.message : padrao;

// Mantém a estrutura CSS dos campos existentes.
const Campo = ({
  id,
  rotulo,
  children
}: {
  id: string;
  rotulo: string;
  children: React.ReactNode;
}) => (
  <div className="admin-campo">
    <label htmlFor={id}>{rotulo}</label>
    {children}
  </div>
);

const AdminUsuarios: React.FC = () => {
  const router = useIonRouter();
  const usuarioLogado = obterUsuarioLogado();

  // Usuários e formulário de cadastro
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Mensagens e carregamento
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Exclusão
  const [usuarioParaExcluir, setUsuarioParaExcluir] =
    useState<UsuarioAdmin | null>(null);

  // Redefinição de senha
  const [usuarioParaRedefinir, setUsuarioParaRedefinir] =
    useState<UsuarioAdmin | null>(null);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erroRedefinicao, setErroRedefinicao] = useState('');
  const [redefinindo, setRedefinindo] = useState(false);

  const limparMensagens = () => {
    setErro('');
    setSucesso('');
  };

  const encerrarSessao = useCallback(() => {
    sair();
    router.push('/login', 'root', 'replace');
  }, [router]);

  // Requisições autenticadas à API
  const requisicao = useCallback(async <T,>(
    rota: string,
    opcoes: RequestInit = {}
  ): Promise<T> => {
    const token = obterToken();

    if (!token) {
      encerrarSessao();
      throw new Error('Sessão expirada.');
    }

    const resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opcoes.headers as Record<string, string> | undefined)
      }
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      if (resposta.status === 401) encerrarSessao();

      const erroApi = new Error(
        dados?.erro || 'Não foi possível concluir a operação.'
      ) as ErroApi;

      erroApi.status = resposta.status;
      throw erroApi;
    }

    return dados as T;
  }, [encerrarSessao]);

  // Carregar lista de usuários
  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);

    try {
      const dados = await requisicao<{ usuarios: UsuarioAdmin[] }>(
        '/api/usuarios'
      );

      setUsuarios(dados.usuarios);
    } catch (erro) {
      setErro(mensagemErro(erro, 'Não foi possível carregar os usuários.'));
    } finally {
      setCarregando(false);
    }
  }, [requisicao]);

  useEffect(() => {
    void carregarUsuarios();
  }, [carregarUsuarios]);

  // Cadastro de usuário
  const cadastrarUsuario = async (evento: FormEvent<HTMLFormElement>) => {
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
      setErro('A senha precisa ter pelo menos 6 caracteres.');
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
      setSucesso('Usuário criado com sucesso.');
    } catch (erro) {
      setErro(mensagemErro(erro, 'Não foi possível criar o usuário.'));
    } finally {
      setSalvando(false);
    }
  };

  // Exclusão de usuário
  const confirmarExclusao = async () => {
    if (!usuarioParaExcluir || excluindo) return;

    limparMensagens();
    setExcluindo(true);

    try {
      await requisicao(`/api/usuarios/${usuarioParaExcluir.id}`, {
        method: 'DELETE'
      });

      setUsuarioParaExcluir(null);
      await carregarUsuarios();
      setSucesso('Usuário excluído com sucesso.');
    } catch (erro) {
      setErro(mensagemErro(erro, 'Não foi possível excluir o usuário.'));
      setUsuarioParaExcluir(null);
    } finally {
      setExcluindo(false);
    }
  };

  // Redefinição de senha
  const abrirRedefinicao = (usuario: UsuarioAdmin) => {
    limparMensagens();
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setErroRedefinicao('');
    setUsuarioParaRedefinir(usuario);
  };

  const fecharRedefinicao = () => {
    if (redefinindo) return;

    setUsuarioParaRedefinir(null);
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setErroRedefinicao('');
  };

  const salvarNovaSenha = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!usuarioParaRedefinir || redefinindo) return;

    if (
      novaSenha.trim().length < 10 ||
      new TextEncoder().encode(novaSenha).length > 72
    ) {
      setErroRedefinicao(
        'A senha deve ter pelo menos 10 caracteres e no máximo 72 bytes.'
      );
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroRedefinicao('As senhas não coincidem.');
      return;
    }

    setRedefinindo(true);
    setErroRedefinicao('');

    try {
      await requisicao(`/api/usuarios/${usuarioParaRedefinir.id}/senha`, {
        method: 'PUT',
        body: JSON.stringify({ novaSenha })
      });

      const professor = usuarioParaRedefinir.nome;
      setUsuarioParaRedefinir(null);
      setNovaSenha('');
      setConfirmarNovaSenha('');

      limparMensagens();
      setSucesso(`Senha de ${professor} redefinida com sucesso.`);
    } catch (erro) {
      setErroRedefinicao(
        mensagemErro(erro, 'Não foi possível redefinir a senha.')
      );
    } finally {
      setRedefinindo(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="admin-conteudo">
        <div className="admin-pagina">

          {/* Cabeçalho */}
          <header className="admin-cabecalho">
            <div>
              <div className="admin-marca">
                <span className="admin-marca-simbolo" aria-hidden="true" />
                <span>Lousa</span>
              </div>

              <p className="admin-etiqueta">painel administrativo</p>
              <h1>Gerenciar usuários</h1>

              <p className="admin-subtitulo">
                Olá, {usuarioLogado?.nome}.
                Cadastre e gerencie quem pode acessar o sistema.
              </p>
            </div>

            <div className="admin-acoes-topo">
              <button
                type="button"
                className="admin-botao-secundario"
                onClick={() => router.push('/planejamentos', 'forward')}
              >
                Meus planejamentos
              </button>

              <button
                type="button"
                className="admin-botao-sair"
                onClick={encerrarSessao}
              >
                Sair
              </button>
            </div>
          </header>

          {/* Mensagens */}
          {erro && (
            <div className="admin-mensagem admin-mensagem-erro" role="alert">
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

            {/* Formulário de cadastro */}
            <section className="admin-card admin-card-cadastro">
              <div className="admin-card-cabecalho">
                <span>NOVO USUÁRIO</span>
                <h2>Criar uma conta</h2>
                <p>
                  Somente você, administrador,
                  pode cadastrar novos usuários.
                </p>
              </div>

              <form onSubmit={cadastrarUsuario} className="admin-formulario">
                <Campo id="adminNome" rotulo="Nome">
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
                </Campo>

                <Campo id="adminEmail" rotulo="E-mail">
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
                </Campo>

                <Campo id="adminSenha" rotulo="Senha">
                  <div className="admin-senha-wrapper">
                    <input
                      id="adminSenha"
                      type={mostrarSenha ? 'text' : 'password'}
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
                      aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={mostrarSenha}
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                    >
                      {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </Campo>

                <Campo id="adminConfirmarSenha" rotulo="Confirmar senha">
                  <input
                    id="adminConfirmarSenha"
                    type={mostrarSenha ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Digite novamente"
                    value={confirmarSenha}
                    disabled={salvando}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value);
                      limparMensagens();
                    }}
                  />
                </Campo>

                <button
                  type="submit"
                  className="admin-botao-principal"
                  disabled={salvando}
                  aria-busy={salvando}
                >
                  {salvando ? 'Criando...' : 'Criar usuário'}
                </button>
              </form>
            </section>

            {/* Lista de usuários */}
            <section className="admin-card admin-card-lista">
              <div className="admin-lista-topo">
                <div>
                  <span className="admin-label">CONTAS</span>
                  <h2>Usuários cadastrados</h2>
                </div>
                <span className="admin-contador">{usuarios.length}</span>
              </div>

              <div className="admin-lista">
                {carregando ? (
                  <p>Carregando usuários...</p>
                ) : usuarios.length === 0 ? (
                  <p>Nenhum usuário cadastrado.</p>
                ) : (
                  usuarios.map((usuario) => (
                    <article className="admin-usuario" key={usuario.id}>
                      <div className="admin-avatar">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </div>

                      <div className="admin-usuario-info">
                        <div className="admin-usuario-nome">
                          <strong>{usuario.nome}</strong>

                          {usuario.tipo === 'admin' && (
                            <span className="admin-badge">Admin</span>
                          )}
                        </div>
                        <span>{usuario.email}</span>
                      </div>

                      {usuario.tipo !== 'admin' && (
                        <div className="admin-usuario-acoes">
                          <button
                            type="button"
                            className="admin-redefinir"
                            disabled={excluindo || redefinindo}
                            aria-label={`Redefinir senha de ${usuario.nome}`}
                            onClick={() => abrirRedefinicao(usuario)}
                          >
                            Redefinir senha
                          </button>

                          <button
                            type="button"
                            className="admin-excluir"
                            disabled={excluindo || redefinindo}
                            aria-label={`Excluir usuário ${usuario.nome}`}
                            onClick={() => {
                              limparMensagens();
                              setUsuarioParaExcluir(usuario);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>

        {/* Modal de exclusão */}
        {usuarioParaExcluir && (
          <div
            className="admin-modal-overlay"
            role="presentation"
            onMouseDown={() => {
              if (!excluindo) setUsuarioParaExcluir(null);
            }}
          >
            <div
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tituloExcluirUsuario"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="admin-modal-icone" aria-hidden="true">!</span>
              <h2 id="tituloExcluirUsuario">Excluir usuário?</h2>

              <p>
                A conta de <strong>{usuarioParaExcluir.nome}</strong>{' '}
                não poderá mais acessar o sistema.
              </p>

              <div className="admin-modal-acoes">
                <button
                  type="button"
                  className="admin-modal-cancelar"
                  disabled={excluindo}
                  onClick={() => setUsuarioParaExcluir(null)}
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
                  {excluindo ? 'Excluindo...' : 'Excluir usuário'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de redefinição de senha */}
        {usuarioParaRedefinir && (
          <div
            className="admin-modal-overlay"
            role="presentation"
            onMouseDown={() => {
              if (!redefinindo) fecharRedefinicao();
            }}
          >
            <div
              className="admin-modal admin-redefinicao"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tituloRedefinirSenha"
              aria-describedby="descricaoRedefinirSenha"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h2 id="tituloRedefinirSenha">Redefinir senha</h2>

              <p id="descricaoRedefinirSenha">
                Defina uma nova senha para{' '}
                <strong>{usuarioParaRedefinir.nome}</strong>.
              </p>

              <form onSubmit={salvarNovaSenha}>
                <Campo id="adminNovaSenha" rotulo="Nova senha">
                  <input
                    id="adminNovaSenha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo de 10 caracteres"
                    minLength={10}
                    value={novaSenha}
                    required
                    disabled={redefinindo}
                    autoFocus
                    onChange={(e) => {
                      setNovaSenha(e.target.value);
                      setErroRedefinicao('');
                    }}
                  />
                </Campo>

                <Campo id="adminConfirmarNovaSenha" rotulo="Confirmar nova senha">
                  <input
                    id="adminConfirmarNovaSenha"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Digite a senha novamente"
                    value={confirmarNovaSenha}
                    required
                    disabled={redefinindo}
                    onChange={(e) => {
                      setConfirmarNovaSenha(e.target.value);
                      setErroRedefinicao('');
                    }}
                  />
                </Campo>

                {erroRedefinicao && (
                  <p className="admin-redefinicao-erro" role="alert">
                    {erroRedefinicao}
                  </p>
                )}

                <div className="admin-modal-acoes">
                  <button
                    type="button"
                    className="admin-modal-cancelar"
                    disabled={redefinindo}
                    onClick={fecharRedefinicao}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="admin-modal-confirmar admin-confirmar-senha"
                    disabled={redefinindo}
                    aria-busy={redefinindo}
                  >
                    {redefinindo ? 'Salvando...' : 'Salvar nova senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default AdminUsuarios;
