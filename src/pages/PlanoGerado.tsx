import React, { useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';

import { obterUsuarioLogado } from '../utils/auth';

import {
  limparContextoPlano,
  obterContextoPlano
} from '../utils/planoSessao';

import { salvarPlanejamento } from '../services/planejamentoService';

import {
  ConteudoPlano,
  DadosPlano,
  PlanejamentoSalvo
} from '../types/planejamento';

import './PlanoGerado.css';


const gerarId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};


const criarConteudoInicial = (
  dados: DadosPlano
): ConteudoPlano => ({
  titulo: dados.tema,

  objetivo:
    `Compreender os principais conceitos relacionados ao tema "${dados.tema}" e aplicá-los em situações práticas.`,

  introducao:
    'Inicie retomando os conhecimentos prévios da turma e apresente o assunto de forma contextualizada.',

  desenvolvimento:
    'Apresente os conceitos principais de forma progressiva, utilizando exemplos claros e estimulando a participação da turma.',

  atividade:
    'Proponha uma atividade prática para aplicação dos conceitos apresentados, individualmente ou em grupo.',

  recursos:
    'Quadro, material didático, atividades impressas e recursos digitais, quando disponíveis.',

  avaliacao:
    'A avaliação será contínua, considerando a participação, a realização da atividade e a compreensão demonstrada.'
});


const PlanoGerado: React.FC = () => {
  const router = useIonRouter();
  const usuario = obterUsuarioLogado();

  const [contexto] = useState(() =>
    obterContextoPlano(usuario?.id)
  );

  const [conteudo, setConteudo] =
    useState<ConteudoPlano | null>(() => {
      if (!contexto) return null;

      return (
        contexto.planoSelecionado?.conteudo ??
        criarConteudoInicial(contexto.dados)
      );
    });

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');


  // Sessão inválida
  if (!usuario) {
    return (
      <IonPage>
        <IonContent fullscreen>

          <div className="pagina-plano-gerado">
            <main className="plano-container">

              <section className="folha-plano">
                <span
                  className="fita-plano"
                  aria-hidden="true"
                />

                <div className="plano-cabecalho">

                  <span className="plano-etiqueta">
                    acesso inválido
                  </span>

                  <h1>
                    Sessão não encontrada
                  </h1>

                  <p>
                    Faça login novamente para acessar seus planejamentos.
                  </p>

                  <div className="acoes-plano">

                    <button
                      type="button"
                      className="botao-salvar botao-salvar-grande"
                      onClick={() =>
                        router.push('/login', 'root')
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


  // Planejamento inválido
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

                <span
                  className="fita-plano"
                  aria-hidden="true"
                />

                <div className="plano-cabecalho">

                  <span className="plano-etiqueta">
                    dados inválidos
                  </span>

                  <h1>
                    Planejamento indisponível
                  </h1>

                  <p>
                    Não encontramos dados válidos para exibir este planejamento.
                  </p>

                  <div className="acoes-plano">

                    <button
                      type="button"
                      className="botao-salvar botao-salvar-grande"
                      onClick={() =>
                        window.location.replace('/planejamentos')
                      }
                    >
                      Voltar para meus planejamentos
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


  const salvarPlano = () => {
    if (salvando || !conteudo) return;

    setSalvando(true);
    setMensagemErro('');
    setMensagemSucesso('');

    const agora = new Date().toISOString();
    const eraEdicao = Boolean(planoSelecionado);

    const planejamento: PlanejamentoSalvo = {
      id: planoSelecionado?.id ?? gerarId(),
      usuarioId: usuario.id,

      criadoEm:
        planoSelecionado?.criadoEm ?? agora,

      atualizadoEm: agora,
      dados,
      conteudo
    };

    try {
      salvarPlanejamento(planejamento);

      setEditando(false);

      setMensagemSucesso(
        eraEdicao
          ? 'Alterações salvas com sucesso.'
          : 'Planejamento salvo com sucesso.'
      );

      limparContextoPlano();

      /*
        Força a abertura da página correta.
        Não depende da pilha de navegação do Ionic.
      */
      window.setTimeout(() => {
        window.location.replace('/planejamentos');
      }, 700);

    } catch (erro) {
      console.error(
        'Erro ao salvar planejamento:',
        erro
      );

      setSalvando(false);

      setMensagemErro(
        'Não foi possível salvar o planejamento. Tente novamente.'
      );
    }
  };


  return (
    <IonPage>
      <IonContent fullscreen>

        <div className="pagina-plano-gerado">

          {/* TOPO */}
          <header className="plano-topo">

            <button
              type="button"
              className="botao-voltar"
              disabled={salvando}
              onClick={() =>
                window.location.replace('/planejamentos')
              }
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

            {/* TÍTULO */}
            <section className="plano-cabecalho">

              <span className="plano-etiqueta">
                planejamento
              </span>


              {editando ? (

                <input
                  className="titulo-edicao"
                  value={conteudo.titulo}
                  aria-label="Título do planejamento"
                  onChange={(e) =>
                    atualizarCampo(
                      'titulo',
                      e.target.value
                    )
                  }
                />

              ) : (

                <h1>
                  {conteudo.titulo}
                </h1>

              )}


              <p>
                Seu planejamento está pronto.
                Você pode revisar, editar e salvar antes de utilizá-lo.
              </p>

            </section>


            {/* RESUMO */}
            <section className="resumo-aula">

              {dados.nivelEnsino && (
                <div>
                  <span className="resumo-rotulo">
                    Nível
                  </span>

                  <strong>
                    {dados.nivelEnsino}
                  </strong>
                </div>
              )}


              <div>
                <span className="resumo-rotulo">
                  Matéria
                </span>

                <strong>
                  {dados.materia}
                </strong>
              </div>


              <div>
                <span className="resumo-rotulo">
                  Turma / período
                </span>

                <strong>
                  {dados.turma}
                </strong>
              </div>


              <div>
                <span className="resumo-rotulo">
                  Duração
                </span>

                <strong>
                  {dados.duracao
                    ? `${dados.duracao} min`
                    : 'Não informada'}
                </strong>
              </div>

            </section>


            {/* CONTEÚDO */}
            <section className="folha-plano">

              <span
                className="fita-plano"
                aria-hidden="true"
              />

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


            {/* OBSERVAÇÕES */}
            {dados.observacoes && (

              <section className="observacao-professor">

                <span>
                  Observação informada pelo professor
                </span>

                <p>
                  {dados.observacoes}
                </p>

              </section>

            )}


            {/* SUCESSO */}
            {mensagemSucesso && (

              <div
                className="mensagem-sucesso"
                role="status"
                aria-live="polite"
              >

                <span aria-hidden="true">
                  ✓
                </span>

                <div>
                  <strong>
                    {mensagemSucesso}
                  </strong>

                  <p>
                    Abrindo seus planejamentos...
                  </p>
                </div>

              </div>

            )}


            {/* ERRO */}
            {mensagemErro && (

              <div
                className="mensagem-erro"
                role="alert"
                aria-live="assertive"
              >
                {mensagemErro}
              </div>

            )}


            {/* BOTÕES */}
            <div className="acoes-plano">

              {!editando ? (

                <>
                  <button
                    type="button"
                    className="botao-editar"
                    disabled={salvando}
                    onClick={editarPlano}
                  >
                    <span aria-hidden="true">
                      ✎
                    </span>

                    Editar planejamento
                  </button>


                  <button
                    type="button"
                    className="botao-salvar"
                    disabled={salvando}
                    aria-busy={salvando}
                    onClick={salvarPlano}
                  >
                    <span aria-hidden="true">
                      ✓
                    </span>

                    {salvando
                      ? 'Salvando...'
                      : 'Salvar planejamento'}
                  </button>
                </>

              ) : (

                <button
                  type="button"
                  className="botao-salvar botao-salvar-grande"
                  disabled={salvando}
                  aria-busy={salvando}
                  onClick={salvarPlano}
                >
                  <span aria-hidden="true">
                    ✓
                  </span>

                  {salvando
                    ? 'Salvando...'
                    : 'Salvar alterações'}
                </button>

              )}

            </div>

          </main>

        </div>

      </IonContent>
    </IonPage>
  );
};


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

      <span className="bloco-numero">
        {numero}
      </span>

      <h2>
        {titulo}
      </h2>

    </div>


    {editando ? (

      <textarea
        className="campo-edicao-plano"
        aria-label={titulo}
        value={valor}
        onChange={(e) =>
          atualizar(
            campo,
            e.target.value
          )
        }
      />

    ) : (

      <p>
        {valor}
      </p>

    )}

  </article>
);


export default PlanoGerado;