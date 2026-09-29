export interface DadosPlano {
  materia: string;
  materiaId: string | null;
  turma: string;
  duracao: string;
  tema: string;
  observacoes: string;
}

export interface ConteudoPlano {
  titulo: string;
  objetivo: string;
  introducao: string;
  desenvolvimento: string;
  atividade: string;
  recursos: string;
  avaliacao: string;
}

export interface PlanejamentoSalvo {
  id: string;

  /*
    Identifica qual usuário é dono
    deste planejamento.
  */
  usuarioId: string;

  criadoEm: string;
  atualizadoEm: string;

  dados: DadosPlano;

  conteudo: ConteudoPlano;
}