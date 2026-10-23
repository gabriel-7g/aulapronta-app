export interface DadosPlano {
  nivelEnsino?: string;
  materia: string;
  materiaId: string | null;
  turma: string;
  duracao: string;
  tema: string;
  observacoes: string;
}

export interface SecaoPlano {
  titulo: string;
  conteudo: string;
}

export interface ConteudoPlano {
  titulo: string;
  secoes: SecaoPlano[];
}

export interface PlanejamentoSalvo {
  id: string;
  usuarioId: string;
  criadoEm: string;
  atualizadoEm: string;
  dados: DadosPlano;
  conteudo: ConteudoPlano;
}