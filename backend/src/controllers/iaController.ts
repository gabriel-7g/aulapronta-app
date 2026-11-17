
import { Request, Response } from 'express';

import {
  gerarPlanoComIa,
  editarPlanoComIa,
  type DadosGeracaoPlano,
  type ConteudoGerado
} from '../services/iaService';

import {
  consultarConsumoIa,
  finalizarGeracao,
  LimiteIaError,
  reservarGeracao,
  type ReservaIa,
  type UsoIa
} from '../services/controleIaService';

// VALIDAÇÕES

const textoValido = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0;

const planoValido = (valor: unknown): valor is ConteudoGerado => {
  if (typeof valor !== 'object' || valor === null) return false;

  const plano = valor as Record<string, unknown>;

  if (
    !textoValido(plano.titulo) ||
    plano.titulo.length > 200 ||
    !Array.isArray(plano.secoes) ||
    plano.secoes.length < 1 ||
    plano.secoes.length > 24
  ) {
    return false;
  }

  return plano.secoes.every((secao: unknown) => {
    if (typeof secao !== 'object' || secao === null) return false;

    const item = secao as Record<string, unknown>;

    return (
      textoValido(item.titulo) &&
      item.titulo.length <= 200 &&
      textoValido(item.conteudo) &&
      item.conteudo.length <= 6000
    );
  });
};

// GERAR PLANEJAMENTO

export const gerarPlano = async (req: Request, res: Response) => {
  let reserva: ReservaIa | null = null;
  let uso: UsoIa | null = null;

  try {
    const {
      nivelEnsino,
      materia,
      turma,
      duracao,
      quantidadeAulas,
      tema,
      observacoes
    } = req.body ?? {};

    if (
      !textoValido(materia) ||
      !textoValido(turma) ||
      !textoValido(duracao) ||
      !textoValido(tema)
    ) {
      return res.status(400).json({
        erro: 'Matéria, turma, duração e tema são obrigatórios.'
      });
    }

    const minutos = Number(duracao);

    if (!Number.isFinite(minutos) || minutos < 1) {
      return res.status(400).json({
        erro: 'Informe uma duração válida.'
      });
    }

    // Permite de 1 a 5 aulas
    const aulas = quantidadeAulas === undefined
      ? 1
      : Number(quantidadeAulas);

    if (!Number.isInteger(aulas) || aulas < 1 || aulas > 5) {
      return res.status(400).json({
        erro: 'Escolha entre 1 e 5 aulas.'
      });
    }

    if (
      materia.length > 120 ||
      turma.length > 120 ||
      tema.length > 220 ||
      (typeof nivelEnsino === 'string' && nivelEnsino.length > 120) ||
      (typeof observacoes === 'string' && observacoes.length > 1000)
    ) {
      return res.status(400).json({
        erro: 'Uma das informações ultrapassa o tamanho permitido.'
      });
    }

    const dados: DadosGeracaoPlano = {
      nivelEnsino: typeof nivelEnsino === 'string'
        ? nivelEnsino.trim()
        : undefined,

      materia: materia.trim(),
      turma: turma.trim(),
      duracao: String(minutos),
      quantidadeAulas: aulas,
      tema: tema.trim(),

      observacoes: typeof observacoes === 'string'
        ? observacoes.trim()
        : undefined
    };

    // Reserva tokens antes da geração
    reserva = await reservarGeracao(req.usuario!.id, dados);

    const conteudo = await gerarPlanoComIa(dados, (consumo) => {
      uso = consumo;
    });

    // Registra consumo real
    await finalizarGeracao(reserva, uso, true);
    reserva = null;

    return res.status(200).json({ conteudo });

  } catch (erro) {
    if (reserva) {
      try {
        await finalizarGeracao(reserva, uso, false);
      } catch (erroRegistro) {
        console.error('Erro ao finalizar consumo da IA:', erroRegistro);
      }
    }

    if (erro instanceof LimiteIaError) {
      return res.status(429).json({ erro: erro.message });
    }

    console.error('Erro ao gerar plano com IA:', erro);

    return res.status(500).json({
      erro: 'Não foi possível gerar o planejamento com IA. Tente novamente.'
    });
  }
};

// EDITAR PLANEJAMENTO COM IA

export const editarPlano = async (req: Request, res: Response) => {
  let reserva: ReservaIa | null = null;
  let uso: UsoIa | null = null;

  try {
    const { dados, conteudo, instrucao } = req.body ?? {};

    if (
      !dados ||
      typeof dados !== 'object' ||
      Array.isArray(dados) ||
      !textoValido(dados.materia) ||
      !textoValido(dados.turma) ||
      !textoValido(dados.duracao) ||
      !textoValido(dados.tema) ||
      !planoValido(conteudo) ||
      !textoValido(instrucao)
    ) {
      return res.status(400).json({
        erro: 'Informe o planejamento e o que deseja editar.'
      });
    }

    if (
      instrucao.trim().length < 8 ||
      instrucao.length > 1000 ||
      dados.materia.length > 120 ||
      dados.turma.length > 120 ||
      dados.tema.length > 220 ||
      (typeof dados.nivelEnsino === 'string' &&
        dados.nivelEnsino.length > 120) ||
      (typeof dados.observacoes === 'string' &&
        dados.observacoes.length > 1000) ||
      JSON.stringify(conteudo).length > 16000
    ) {
      return res.status(400).json({
        erro: 'O pedido de edição ou o planejamento é muito grande.'
      });
    }

    const minutos = Number(dados.duracao);

    if (!Number.isFinite(minutos) || minutos < 1) {
      return res.status(400).json({
        erro: 'Informe uma duração válida.'
      });
    }

    // Preserva a quantidade de aulas durante a edição
    const aulasEdicao = dados.quantidadeAulas === undefined
      ? 1
      : Number(dados.quantidadeAulas);

    if (
      !Number.isInteger(aulasEdicao) ||
      aulasEdicao < 1 ||
      aulasEdicao > 5
    ) {
      return res.status(400).json({
        erro: 'Quantidade de aulas inválida.'
      });
    }

    const contexto: DadosGeracaoPlano = {
      nivelEnsino: typeof dados.nivelEnsino === 'string'
        ? dados.nivelEnsino.trim()
        : undefined,

      materia: dados.materia.trim(),
      turma: dados.turma.trim(),
      duracao: String(minutos),
      quantidadeAulas: aulasEdicao,
      tema: dados.tema.trim(),

      observacoes: typeof dados.observacoes === 'string'
        ? dados.observacoes.trim()
        : undefined
    };

    const pedido = instrucao.trim();

    // Reserva tokens considerando o plano e a instrução
    reserva = await reservarGeracao(req.usuario!.id, {
      ...contexto,
      observacoes: JSON.stringify({
        observacoes: contexto.observacoes,
        planoAtual: conteudo,
        instrucao: pedido
      })
    });

    // Solicita alterações sem modificar o plano original
    const conteudoEditado = await editarPlanoComIa(
      contexto,
      conteudo,
      pedido,
      (consumo) => {
        uso = consumo;
      }
    );

    await finalizarGeracao(reserva, uso, true);
    reserva = null;

    // Retorna sugestão sem salvar no banco
    return res.status(200).json({
      conteudo: conteudoEditado
    });

  } catch (erro) {
    if (reserva) {
      try {
        await finalizarGeracao(reserva, uso, false);
      } catch (erroRegistro) {
        console.error('Erro ao registrar consumo da edição:', erroRegistro);
      }
    }

    if (erro instanceof LimiteIaError) {
      return res.status(429).json({ erro: erro.message });
    }

    console.error('Erro ao editar planejamento com IA:', erro);

    return res.status(500).json({
      erro: 'Não foi possível editar com IA. Tente novamente.'
    });
  }
};

// CONSULTAR CONSUMO DA IA

export const meuConsumo = async (req: Request, res: Response) => {
  try {
    const consumo = await consultarConsumoIa(req.usuario!.id);

    return res.status(200).json(consumo);

  } catch (erro) {
    console.error('Erro ao consultar consumo da IA:', erro);

    return res.status(500).json({
      erro: 'Não foi possível consultar o consumo da IA.'
    });
  }
};
