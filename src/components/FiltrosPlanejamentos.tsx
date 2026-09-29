import React from 'react';

import {
  TipoOrdenacao
} from '../types/filtrosPlanejamento';


interface FiltrosPlanejamentosProps {
  busca: string;
  materia: string;
  turma: string;
  ordenacao: TipoOrdenacao;

  materias: string[];
  turmas: string[];

  filtrosAtivos: boolean;

  onBusca: (valor: string) => void;
  onMateria: (valor: string) => void;
  onTurma: (valor: string) => void;

  onOrdenacao: (
    valor: TipoOrdenacao
  ) => void;

  onLimpar: () => void;
}


const FiltrosPlanejamentos:
React.FC<FiltrosPlanejamentosProps> = ({
  busca,
  materia,
  turma,
  ordenacao,

  materias,
  turmas,

  filtrosAtivos,

  onBusca,
  onMateria,
  onTurma,
  onOrdenacao,
  onLimpar
}) => {

  return (
    <section
      className="planejamentos-ferramentas"
      aria-label="Busca, filtros e ordenação dos planejamentos"
    >

      {/* BUSCA */}

      <div className="campo-filtro campo-busca">

        <label htmlFor="busca-planejamentos">
          Buscar
        </label>


        <div className="busca-input-wrapper">

          <span
            className="icone-busca"
            aria-hidden="true"
          >
            ⌕
          </span>


          <input
            id="busca-planejamentos"
            type="search"
            placeholder="Buscar por título, tema, matéria..."
            value={busca}
            onChange={(evento) =>
              onBusca(
                evento.target.value
              )
            }
          />


          {busca && (
            <button
              type="button"
              className="botao-limpar-busca"
              aria-label="Limpar busca"
              title="Limpar busca"
              onClick={() =>
                onBusca('')
              }
            >
              ×
            </button>
          )}

        </div>

      </div>


      {/* FILTROS */}

      <div className="filtros-planejamentos-grid">

        {/* MATÉRIA */}

        <div className="campo-filtro">

          <label htmlFor="filtro-materia">
            Matéria
          </label>


          <select
            id="filtro-materia"
            value={materia}
            onChange={(evento) =>
              onMateria(
                evento.target.value
              )
            }
          >

            <option value="todas">
              Todas as matérias
            </option>


            {materias.map(
              (nomeMateria) => (

                <option
                  key={nomeMateria}
                  value={nomeMateria}
                >
                  {nomeMateria}
                </option>

              )
            )}

          </select>

        </div>


        {/* TURMA */}

        <div className="campo-filtro">

          <label htmlFor="filtro-turma">
            Turma
          </label>


          <select
            id="filtro-turma"
            value={turma}
            onChange={(evento) =>
              onTurma(
                evento.target.value
              )
            }
          >

            <option value="todas">
              Todas as turmas
            </option>


            {turmas.map(
              (nomeTurma) => (

                <option
                  key={nomeTurma}
                  value={nomeTurma}
                >
                  {nomeTurma}
                </option>

              )
            )}

          </select>

        </div>


        {/* ORDENAÇÃO */}

        <div className="campo-filtro">

          <label htmlFor="ordenacao-planejamentos">
            Ordenar por
          </label>


          <select
            id="ordenacao-planejamentos"
            value={ordenacao}
            onChange={(evento) => onOrdenacao(evento.target.value as TipoOrdenacao)}>
                
            <option value="recentes">
              Mais recentes
            </option>

            <option value="antigos">
              Mais antigos
            </option>

            <option value="titulo-az">
              Título A–Z
            </option>

            <option value="titulo-za">
              Título Z–A
            </option>

          </select>

        </div>

      </div>


      {/* LIMPAR */}

      {filtrosAtivos && (

        <div className="area-limpar-filtros">

          <button
            type="button"
            className="botao-limpar-filtros"
            onClick={onLimpar}
          >
            × Limpar busca e filtros
          </button>

        </div>

      )}

    </section>
  );

};


export default FiltrosPlanejamentos;