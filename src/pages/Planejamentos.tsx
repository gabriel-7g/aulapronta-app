import React, { useState } from 'react';

import {
  IonContent,
  IonPage,
  IonToast,
  useIonRouter,
  useIonViewWillEnter
} from '@ionic/react';

import {
  obterUsuarioLogado,
  sair
} from '../utils/auth';

import { PlanejamentoSalvo } from '../types/planejamento';
import { usePlanejamentos } from '../hooks/usePlanejamentos';

import ModalConfirmacao from '../components/ModalConfirmacao';
import PlanejamentoCard from '../components/PlanejamentoCard';
import FiltrosPlanejamentos from '../components/FiltrosPlanejamentos';

import './Planejamentos.css';
import './FiltrosPlanejamentos.css';

const Planejamentos: React.FC = () => {
  const router = useIonRouter();
  const usuario = obterUsuarioLogado();

  const {
    planejamentos,
    planejamentosFiltrados,
    carregando,
    erro,
    limparErro,

    busca,
    setBusca,
    filtroMateria,
    setFiltroMateria,
    filtroTurma,
    setFiltroTurma,
    ordenacao,
    setOrdenacao,

    materiasDisponiveis,
    turmasDisponiveis,
    filtrosAtivos,

    limparFiltros,
    carregarPlanejamentos,
    duplicarPlanejamento,
    excluirPlanejamento
  } = usePlanejamentos(usuario?.id);

  const [
    planoParaExcluir,
    setPlanoParaExcluir
  ] = useState<PlanejamentoSalvo | null>(null);

  const [mensagem, setMensagem] = useState('');

  useIonViewWillEnter(() => {
    void carregarPlanejamentos();
  });

  const abrirPlano = (
    plano: PlanejamentoSalvo
  ) => {
    if (
      !usuario ||
      plano.usuarioId !== usuario.id
    ) {
      return;
    }

    sessionStorage.removeItem('planoEmCriacao');

    sessionStorage.setItem(
      'planoSelecionado',
      JSON.stringify(plano)
    );

    router.push('/plano-gerado', 'forward');
  };

  const duplicarPlano = async (
    plano: PlanejamentoSalvo
  ) => {
    const copia =
      await duplicarPlanejamento(plano.id);

    if (copia) {
      setMensagem(
        `"${copia.conteudo.titulo}" criado com sucesso.`
      );
    }
  };

  const confirmarExclusao = async () => {
    if (!planoParaExcluir) return;

    const id = planoParaExcluir.id;
    setPlanoParaExcluir(null);

    const excluido =
      await excluirPlanejamento(id);

    if (excluido) {
      setMensagem(
        'Planejamento excluído com sucesso.'
      );
    }
  };

  const criarNovoPlano = () => {
    sessionStorage.removeItem('planoSelecionado');
    sessionStorage.removeItem('planoEmCriacao');

    router.push('/home', 'forward');
  };

  const fazerLogout = () => {
    sair();
    router.push('/login', 'root', 'replace');
  };

  const total = planejamentos.length;
  const exibidos = planejamentosFiltrados.length;

  const textoContador =
    exibidos !== total
      ? `${exibidos} de ${total} planejamentos`
      : total === 1
        ? '1 planejamento salvo'
        : `${total} planejamentos salvos`;

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="conteudo-planejamentos"
      >
        <div className="pagina-planejamentos">

          <header className="planejamentos-topo">

            <div className="planejamentos-usuario">
              <div className="usuario-avatar">
                {usuario?.nome
                  ?.charAt(0)
                  .toUpperCase() || 'U'}
              </div>

              <div className="usuario-informacoes">
                <span className="usuario-nome">
                  {usuario?.nome || 'Usuário'}
                </span>

                <span className="usuario-email">
                  {usuario?.email || ''}
                </span>
              </div>
            </div>


            <div className="marca-planejamentos">
              <span className="marca-simbolo-planejamentos" />
              Lousa
            </div>


            <div className="acoes-topo-planejamentos">
              <button
                type="button"
                className="botao-novo-topo"
                onClick={criarNovoPlano}
              >
                + Novo plano
              </button>

              <button
                type="button"
                className="botao-sair"
                onClick={fazerLogout}
              >
                Sair
              </button>
            </div>

          </header>


          <main className="planejamentos-container">

            <section className="planejamentos-cabecalho">
              <span className="planejamentos-etiqueta">
                sua estante
              </span>

              <h1>Meus planejamentos</h1>

              <p>
                Seus planos de aula salvos ficam organizados aqui.
              </p>
            </section>


            {carregando && total === 0 ? (

              <section className="estado-vazio">
                <h2>Carregando planejamentos...</h2>
                <p>
                  Buscando seus dados no servidor.
                </p>
              </section>

            ) : total === 0 ? (

              <section className="estado-vazio">
                <div
                  className="estado-vazio-icone"
                  aria-hidden="true"
                >
                  ✎
                </div>

                <h2>
                  Você ainda não possui planejamentos
                </h2>

                <p>
                  Crie seu primeiro planejamento e ele aparecerá aqui.
                </p>

                <button
                  type="button"
                  className="botao-criar-primeiro"
                  onClick={criarNovoPlano}
                >
                  Criar planejamento
                </button>
              </section>

            ) : (

              <>
                <FiltrosPlanejamentos
                  busca={busca}
                  materia={filtroMateria}
                  turma={filtroTurma}
                  ordenacao={ordenacao}
                  materias={materiasDisponiveis}
                  turmas={turmasDisponiveis}
                  filtrosAtivos={filtrosAtivos}
                  onBusca={setBusca}
                  onMateria={setFiltroMateria}
                  onTurma={setFiltroTurma}
                  onOrdenacao={setOrdenacao}
                  onLimpar={limparFiltros}
                />


                <div
                  className="lista-cabecalho lista-cabecalho-filtros"
                  aria-live="polite"
                >
                  <span>{textoContador}</span>

                  {filtrosAtivos && (
                    <span className="indicador-filtro-ativo">
                      Filtros ativos
                    </span>
                  )}
                </div>


                {exibidos === 0 ? (

                  <section className="estado-sem-resultados">
                    <div
                      className="estado-sem-resultados-icone"
                      aria-hidden="true"
                    >
                      ⌕
                    </div>

                    <h2>
                      Nenhum planejamento encontrado
                    </h2>

                    <p>
                      Não encontramos planejamentos com os filtros selecionados.
                    </p>

                    <button
                      type="button"
                      className="botao-limpar-resultados"
                      onClick={limparFiltros}
                    >
                      Limpar filtros
                    </button>
                  </section>

                ) : (

                  <section className="grade-planejamentos">
                    {planejamentosFiltrados.map(
                      (plano) => (
                        <PlanejamentoCard
                          key={plano.id}
                          plano={plano}
                          onAbrir={abrirPlano}
                          onDuplicar={duplicarPlano}
                          onExcluir={setPlanoParaExcluir}
                        />
                      )
                    )}
                  </section>

                )}
              </>

            )}

          </main>


          <ModalConfirmacao
            aberto={Boolean(planoParaExcluir)}
            titulo="Excluir planejamento?"
            descricao={
              planoParaExcluir
                ? `Tem certeza de que deseja excluir "${planoParaExcluir.conteudo.titulo}"? Essa ação não poderá ser desfeita.`
                : ''
            }
            textoCancelar="Cancelar"
            textoConfirmar="Excluir planejamento"
            perigo
            onCancelar={() =>
              setPlanoParaExcluir(null)
            }
            onConfirmar={() => {
              void confirmarExclusao();
            }}
          />


          <IonToast
            isOpen={Boolean(mensagem)}
            message={mensagem}
            duration={1800}
            position="top"
            onDidDismiss={() =>
              setMensagem('')
            }
          />


          <IonToast
            isOpen={Boolean(erro)}
            message={erro}
            duration={2500}
            position="top"
            color="danger"
            onDidDismiss={limparErro}
          />

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Planejamentos;