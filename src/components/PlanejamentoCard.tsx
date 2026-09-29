import React from 'react';

import { PlanejamentoSalvo } from '../types/planejamento';

import './PlanejamentoCard.css';


interface PlanejamentoCardProps {
  plano: PlanejamentoSalvo;

  onAbrir: (
    plano: PlanejamentoSalvo
  ) => void;

  onDuplicar: (
    plano: PlanejamentoSalvo
  ) => void;

  onExcluir: (
    plano: PlanejamentoSalvo
  ) => void;
}


const formatarData = (data: string) => {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ).format(new Date(data));
};


const PlanejamentoCard:
React.FC<PlanejamentoCardProps> = ({
  plano,
  onAbrir,
  onDuplicar,
  onExcluir
}) => {

  return (
    <article className="planejamento-card">

      <span
        className="planejamento-fita"
        aria-hidden="true"
      />


      {/* TOPO */}

      <div className="planejamento-card-topo">

        <span className="planejamento-materia">
          {plano.dados.materia}
        </span>


        <button
          type="button"
          className="botao-excluir"
          title="Excluir planejamento"
          aria-label={
            `Excluir planejamento ${plano.conteudo.titulo}`
          }
          onClick={() =>
            onExcluir(plano)
          }
        >
          ×
        </button>

      </div>


      {/* TÍTULO */}

      <h2>
        {plano.conteudo.titulo}
      </h2>


      {/* INFORMAÇÕES */}

      <div className="planejamento-tags">

        <span>
          {plano.dados.turma}
        </span>


        {plano.dados.duracao && (
          <span>
            {plano.dados.duracao} min
          </span>
        )}

      </div>


      {/* OBJETIVO */}

      <p className="planejamento-resumo">
        {plano.conteudo.objetivo}
      </p>


      {/* RODAPÉ */}

      <div className="planejamento-rodape">

        <span className="planejamento-data">
          Atualizado em{' '}
          {formatarData(plano.atualizadoEm)}
        </span>


        <div className="planejamento-card-acoes">

          <button
            type="button"
            className="botao-duplicar-plano"
            onClick={() =>
              onDuplicar(plano)
            }
          >
            Duplicar
          </button>


          <button
            type="button"
            className="botao-abrir-plano"
            onClick={() =>
              onAbrir(plano)
            }
          >
            Ver planejamento →
          </button>

        </div>

      </div>

    </article>
  );
};


export default PlanejamentoCard;