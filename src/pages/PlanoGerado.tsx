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

import type { ConteudoPlano } from '../types/planejamento';

import './PlanoGerado.css';

interface ResumoProps {
  rotulo: string;
  valor: string;
}

interface BlocoPlanoProps {
  numero: string;
  titulo: string;
  campo: keyof ConteudoPlano;
  valor: string;
  editando: boolean;
  atualizar: (
    campo: keyof ConteudoPlano,
    valor: string
  ) => void;
}

const Resumo: React.FC<ResumoProps> = ({ rotulo, valor }) => (
  <div>
    <span className="resumo-rotulo">{rotulo}</span>
    <strong>{valor}</strong>
  </div>
);

const BlocoPlano: React.FC<BlocoPlanoProps> = ({
  numero,
  titulo,
  campo,
  valor,
  editando,
  atualizar
}) => (
  <article className="bloco-plano">
    <div className="bloco-cabecalho">
      <span className="bloco-numero">{numero}</span>
      <h2>{titulo}</h2>
    </div>

    {editando ? (
      <textarea
        className="campo-edicao-plano"
        aria-label={titulo}
        value={valor}
        onChange={(e) => atualizar(campo, e.target.value)}
      />
    ) : (
      <p>{valor}</p>
    )}
  </article>
);

const PlanoGerado: React.FC = () => {
  const router = useIonRouter();
  const usuario = obterUsuarioLogado();

  const [contexto, setContexto] = useState(() =>
    obterContextoPlano(usuario?.id)
  );

  const [conteudo, setConteudo] = useState<ConteudoPlano | null>(
    () =>
      contexto?.planoSelecionado?.conteudo ??
      contexto?.conteudoGerado ??
      null
  );

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  useIonViewWillEnter(() => {
    const contextoAtual = obterContextoPlano(usuario?.id);

    setContexto(contextoAtual);
    setConteudo(
      contextoAtual?.planoSelecionado?.conteudo ??
      contextoAtual?.conteudoGerado ??
      null
    );

    setEditando(false);
    setSalvando(false);
    setMensagemSucesso('');
    setMensagemErro('');
  });

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
                <span className="fita-plano" aria-hidden="true" />

                <div className="plano-cabecalho">
                  <span className="plano-etiqueta">acesso inválido</span>

                  <h1>Sessão não encontrada</h1>

                  <p>
                    Faça login novamente para acessar seus planejamentos.
                  </p>

                  <div className="acoes-plano">
                    <button
                      type="button"
                      className="botao-salvar botao-salvar-grande"
                      onClick={() =>
                        router.push('/login', 'root', 'replace')
                      }
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
                <span className="fita-plano" aria-hidden="true" />

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
                      className="botao-salvar botao-salvar-grande"
                      onClick={() =>
                        router.push('/home', 'root', 'replace')
                      }
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

  const atualizarCampo = (
    campo: keyof ConteudoPlano,
    valor: string
  ) => {
    setConteudo((anterior) =>
      anterior
        ? { ...anterior, [campo]: valor }
        : anterior
    );
  };

  const editarPlano = () => {
    setMensagemSucesso('');
    setMensagemErro('');
    setEditando(true);
  };

  const exportarPdf = () => {
    if (!conteudo) return;

    try {
      setMensagemErro('');

      exportarPlanejamentoPdf({
        dados,
        conteudo,
        professor: usuario.nome
      });
    } catch (erro) {
      console.error('Erro ao exportar PDF:', erro);

      setMensagemErro(
        'Não foi possível gerar o PDF. Tente novamente.'
      );
    }
  };

  const salvarPlano = async () => {
    if (salvando || !conteudo) return;

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
                  onChange={(e) =>
                    atualizarCampo('titulo', e.target.value)
                  }
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

              <BlocoPlano
                numero="01"
                titulo="Objetivo"
                campo="objetivo"
                valor={conteudo.objetivo}
                editando={editando}
                atualizar={atualizarCampo}
              />

              <BlocoPlano
                numero="02"
                titulo="Introdução"
                campo="introducao"
                valor={conteudo.introducao}
                editando={editando}
                atualizar={atualizarCampo}
              />

              <BlocoPlano
                numero="03"
                titulo="Desenvolvimento"
                campo="desenvolvimento"
                valor={conteudo.desenvolvimento}
                editando={editando}
                atualizar={atualizarCampo}
              />

              <BlocoPlano
                numero="04"
                titulo="Atividade"
                campo="atividade"
                valor={conteudo.atividade}
                editando={editando}
                atualizar={atualizarCampo}
              />

              <BlocoPlano
                numero="05"
                titulo="Recursos"
                campo="recursos"
                valor={conteudo.recursos}
                editando={editando}
                atualizar={atualizarCampo}
              />

              <BlocoPlano
                numero="06"
                titulo="Avaliação"
                campo="avaliacao"
                valor={conteudo.avaliacao}
                editando={editando}
                atualizar={atualizarCampo}
              />
            </section>

            {dados.observacoes && (
              <section className="observacao-professor">
                <span>Observação informada pelo professor</span>
                <p>{dados.observacoes}</p>
              </section>
            )}

            {mensagemSucesso && (
              <div
                className="mensagem-sucesso"
                role="status"
                aria-live="polite"
              >
                <span aria-hidden="true">✓</span>

                <div>
                  <strong>{mensagemSucesso}</strong>
                  <p>Abrindo seus planejamentos...</p>
                </div>
              </div>
            )}

            {mensagemErro && (
              <div
                className="mensagem-erro"
                role="alert"
                aria-live="assertive"
              >
                {mensagemErro}
              </div>
            )}

            <div className="acoes-plano">

              {!editando && (
                <button
                  type="button"
                  className="botao-editar"
                  disabled={salvando}
                  onClick={editarPlano}
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
                PDF
                <span>Exportar PDF</span>
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