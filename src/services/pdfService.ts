import { jsPDF } from 'jspdf';
import type {
  ConteudoPlano,
  DadosPlano
} from '../types/planejamento';

interface DadosPdf {
  dados: DadosPlano;
  conteudo: ConteudoPlano;
  professor?: string;
}

interface Secao {
  numero: string;
  titulo: string;
}

type RGB = readonly [number, number, number];
type Fonte = 'normal' | 'bold';

const PAGINA = {
  largura: 210,
  margem: 18,
  limite: 274,
  rodapeLinha: 282,
  rodapeTexto: 288
};

const CORES = {
  verde: [31, 75, 55],
  verdeClaro: [237, 241, 236],
  texto: [76, 73, 68],
  titulo: [32, 30, 27],
  cinza: [130, 126, 118],
  linha: [224, 220, 210],
  branco: [255, 255, 255]
} as const;

const ROTULOS = [
  'tempo',
  'objetivo geral',
  'objetivos específicos',
  'objetivo',
  'organização',
  'instruções',
  'resultado esperado',
  'critérios',
  'erros comuns',
  'evidências',
  'conceito',
  'mecanismo',
  'exemplo',
  'aplicação',
  'pergunta'
];

const normalizarTexto = (texto: string) =>
  texto
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
    .replace(/^(\s*\d+)[º°ª]\s*[-:–—]?\s*/gm, '$1. ')
    .replace(/[–—−]/g, '-')
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/(\d)\s*\/\s*(anos?|min|cm\/s)\b/gi, '$1 $2')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const nomeArquivoSeguro = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 70);

const dataAtual = () =>
  new Intl.DateTimeFormat('pt-BR').format(new Date());

const ehMarcador = (texto: string) =>
  /^[-•●▪◦]\s+/.test(texto);

const ehRotulo = (texto: string) => {
  const linha = texto.toLowerCase();

  return ROTULOS.some(
    (rotulo) =>
      linha === `${rotulo}:` ||
      linha.startsWith(`${rotulo}:`)
  );
};

const removerMarcador = (texto: string) =>
  texto.replace(/^[-•●▪◦]\s+/, '');

export const exportarPlanejamentoPdf = ({
  dados,
  conteudo,
  professor
}: DadosPdf) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const largura =
    PAGINA.largura - PAGINA.margem * 2;

  let y = PAGINA.margem;

  pdf.setProperties({
    title: conteudo.titulo,
    subject: 'Plano de aula',
    author: professor || 'Lousa',
    creator: 'Lousa'
  });

  const textoCor = ([r, g, b]: RGB) =>
    pdf.setTextColor(r, g, b);

  const fundoCor = ([r, g, b]: RGB) =>
    pdf.setFillColor(r, g, b);

  const linhaCor = ([r, g, b]: RGB) =>
    pdf.setDrawColor(r, g, b);

  const estilo = (
    tamanho = 9.5,
    fonte: Fonte = 'normal',
    cor: RGB = CORES.texto
  ) => {
    pdf.setFont('helvetica', fonte);
    pdf.setFontSize(tamanho);
    pdf.setCharSpace(0);
    textoCor(cor);
  };

  /*
    Só calcula a quebra.
    Não altera cor nem outro estilo visual.
  */
  const quebrar = (
    texto: string,
    larguraMax = largura,
    tamanho = 9.5,
    fonte: Fonte = 'normal'
  ): string[] => {
    pdf.setFont('helvetica', fonte);
    pdf.setFontSize(tamanho);
    pdf.setCharSpace(0);

    return pdf.splitTextToSize(
      texto,
      larguraMax
    ) as string[];
  };

  const escrever = (
    texto: string,
    x: number,
    yy: number
  ) => {
    pdf.setCharSpace(0);

    pdf.text(texto, x, yy, {
      charSpace: 0
    });
  };

  const cabecalhoPagina = (secao?: Secao) => {
    estilo(10, 'bold', CORES.verde);
    escrever('LOUSA | PLANO DE AULA', PAGINA.margem, 13);

    linhaCor(CORES.linha);
    pdf.line(
      PAGINA.margem,
      18,
      PAGINA.largura - PAGINA.margem,
      18
    );

    y = 27;

    if (secao) {
      estilo(8.5, 'bold', CORES.verde);

      escrever(
        `${secao.numero}  ${secao.titulo} - continuação`,
        PAGINA.margem,
        y
      );

      y += 7;
    }
  };

  const novaPagina = (secao?: Secao) => {
    pdf.addPage();
    cabecalhoPagina(secao);
  };

  const garantirEspaco = (
    altura: number,
    secao?: Secao
  ) => {
    if (y + altura > PAGINA.limite) {
      novaPagina(secao);
    }
  };

  const analisarLinha = (linha: string) => {
    const marcador = ehMarcador(linha);
    const rotulo = ehRotulo(linha);

    return {
      marcador,
      rotulo,
      texto: marcador
        ? removerMarcador(linha)
        : linha,
      recuo: marcador ? 5 : 0,
      fonte: rotulo
        ? 'bold' as Fonte
        : 'normal' as Fonte,
      tamanho: marcador ? 9.2 : 9.4,
      altura: marcador ? 3.9 : 4.1
    };
  };

  const alturaTexto = (texto: string) => {
    let total = 0;

    for (const original of normalizarTexto(texto).split('\n')) {
      const linha = original.trim();

      if (!linha) {
        total += 1.7;
        continue;
      }

      const info = analisarLinha(linha);

      const linhas = quebrar(
        info.texto,
        largura - info.recuo,
        info.tamanho,
        info.fonte
      );

      total += linhas.length * info.altura;

      if (info.rotulo) {
        total += 0.4;
      }
    }

    return total;
  };

  const escreverLinha = (
    original: string,
    secao: Secao,
    proxima?: string
  ) => {
    const linha = original.trim();

    if (!linha) {
      y += 1.7;
      return;
    }

    const info = analisarLinha(linha);

    const linhas = quebrar(
      info.texto,
      largura - info.recuo,
      info.tamanho,
      info.fonte
    );

    let necessario =
      linhas.length * info.altura;

    /*
      Evita "Critérios:" sozinho
      no final da página.
    */
    if (info.rotulo && proxima?.trim()) {
      necessario += 4;
    }

    garantirEspaco(necessario, secao);

    linhas.forEach((linhaAtual, indice) => {
      garantirEspaco(info.altura, secao);

      estilo(
        info.tamanho,
        info.fonte,
        CORES.texto
      );

      if (
        info.marcador &&
        indice === 0
      ) {
        fundoCor(CORES.verde);

        pdf.circle(
          PAGINA.margem + 1.3,
          y - 1.1,
          0.55,
          'F'
        );
      }

      escrever(
        linhaAtual,
        PAGINA.margem + info.recuo,
        y
      );

      y += info.altura;
    });

    if (info.rotulo) {
      y += 0.4;
    }
  };

  const tituloSecao = (
    numero: string,
    titulo: string
  ) => {
    garantirEspaco(14);
    y += 2.5;

    fundoCor(CORES.verdeClaro);

    pdf.circle(
      PAGINA.margem + 4,
      y + 1,
      4,
      'F'
    );

    estilo(7.6, 'bold', CORES.verde);

    pdf.text(
      numero,
      PAGINA.margem + 4,
      y + 1.7,
      { align: 'center', charSpace: 0 }
    );

    estilo(12.2, 'bold', CORES.verde);

    escrever(
      titulo,
      PAGINA.margem + 12,
      y + 2
    );

    y += 8.5;
  };

  const escreverSecao = (
    numero: string,
    titulo: string,
    texto: string
  ) => {
    const secao = { numero, titulo };
    const altura = alturaTexto(texto) + 14;
    const restante = PAGINA.limite - y;

    /*
      Se for pequena, tenta manter
      a seção inteira na mesma página.
    */
    if (
      altura <= 90 &&
      restante < altura
    ) {
      novaPagina();
    } else {
      garantirEspaco(21);
    }

    tituloSecao(numero, titulo);

    const linhas =
      normalizarTexto(texto).split('\n');

    linhas.forEach((linha, indice) =>
      escreverLinha(
        linha,
        secao,
        linhas[indice + 1]
      )
    );

    if (y + 5 <= PAGINA.limite) {
      y += 2.8;

      linhaCor(CORES.linha);

      pdf.line(
        PAGINA.margem,
        y,
        PAGINA.largura - PAGINA.margem,
        y
      );

      y += 1.3;
    }
  };

  const escreverInfo = (
    rotulo: string,
    valor: string,
    x: number,
    larguraMax: number
  ) => {
    estilo(
      7.1,
      'bold',
      [177, 190, 180]
    );

    escrever(
      rotulo.toUpperCase(),
      x,
      y
    );

    const linhas = quebrar(
      normalizarTexto(valor || '-'),
      larguraMax,
      9.4,
      'bold'
    );

    /*
      Reaplica o branco DEPOIS de quebrar.
    */
    estilo(
      9.4,
      'bold',
      CORES.branco
    );

    linhas.forEach(
      (linhaAtual, indice) =>
        escrever(
          linhaAtual,
          x,
          y + 5 + indice * 4
        )
    );
  };

  // Cabeçalho principal
  fundoCor(CORES.verde);

  pdf.roundedRect(
    PAGINA.margem,
    y,
    7,
    7,
    1.2,
    1.2,
    'F'
  );

  estilo(15, 'bold', CORES.titulo);
  escrever('Lousa', PAGINA.margem + 11, y + 5.6);

  y += 18;

  estilo(8, 'bold', CORES.verde);
  escrever('PLANO DE AULA', PAGINA.margem, y);

  y += 9;

  const titulo = quebrar(
    normalizarTexto(conteudo.titulo),
    largura,
    21,
    'bold'
  );

  estilo(21, 'bold', CORES.titulo);

  titulo.forEach(
    (linhaAtual, indice) =>
      escrever(
        linhaAtual,
        PAGINA.margem,
        y + indice * 8
      )
  );

  y += titulo.length * 8 + 5;

  // Professor e data
  if (professor) {
    estilo(9.2);

    escrever(
      `Professor(a): ${professor}`,
      PAGINA.margem,
      y
    );

    y += 5;
  }

  estilo(8.2, 'normal', CORES.cinza);

  escrever(
    `Gerado em: ${dataAtual()}`,
    PAGINA.margem,
    y
  );

  y += 10;

  // Resumo da aula
  garantirEspaco(36);

  fundoCor(CORES.verde);

  pdf.roundedRect(
    PAGINA.margem,
    y,
    largura,
    29,
    3,
    3,
    'F'
  );

  const topoResumo = y;
  y += 8;

  escreverInfo(
    'Nível',
    dados.nivelEnsino || 'Não informado',
    PAGINA.margem + 6,
    37
  );

  escreverInfo(
    'Matéria',
    dados.materia,
    PAGINA.margem + 51,
    43
  );

  escreverInfo(
    'Turma / período',
    dados.turma,
    PAGINA.margem + 103,
    36
  );

  escreverInfo(
    'Duração',
    `${dados.duracao} min`,
    PAGINA.margem + 147,
    22
  );

  y = topoResumo + 38;

  // Seções
  const secoes: Array<
    [string, string, string]
  > = [
    ['01', 'Objetivo', conteudo.objetivo],
    ['02', 'Introdução', conteudo.introducao],
    ['03', 'Desenvolvimento', conteudo.desenvolvimento],
    ['04', 'Atividade', conteudo.atividade],
    ['05', 'Recursos', conteudo.recursos],
    ['06', 'Avaliação', conteudo.avaliacao]
  ];

  if (dados.observacoes?.trim()) {
    secoes.push([
      '07',
      'Observações do professor',
      dados.observacoes
    ]);
  }

  secoes.forEach(
    ([numero, titulo, texto]) =>
      escreverSecao(
        numero,
        titulo,
        texto
      )
  );

  // Rodapé
  const totalPaginas =
    pdf.getNumberOfPages();

  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {
    pdf.setPage(pagina);

    linhaCor(CORES.linha);

    pdf.line(
      PAGINA.margem,
      PAGINA.rodapeLinha,
      PAGINA.largura - PAGINA.margem,
      PAGINA.rodapeLinha
    );

    estilo(
      7.2,
      'normal',
      CORES.cinza
    );

    escrever(
      'Plano de aula - Lousa',
      PAGINA.margem,
      PAGINA.rodapeTexto
    );

    pdf.text(
      `Página ${pagina} de ${totalPaginas}`,
      PAGINA.largura - PAGINA.margem,
      PAGINA.rodapeTexto,
      {
        align: 'right',
        charSpace: 0
      }
    );
  }

  const nome =
    nomeArquivoSeguro(
      conteudo.titulo || dados.tema
    ) || 'planejamento';

  pdf.save(
    `plano-de-aula-${nome}.pdf`
  );
};