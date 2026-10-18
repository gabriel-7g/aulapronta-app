import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  duplicarPlanejamentoDoUsuario,
  excluirPlanejamentoDoUsuario,
  listarPlanejamentosDoUsuario
} from '../services/planejamentoService';

import { PlanejamentoSalvo } from '../types/planejamento';
import { TipoOrdenacao } from '../types/filtrosPlanejamento';

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const obterMensagemErro = (erro: unknown) =>
  erro instanceof Error
    ? erro.message
    : 'Ocorreu um erro inesperado.';

export const usePlanejamentos = (
  usuarioId?: string
) => {
  const [planejamentos, setPlanejamentos] =
    useState<PlanejamentoSalvo[]>([]);

  const [busca, setBusca] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('todas');
  const [filtroTurma, setFiltroTurma] = useState('todas');
  const [ordenacao, setOrdenacao] =
    useState<TipoOrdenacao>('recentes');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarPlanejamentos = useCallback(async () => {
    if (!usuarioId) {
      setPlanejamentos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const lista =
        await listarPlanejamentosDoUsuario(usuarioId);

      setPlanejamentos(lista);
    } catch (erro) {
      setErro(obterMensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    void carregarPlanejamentos();
  }, [carregarPlanejamentos]);

  const materiasDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(
          planejamentos
            .map((plano) => plano.dados.materia.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [planejamentos]
  );

  const turmasDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(
          planejamentos
            .map((plano) => plano.dados.turma.trim())
            .filter(Boolean)
        )
      ).sort((a, b) =>
        a.localeCompare(b, 'pt-BR', { numeric: true })
      ),
    [planejamentos]
  );

  const planejamentosFiltrados = useMemo(() => {
    let resultado = [...planejamentos];
    const termo = normalizar(busca);

    if (termo) {
      resultado = resultado.filter((plano) => {
        const texto = normalizar(
          [
            plano.conteudo.titulo,
            plano.dados.tema,
            plano.dados.materia,
            plano.dados.turma,
            plano.dados.nivelEnsino || '',
            plano.conteudo.objetivo
          ].join(' ')
        );

        return texto.includes(termo);
      });
    }

    if (filtroMateria !== 'todas') {
      resultado = resultado.filter(
        (plano) => plano.dados.materia === filtroMateria
      );
    }

    if (filtroTurma !== 'todas') {
      resultado = resultado.filter(
        (plano) => plano.dados.turma === filtroTurma
      );
    }

    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'antigos':
          return (
            new Date(a.atualizadoEm).getTime() -
            new Date(b.atualizadoEm).getTime()
          );

        case 'titulo-az':
          return a.conteudo.titulo.localeCompare(
            b.conteudo.titulo,
            'pt-BR'
          );

        case 'titulo-za':
          return b.conteudo.titulo.localeCompare(
            a.conteudo.titulo,
            'pt-BR'
          );

        default:
          return (
            new Date(b.atualizadoEm).getTime() -
            new Date(a.atualizadoEm).getTime()
          );
      }
    });

    return resultado;
  }, [
    planejamentos,
    busca,
    filtroMateria,
    filtroTurma,
    ordenacao
  ]);

  const filtrosAtivos =
    Boolean(busca.trim()) ||
    filtroMateria !== 'todas' ||
    filtroTurma !== 'todas' ||
    ordenacao !== 'recentes';

  const limparFiltros = () => {
    setBusca('');
    setFiltroMateria('todas');
    setFiltroTurma('todas');
    setOrdenacao('recentes');
  };

  const duplicarPlanejamento = useCallback(
    async (id: string) => {
      if (!usuarioId) return null;

      setErro('');

      try {
        const copia =
          await duplicarPlanejamentoDoUsuario(
            id,
            usuarioId
          );

        if (copia) await carregarPlanejamentos();

        return copia;
      } catch (erro) {
        setErro(obterMensagemErro(erro));
        return null;
      }
    },
    [usuarioId, carregarPlanejamentos]
  );

  const excluirPlanejamento = useCallback(
    async (id: string) => {
      if (!usuarioId) return false;

      setErro('');

      try {
        const excluido =
          await excluirPlanejamentoDoUsuario(
            id,
            usuarioId
          );

        if (excluido) await carregarPlanejamentos();

        return excluido;
      } catch (erro) {
        setErro(obterMensagemErro(erro));
        return false;
      }
    },
    [usuarioId, carregarPlanejamentos]
  );

  return {
    planejamentos,
    planejamentosFiltrados,
    carregando,
    erro,
    limparErro: () => setErro(''),

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
  };
};