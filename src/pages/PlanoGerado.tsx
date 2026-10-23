import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  useIonRouter,
  useIonViewWillEnter
} from '@ionic/react';

import { exportarPlanejamentoPdf } from '../services/pdfService';
import { salvarPlanejamento } from '../services/planejamentoService';
import { obterUsuarioLogado } from '../utils/auth';
import {
  limparContextoPlano,
  obterContextoPlano
} from '../utils/planoSessao';

import type {
  ConteudoPlano,
  SecaoPlano
} from '../types/planejamento';

import './PlanoGerado.css';

const Resumo: React.FC<{ rotulo: string; valor: string }> = ({
  rotulo,
  valor
}) => (
  <div>
    <span className="resumo-rotulo">{rotulo}</span>
    <strong>{valor}</strong>
  </div>
);

const PlanoGerado: React.FC = () => {
  const router = useIonRouter();
  const usuario = obterUsuarioLogado();

  const [contexto, setContexto] = useState(() =>
    obterContextoPlano(usuario?.id)
  );

  const [conteudo, setConteudo] = useState<ConteudoPlano | null>(() =>
    contexto?.planoSelecionado?.conteudo ??
    contexto?.conteudoGerado ??
    null
  );

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  useIonViewWillEnter(() => {
    const atual = obterContextoPlano(usuario?.id);

    setContexto(atual);
    setConteudo(
      atual?.planoSelecionado?.conteudo ??
      atual?.conteudoGerado ??
      null
    );

    setEditando(false);
    setSalvando(false);
    setMensagemSucesso('');
    setMensagemErro('');
  });

  const atualizarTitulo = (valor: string) => {
    setConteudo((anterior) =>
      anterior ? { ...anterior, titulo: valor } : null
    );
  };

  const atualizarSecao = (
    indice: number,
    campo: keyof SecaoPlano,
    valor: string
  ) => {
    setConteudo((anterior) =>
      anterior
        ? {
            ...anterior,
            secoes: anterior.secoes.map((secao, i) =>
              i === indice
                ? { ...secao, [campo]: valor }
                : secao
            )
          }
        : null
    );
  };

  const adicionarSecao = () => {
    setConteudo((anterior) =>
      anterior
        ? {
            ...anterior,
            secoes: [
              ...anterior.secoes,
              { titulo: '', conteudo: '' }
            ]
          }
        : null
    );
  };

  const removerSecao = (indice: number) => {
    setConteudo((anterior) =>
      anterior && anterior.secoes.length > 1
        ? {
            ...anterior,
            secoes: anterior.secoes.filter((_, i) => i !== indice)
          }
        : anterior
    );
  };

  const voltarPlanejamentos = () => {
    limparContextoPlano();
    window.location.replace('/planejamentos');
  };

  if (!usuario) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="pagina-plano-gerado">
            <main className="plano-container">
              <section className="folha-plano">
                <div className="plano-cabecalho">
                  <span className="plano-etiqueta">acesso inválido</span>
                  <h1>Sessão não encontrada</h1>
                  <p>Faça login novamente para acessar seus planejamentos.</p>

                  <div className="acoes-plano">
                    <button
                      type="button"
                      className="botao-salvar"
                      onClick={() => router.push('/login', 'root', 'replace')}
                    >
                      Ir para o login
                    </button>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!contexto || !conteudo) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="pagina-plano-gerado">
            <header className="plano-topo">
              <div className="topo-espaco" />
              <div className="marca-plano">
                <span className="marca-simbolo-plano" />
                Lousa
              </div>
              <div className="topo-espaco" />
            </header>

            <main className="plano-container">
              <section className="folha-plano">
                <div className="plano-cabecalho">
                  <span className="plano-etiqueta">
                    planejamento indisponível
                  </span>
                  <h1>Nenhum conteúdo foi gerado</h1>
                  <p>
                    O planejamento não possui conteúdo válido gerado pela IA.
                  </p>

                  <div className="acoes-plano">
                    <button
                      type="button"
                      className="botao-salvar"
                      onClick={() => router.push('/home', 'root', 'replace')}
                    >
                      Criar novamente
                    </button>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const { dados, planoSelecionado } = contexto;

  const exportarPdf = () => {
    try {
      setMensagemErro('');

      exportarPlanejamentoPdf({
        dados,
        conteudo,
        professor: usuario.nome
      });
    } catch (erro) {
      console.error('Erro ao exportar PDF:', erro);
      setMensagemErro('Não foi possível gerar o PDF. Tente novamente.');
    }
  };

  const salvarPlano = async () => {
    if (salvando) return;

    if (
      !conteudo.titulo.trim() ||
      conteudo.secoes.length < 1 ||
      conteudo.secoes.some(
        (secao) => !secao.titulo.trim() || !secao.conteudo.trim()
      )
    ) {
      setMensagemErro(
        'Preencha o título do plano e o título e conteúdo de todos os tópicos.'
      );
      return;
    }

    setSalvando(true);
    setMensagemErro('');
    setMensagemSucesso('');

    try {
      await salvarPlanejamento(
        dados,
        conteudo,
        planoSelecionado?.id
      );

      setEditando(false);

      setMensagemSucesso(
        planoSelecionado
          ? 'Alterações salvas com sucesso.'
          : 'Planejamento salvo com sucesso.'
      );

      limparContextoPlano();

      window.setTimeout(() => {
        window.location.replace('/planejamentos');
      }, 700);
    } catch (erro) {
      console.error('Erro ao salvar planejamento:', erro);

      setMensagemErro(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível salvar o planejamento.'
      );

      setSalvando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="pagina-plano-gerado">
          <header className="plano-topo">
            <button
              type="button"
              className="botao-voltar"
              disabled={salvando}
              onClick={voltarPlanejamentos}
            >
              ← Voltar
            </button>

            <div className="marca-plano">
              <span className="marca-simbolo-plano" />
              Lousa
            </div>

            <div className="topo-espaco" />
          </header>

          <main className="plano-container">
            <section className="plano-cabecalho">
              <span className="plano-etiqueta">planejamento</span>

              {editando ? (
                <input
                  className="titulo-edicao"
                  value={conteudo.titulo}
                  aria-label="Título do planejamento"
                  onChange={(e) => atualizarTitulo(e.target.value)}
                />
              ) : (
                <h1>{conteudo.titulo}</h1>
              )}

              <p>
                Seu planejamento está pronto. Você pode revisar,
                editar, exportar e salvar antes de utilizá-lo.
              </p>
            </section>

            <section className="resumo-aula">
              {dados.nivelEnsino && (
                <Resumo rotulo="Nível" valor={dados.nivelEnsino} />
              )}

              <Resumo rotulo="Matéria" valor={dados.materia} />
              <Resumo rotulo="Turma / período" valor={dados.turma} />
              <Resumo rotulo="Duração" valor={`${dados.duracao} min`} />
            </section>

            <section className="folha-plano">
              <span className="fita-plano" aria-hidden="true" />

              {conteudo.secoes.map((secao, indice) => (
                <article className="bloco-plano" key={indice}>
                  {editando ? (
                    <>
                      <input
                        className="campo-titulo-secao"
                        value={secao.titulo}
                        placeholder="Título do tópico"
                        aria-label={`Título do tópico ${indice + 1}`}
                        onChange={(e) =>
                          atualizarSecao(indice, 'titulo', e.target.value)
                        }
                      />

                      <textarea
                        className="campo-edicao-plano"
                        value={secao.conteudo}
                        rows={6}
                        aria-label={`Conteúdo de ${secao.titulo || `tópico ${indice + 1}`}`}
                        onChange={(e) =>
                          atualizarSecao(indice, 'conteudo', e.target.value)
                        }
                      />

                      {conteudo.secoes.length > 1 && (
                        <button
                          type="button"
                          className="botao-remover-secao"
                          onClick={() => removerSecao(indice)}
                        >
                          Remover tópico
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h2>{secao.titulo}</h2>
                      <p className="texto-secao-livre">{secao.conteudo}</p>
                    </>
                  )}
                </article>
              ))}

              {editando && (
                <button
                  type="button"
                  className="botao-editar"
                  onClick={adicionarSecao}
                >
                  + Adicionar tópico
                </button>
              )}
            </section>

            {dados.observacoes && (
              <section className="observacao-professor">
                <span>Observação informada pelo professor</span>
                <p>{dados.observacoes}</p>
              </section>
            )}

            {mensagemSucesso && (
              <div className="mensagem-sucesso" role="status" aria-live="polite">
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>{mensagemSucesso}</strong>
                  <p>Abrindo seus planejamentos...</p>
                </div>
              </div>
            )}

            {mensagemErro && (
              <div className="mensagem-erro" role="alert" aria-live="assertive">
                {mensagemErro}
              </div>
            )}

            <div className="acoes-plano">
              {!editando && (
                <button
                  type="button"
                  className="botao-editar"
                  disabled={salvando}
                  onClick={() => {
                    setMensagemErro('');
                    setMensagemSucesso('');
                    setEditando(true);
                  }}
                >
                  <span aria-hidden="true">✎</span>
                  Editar planejamento
                </button>
              )}

              <button
                type="button"
                className="botao-editar botao-exportar-pdf"
                disabled={salvando}
                onClick={exportarPdf}
              >
                PDF <span>Exportar PDF</span>
              </button>

              <button
                type="button"
                className={
                  editando
                    ? 'botao-salvar botao-salvar-grande'
                    : 'botao-salvar'
                }
                disabled={salvando}
                aria-busy={salvando}
                onClick={salvarPlano}
              >
                <span aria-hidden="true">✓</span>
                {salvando
                  ? 'Salvando...'
                  : editando
                    ? 'Salvar alterações'
                    : 'Salvar planejamento'}
              </button>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PlanoGerado;