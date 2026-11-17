
import React, { useState } from 'react';
import type { ConteudoPlano, DadosPlano } from '../types/planejamento';
import { editarPlanejamentoComIa } from '../services/iaService';
import './EditarComIa.css';

interface Props {
  dados: DadosPlano;
  conteudo: ConteudoPlano;
  desabilitado?: boolean;
  onAplicar: (conteudo: ConteudoPlano) => void;
}

const EditarComIa: React.FC<Props> = ({
  dados,
  conteudo,
  desabilitado = false,
  onAplicar
}) => {
  const [aberto, setAberto] = useState(false);
  const [instrucao, setInstrucao] = useState('');
  const [sugestao, setSugestao] = useState<ConteudoPlano | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const solicitarEdicao = async () => {
    if (carregando || desabilitado || instrucao.trim().length < 8) return;

    setCarregando(true);
    setSugestao(null);
    setErro('');

    try {
      const resultado = await editarPlanejamentoComIa(
        dados,
        conteudo,
        instrucao.trim()
      );

      setSugestao(resultado);
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : 'Não foi possível gerar a sugestão.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const aplicarSugestao = () => {
    if (!sugestao || carregando || desabilitado) return;

    onAplicar(sugestao);
    setSugestao(null);
    setInstrucao('');
    setErro('');
    setAberto(false);
  };

  const fechar = () => {
    if (carregando) return;
    setAberto(false);
    setSugestao(null);
    setErro('');
  };

  return (
    <section className="editar-ia">
      <button
        type="button"
        className="editar-ia-abrir"
        disabled={desabilitado || carregando}
        aria-expanded={aberto}
        onClick={() => aberto ? fechar() : setAberto(true)}
      >
        ✨ {aberto ? 'Fechar edição com IA' : 'Editar planejamento com IA'}
      </button>

      {aberto && (
        <div className="editar-ia-painel">
          <h2>O que deseja alterar?</h2>

          <p>
            Descreva a mudança. A IA criará uma sugestão para
            você revisar antes de aplicar ao planejamento.
          </p>

          <textarea
            aria-label="Instrução para a IA"
            placeholder="Ex: Adicione uma atividade prática sobre vetores e aumente o tempo da avaliação."
            value={instrucao}
            maxLength={1000}
            rows={4}
            disabled={carregando || desabilitado}
            onChange={(e) => {
              setInstrucao(e.target.value);
              setSugestao(null);
              setErro('');
            }}
          />

          {erro && <p className="editar-ia-erro" role="alert">{erro}</p>}

          <button
            type="button"
            className="editar-ia-enviar"
            disabled={
              carregando ||
              desabilitado ||
              instrucao.trim().length < 8
            }
            onClick={solicitarEdicao}
          >
            {carregando ? 'Preparando sugestão...' : 'Enviar pedido para IA'}
          </button>

          {sugestao && (
            <div className="editar-ia-previa">
              <h3>Prévia da sugestão</h3>
              <strong>{sugestao.titulo}</strong>

              <div className="editar-ia-secoes">
                {sugestao.secoes.map((secao, indice) => (
                  <article key={indice}>
                    <h4>{secao.titulo}</h4>
                    <p>{secao.conteudo}</p>
                  </article>
                ))}
              </div>

              <div className="editar-ia-acoes">
                <button
                  type="button"
                  onClick={() => setSugestao(null)}
                >
                  Descartar
                </button>

                <button
                  type="button"
                  className="editar-ia-aplicar"
                  onClick={aplicarSugestao}
                >
                  Aplicar sugestão
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EditarComIa;
