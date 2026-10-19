import {
  Request,
  Response
} from 'express';

import {
  DadosGeracaoPlano,
  gerarPlanoComIa
} from '../services/iaService';

const textoValido = (
  valor: unknown
): valor is string =>
  typeof valor === 'string' &&
  valor.trim().length > 0;

export const gerarPlano = async (
  req: Request,
  res: Response
) => {
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
        erro:
          'Matéria, turma, duração e tema são obrigatórios.'
      });
    }

    const minutos = Number(duracao);

    if (
      !Number.isFinite(minutos) ||
      minutos < 1
    ) {
      return res.status(400).json({
        erro:
          'Informe uma duração válida.'
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

    const conteudo =
      await gerarPlanoComIa(dados);

    return res.status(200).json({
      conteudo
    });

  } catch (erro) {
    console.error(
      'Erro ao gerar plano com IA:',
      erro
    );

    return res.status(500).json({
      erro:
        'Não foi possível gerar o planejamento com IA. Tente novamente.'
    });
  }
};