import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';

import { env } from '../config/env';
import {
  limiteTokens,
  type DadosGeracaoPlano
} from './iaService';

export interface UsoIa {
  entrada: number;
  saida: number;
  total: number;
}

export interface ReservaIa {
  id: string;
  dia: string;
  usuarioId: string;
  tokens: number;
}

export class LimiteIaError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'LimiteIaError';
  }
}

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 5,
  connectionTimeoutMillis: 10000
});

const lerLimite = (nome: string, padrao: number) => {
  const valor = process.env[nome];
  if (!valor) return padrao;

  const numero = Number(valor);

  if (!Number.isSafeInteger(numero) || numero < 1) {
    throw new Error(`${nome} deve ser um número inteiro positivo.`);
  }

  return numero;
};

const LIMITE_GLOBAL = lerLimite('IA_LIMITE_GLOBAL_DIARIO', 20000);
const LIMITE_USUARIO = lerLimite('IA_LIMITE_USUARIO_DIARIO', 7000);

const chaveUsuario = (id: string) => `USUARIO:${id}`;

const diaAtual = () => {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Recife',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value])
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
};

const calcularReserva = (dados: DadosGeracaoPlano) => {
  const saidaMaxima = limiteTokens(Number(dados.duracao));

  // Margem conservadora para instruções, contexto e dados da aula.
  const entradaEstimada = 2200 + Math.ceil(
    Buffer.byteLength(JSON.stringify(dados), 'utf8') / 2
  );

  return saidaMaxima + entradaEstimada;
};

const reservarNaChave = async (
  cliente: PoolClient,
  dia: string,
  chave: string,
  tokens: number,
  limite: number,
  mensagem: string
) => {
  await cliente.query(
    `INSERT INTO public.ia_cotas_diarias (dia, chave)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [dia, chave]
  );

  const resultado = await cliente.query(
    `UPDATE public.ia_cotas_diarias
     SET tokens_reservados = tokens_reservados + $3
     WHERE dia = $1
       AND chave = $2
       AND tokens_usados + tokens_reservados + $3 <= $4
     RETURNING chave`,
    [dia, chave, tokens, limite]
  );

  if (resultado.rowCount !== 1) {
    throw new LimiteIaError(mensagem);
  }
};

export const reservarGeracao = async (
  usuarioId: string,
  dados: DadosGeracaoPlano
): Promise<ReservaIa> => {
  const dia = diaAtual();
  const tokens = calcularReserva(dados);
  const id = randomUUID();

  if (tokens > LIMITE_USUARIO || tokens > LIMITE_GLOBAL) {
    throw new LimiteIaError(
      'Este planejamento precisa de mais tokens do que a cota disponível por geração.'
    );
  }

  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    // Sempre reserva primeiro a cota global e depois a individual.
    await reservarNaChave(
      cliente,
      dia,
      'GLOBAL',
      tokens,
      LIMITE_GLOBAL,
      'A cota diária de IA do Lousa está esgotada ou insuficiente.'
    );

    await reservarNaChave(
      cliente,
      dia,
      chaveUsuario(usuarioId),
      tokens,
      LIMITE_USUARIO,
      'Sua cota diária de IA está esgotada ou insuficiente.'
    );

    await cliente.query(
      `INSERT INTO public.ia_registros
       (id, usuario_id, dia, tokens_reserva)
       VALUES ($1, $2, $3, $4)`,
      [id, usuarioId, dia, tokens]
    );

    await cliente.query('COMMIT');

    return { id, dia, usuarioId, tokens };
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
};

export const finalizarGeracao = async (
  reserva: ReservaIa,
  uso: UsoIa | null,
  sucesso: boolean
) => {
  const entrada = Math.max(0, Math.trunc(uso?.entrada ?? 0));
  const saida = Math.max(0, Math.trunc(uso?.saida ?? 0));

  // Se a resposta teve sucesso mas não trouxe usage,
  // cobra a reserva inteira para não subcontabilizar.
  const total = uso
    ? Math.max(0, Math.trunc(uso.total))
    : sucesso
      ? reserva.tokens
      : 0;

  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    const registro = await cliente.query(
      `UPDATE public.ia_registros
       SET tokens_entrada = $2,
           tokens_saida = $3,
           tokens_total = $4,
           status = $5,
           finalizado_em = NOW()
       WHERE id = $1 AND status = 'pendente'
       RETURNING id`,
      [
        reserva.id,
        entrada,
        saida,
        total,
        sucesso ? 'sucesso' : 'erro'
      ]
    );

    if (registro.rowCount !== 1) {
      throw new Error('Reserva de IA inexistente ou já finalizada.');
    }

    for (const chave of [
      'GLOBAL',
      chaveUsuario(reserva.usuarioId)
    ]) {
      await cliente.query(
        `UPDATE public.ia_cotas_diarias
         SET tokens_reservados = tokens_reservados - $3,
             tokens_usados = tokens_usados + $4,
             geracoes = geracoes + $5
         WHERE dia = $1 AND chave = $2`,
        [
          reserva.dia,
          chave,
          reserva.tokens,
          total,
          sucesso ? 1 : 0
        ]
      );
    }

    await cliente.query('COMMIT');

    console.log(
      `[IA] Usuário ${reserva.usuarioId} | ` +
      `dia ${reserva.dia} | ` +
      `entrada ${entrada} | saída ${saida} | ` +
      `total ${total} | ${sucesso ? 'sucesso' : 'erro'}`
    );
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
};

export const consultarConsumoIa = async (usuarioId: string) => {
  const dia = diaAtual();

  const resultado = await pool.query(
    `SELECT chave, tokens_usados, tokens_reservados, geracoes
     FROM public.ia_cotas_diarias
     WHERE dia = $1 AND chave IN ('GLOBAL', $2)`,
    [dia, chaveUsuario(usuarioId)]
  );

  const resumo = (chave: string, limite: number) => {
    const linha = resultado.rows.find((item) => item.chave === chave);

    const usados = Number(linha?.tokens_usados ?? 0);
    const reservados = Number(linha?.tokens_reservados ?? 0);

    return {
      limite,
      usados,
      reservados,
      disponiveis: Math.max(0, limite - usados - reservados),
      geracoes: Number(linha?.geracoes ?? 0)
    };
  };

  return {
    dia,
    usuario: resumo(chaveUsuario(usuarioId), LIMITE_USUARIO),
    global: resumo('GLOBAL', LIMITE_GLOBAL)
  };
};