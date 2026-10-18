#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0a305fb9247158e699406a8730806d17e82a8241dbf5ba4bfdc2e970d7cb1de6/contract';
import endContract from '../../snapshots/0a305fb9247158e699406a8730806d17e82a8241dbf5ba4bfdc2e970d7cb1de6/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'planejamentos',
        columns: [
          col('atividade', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('atualizadoEm', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('avaliacao', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('criadoEm', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('desenvolvimento', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('duracao', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('introducao', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('materia', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('materiaId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('nivelEnsino', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('objetivo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('observacoes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('recursos', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tema', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('titulo', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('turma', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('usuarioId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'usuarios',
        columns: [
          col('atualizadoEm', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('criadoEm', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('nome', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('senha', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tipo', 'text', {
            notNull: true,
            default: lit('usuario'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'usuarios',
        constraint: 'usuarios_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'planejamentos',
        index: 'planejamentos_usuarioId_idx_5f01c7d6',
        columns: ['usuarioId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'planejamentos',
        foreignKey: {
          name: 'planejamentos_usuarioId_fkey',
          columns: ['usuarioId'],
          references: { schema: 'public', table: 'usuarios', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
