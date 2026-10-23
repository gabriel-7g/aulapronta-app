import { Request, Response } from 'express';

import {
  gerarPlanoComIa,
  type DadosGeracaoPlano
} from '../services/iaService';

import {
  consultarConsumoIa,
  finalizarGeracao,
  LimiteIaError,
  reservarGeracao,
  type ReservaIa,
  type UsoIa
} from '../services/controleIaService';

const textoValido = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0;

export const gerarPlano = async (req: Request, res: Response) => {
  let reserva: ReservaIa | null = null;
  let uso: UsoIa | null = null;

  try {
    const {
      nivelEnsino,
      materia,
      turma,
      duracao,
      tema,
      observacoes
    } = req.body;

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

    // Evita solicitações com textos excessivamente grandes.
    if (
      materia.length > 120 ||
      turma.length > 120 ||
      tema.length > 220 ||
      (typeof observacoes === 'string' && observacoes.length > 1000)
    ) {
      return res.status(400).json({
        erro: 'Uma das informações da aula ultrapassa o tamanho permitido.'
      });
    }

    const dados: DadosGeracaoPlano = {
      nivelEnsino:
        typeof nivelEnsino === 'string'
          ? nivelEnsino.trim()
          : undefined,
      materia: materia.trim(),
      turma: turma.trim(),
      duracao: String(minutos),
      tema: tema.trim(),
      observacoes:
        typeof observacoes === 'string'
          ? observacoes.trim()
          : undefined
    };

    // Confere e reserva a cota antes de gastar tokens.
    reserva = await reservarGeracao(req.usuario!.id, dados);

    const conteudo = await gerarPlanoComIa(dados, (consumo) => {
      uso = consumo;
    });

    // Substitui a reserva pelo consumo real da Groq.
    await finalizarGeracao(reserva, uso, true);
    reserva = null;

    return res.status(200).json({ conteudo });
  } catch (erro) {
    // Libera a reserva em caso de falha.
    // Se a Groq informou consumo, ele ainda será contabilizado.
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

export const meuConsumo = async (req: Request, res: Response) => {
  try {
    const consumo = await consultarConsumoIa(req.usuario!.id);
    return res.status(200).json(consumo);
  } catch (erro) {
    console.error('Erro ao consultar consumo:', erro);

    return res.status(500).json({
      erro: 'Não foi possível consultar o consumo da IA.'
    });
  }
};