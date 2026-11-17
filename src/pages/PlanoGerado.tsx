
import React, { useState } from 'react';
import { IonContent, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';

import EditarComIa from '../components/EditarComIa';
import { exportarPlanejamentoPdf } from '../services/pdfService';
import { salvarPlanejamento } from '../services/planejamentoService';
import { obterUsuarioLogado } from '../utils/auth';
import { limparContextoPlano, obterContextoPlano } from '../utils/planoSessao';

import type { ConteudoPlano, SecaoPlano } from '../types/planejamento';
import './PlanoGerado.css';

const Resumo = ({ rotulo, valor }: { rotulo: string; valor: string }) => (
  <div>
    <span className="resumo-rotulo">{rotulo}</span>
    <strong>{valor}</strong>
  </div>
);

type AvisoProps = {
  etiqueta: string;
  titulo: string;
  descricao: string;
  botao: string;
  onClick: () => void;
  mostrarTopo?: boolean;
};

// Tela reutilizável para avisos de acesso e planejamento indisponível
const TelaAviso = ({
  etiqueta, titulo, descricao, botao, onClick, mostrarTopo = false
}: AvisoProps) => (
  <IonPage>
    <IonContent fullscreen>
      <div className="pagina-plano-gerado">
        {mostrarTopo && (
          <header className="plano-topo">
            <div className="topo-espaco" />
            <div className="marca-plano">
              <span className="marca-simbolo-plano" />Lousa
            </div>
            <div className="topo-espaco" />
          </header>
        )}

        <main className="plano-container">
          <section className="folha-plano">
            <div className="plano-cabecalho">
              <span className="plano-etiqueta">{etiqueta}</span>
              <h1>{titulo}</h1>
              <p>{descricao}</p>

              <div className="acoes-plano">
                <button type="button" className="botao-salvar" onClick={onClick}>
                  {botao}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </IonContent>
  </IonPage>
);

const PlanoGerado: React.FC = () => {
  const router = useIonRouter();
  const usuario = obterUsuarioLogado();

  // Dados e estados
  const [contexto, setContexto] = useState(() => obterContextoPlano(usuario?.id));
  const [conteudo, setConteudo] = useState<ConteudoPlano | null>(() =>
    contexto?.planoSelecionado?.conteudo ?? contexto?.conteudoGerado ?? null
  );

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Atualiza os dados sempre que a página é aberta
  useIonViewWillEnter(() => {
    const atual = obterContextoPlano(usuario?.id);

    setContexto(atual);
    setConteudo(atual?.planoSelecionado?.conteudo ?? atual?.conteudoGerado ?? null);
    setEditando(false);
    setSalvando(false);
    setMensagemSucesso('');
    setMensagemErro('');
  });

  // Edição manual
  const atualizarTitulo = (titulo: string) =>
    setConteudo((plano) => plano ? { ...plano, titulo } : null);

  const atualizarSecao = (indice: number, campo: keyof SecaoPlano, valor: string) =>
    setConteudo((plano) => plano ? {
      ...plano,
      secoes: plano.secoes.map((secao, i) =>
        i === indice ? { ...secao, [campo]: valor } : secao
      )
    } : null);

  const adicionarSecao = () =>
    setConteudo((plano) => plano ? {
      ...plano,
      secoes: [...plano.secoes, { titulo: '', conteudo: '' }]
    } : null);

  const removerSecao = (indice: number) =>
    setConteudo((plano) => plano && plano.secoes.length > 1 ? {
      ...plano,
      secoes: plano.secoes.filter((_, i) => i !== indice)
    } : plano);

  // Aplica a sugestão da IA sem salvar automaticamente
  const aplicarSugestao = (sugestao: ConteudoPlano) => {
    setConteudo(sugestao);
    setEditando(true);
    setMensagemErro('');
    setMensagemSucesso('');
  };

  const voltarPlanejamentos = () => {
    limparContextoPlano();
    window.location.replace('/planejamentos');
  };

  // Verificação de acesso
  if (!usuario) {
    return (
      <TelaAviso
        etiqueta="acesso inválido"
        titulo="Sessão não encontrada"
        descricao="Faça login novamente para acessar seus planejamentos."
        botao="Ir para o login"
        onClick={() => router.push('/login', 'root', 'replace')}
      />
    );
  }

  if (!contexto || !conteudo) {
    return (
      <TelaAviso
        etiqueta="planejamento indisponível"
        titulo="Nenhum conteúdo foi gerado"
        descricao="O planejamento não possui conteúdo válido gerado pela IA."
        botao="Criar novamente"
        mostrarTopo
        onClick={() => router.push('/home', 'root', 'replace')}
      />
    );
  }

  const { dados, planoSelecionado } = contexto;

  // Exportar PDF
  const exportarPdf = () => {
    try {
      setMensagemErro('');
      exportarPlanejamentoPdf({ dados, conteudo, professor: usuario.nome });
    } catch (erro) {
      console.error('Erro ao exportar PDF:', erro);
      setMensagemErro('Não foi possível gerar o PDF. Tente novamente.');
    }
  };

  // Salvar planejamento
  const salvarPlano = async () => {
    if (salvando) return;

    const invalido = !conteudo.titulo.trim() || !conteudo.secoes.length ||
      conteudo.secoes.some((secao) => !secao.titulo.trim() || !secao.conteudo.trim());

    if (invalido) {
      setMensagemErro('Preencha o título do plano e o título e conteúdo de todos os tópicos.');
      return;
    }

    setSalvando(true);
    setMensagemErro('');
    setMensagemSucesso('');

    try {
      await salvarPlanejamento(dados, conteudo, planoSelecionado?.id);

      setEditando(false);
      setMensagemSucesso(planoSelecionado
        ? 'Alterações salvas com sucesso.'
        : 'Planejamento salvo com sucesso.');

      limparContextoPlano();
      window.setTimeout(() => window.location.replace('/planejamentos'), 700);
    } catch (erro) {
      console.error('Erro ao salvar planejamento:', erro);
      setMensagemErro(erro instanceof Error
        ? erro.message
        : 'Não foi possível salvar o planejamento.');
      setSalvando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="pagina-plano-gerado">

          {/* Cabeçalho */}
          <header className="plano-topo">
            <button type="button" className="botao-voltar"
              disabled={salvando} onClick={voltarPlanejamentos}>
              ← Voltar
            </button>

            <div className="marca-plano">
              <span className="marca-simbolo-plano" />Lousa
            </div>
            <div className="topo-espaco" />
          </header>

          <main className="plano-container">

            {/* Título */}
            <section className="plano-cabecalho">
              <span className="plano-etiqueta">planejamento</span>

              {editando ? (
                <input
                  className="titulo-edicao"
                  value={conteudo.titulo}
                  aria-label="Título do planejamento"
                  onChange={(e) => atualizarTitulo(e.target.value)}
                />
              ) : <h1>{conteudo.titulo}</h1>}

              <p>
                Seu planejamento está pronto. Você pode revisar,
                editar, exportar e salvar antes de utilizá-lo.
              </p>
            </section>

            {/* Resumo */}
            <section className="resumo-aula">
              {dados.nivelEnsino && <Resumo rotulo="Nível" valor={dados.nivelEnsino} />}
              <Resumo rotulo="Matéria" valor={dados.materia} />
              <Resumo rotulo="Turma / período" valor={dados.turma} />
              <Resumo rotulo="Duração" valor={`${dados.duracao} min`} />
            </section>

            {/* Edição com IA */}
            <EditarComIa
              dados={dados}
              conteudo={conteudo}
              desabilitado={salvando}
              onAplicar={aplicarSugestao}
            />

            {/* Conteúdo do planejamento */}
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
                        onChange={(e) => atualizarSecao(indice, 'titulo', e.target.value)}
                      />

                      <textarea
                        className="campo-edicao-plano"
                        value={secao.conteudo}
                        rows={6}
                        aria-label={`Conteúdo de ${secao.titulo || `tópico ${indice + 1}`}`}
                        onChange={(e) => atualizarSecao(indice, 'conteudo', e.target.value)}
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

            {/* Observações */}
            {dados.observacoes && (
              <section className="observacao-professor">
                <span>Observação informada pelo professor</span>
                <p>{dados.observacoes}</p>
              </section>
            )}

            {/* Mensagens */}
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

            {/* Botões */}
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
                  <span aria-hidden="true">✎</span> Editar planejamento
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
                className={editando ? 'botao-salvar botao-salvar-grande' : 'botao-salvar'}
                disabled={salvando}
                aria-busy={salvando}
                onClick={salvarPlano}
              >
                <span aria-hidden="true">✓</span>
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar planejamento'}
              </button>
            </div>

          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PlanoGerado;
