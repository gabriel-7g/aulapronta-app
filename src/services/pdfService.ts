import { jsPDF } from 'jspdf';
import type { ConteudoPlano, DadosPlano } from '../types/planejamento';

type RGB = readonly [number, number, number];
type Fonte = 'normal' | 'bold';

interface DadosPdf {
  dados: DadosPlano;
  conteudo: ConteudoPlano;
  professor?: string;
}

const COR = {
  verde: [31, 75, 55],
  texto: [70, 69, 65],
  cinza: [126, 124, 117],
  claro: [223, 226, 220],
  branco: [255, 255, 255]
} as const;

const MARGEM = 18;
const LARGURA = 210 - MARGEM * 2;
const LIMITE = 273;

const limpar = (valor: string) =>
  (valor || '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2000-\u200b\u202f]/g, ' ')
    .replace(/^[ \t]*#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^(\s*\d+)[ºª°]\s*[-–—:.]?\s*/gm, '$1. ')
    .replace(/[–—−]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const nomeSeguro = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 65) || 'planejamento';

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

  let y = MARGEM;

  const textColor = ([r, g, b]: RGB) => pdf.setTextColor(r, g, b);
  const fillColor = ([r, g, b]: RGB) => pdf.setFillColor(r, g, b);
  const drawColor = ([r, g, b]: RGB) => pdf.setDrawColor(r, g, b);

  const estilo = (
    tamanho = 9.6,
    fonte: Fonte = 'normal',
    cor: RGB = COR.texto
  ) => {
    pdf.setFont('helvetica', fonte);
    pdf.setFontSize(tamanho);
    pdf.setCharSpace(0);
    textColor(cor);
  };

  const quebrar = (
    texto: string,
    largura = LARGURA,
    tamanho = 9.6,
    fonte: Fonte = 'normal'
  ) => {
    pdf.setFont('helvetica', fonte);
    pdf.setFontSize(tamanho);
    pdf.setCharSpace(0);

    return pdf.splitTextToSize(texto, largura) as string[];
  };

  const escrever = (texto: string, x: number, yy: number) =>
    pdf.text(texto, x, yy, { charSpace: 0 });

  const cabecalho = (continuacao?: string) => {
    estilo(9.5, 'bold', COR.verde);
    escrever('LOUSA | PLANO DE AULA', MARGEM, 13);

    drawColor(COR.claro);
    pdf.line(MARGEM, 17, 210 - MARGEM, 17);

    y = 25;

    if (continuacao) {
      estilo(8.2, 'bold', COR.cinza);

      const titulo = limpar(`${continuacao} - continuação`);

      quebrar(titulo, LARGURA, 8.2, 'bold').forEach((linha) => {
        estilo(8.2, 'bold', COR.cinza);
        escrever(linha, MARGEM, y);
        y += 4.3;
      });

      y += 2;
    }
  };

  const novaPagina = (continuacao?: string) => {
    pdf.addPage();
    cabecalho(continuacao);
  };

  const garantir = (altura: number, continuacao?: string) => {
    if (y + altura > LIMITE) novaPagina(continuacao);
  };

  const escreverBloco = (
    texto: string,
    tituloSecao: string,
    marcador = false,
    numerada = false
  ) => {
    const corpo = marcador
      ? texto.replace(/^[-•●*]\s+/, '')
      : texto;

    const recuo = marcador ? 5 : numerada ? 2 : 0;
    const tamanho = 9.6;
    const passo = 4.6;

    const linhas = quebrar(corpo, LARGURA - recuo, tamanho);

    if (linhas.length * passo <= 65) {
      garantir(linhas.length * passo + 1, tituloSecao);
    }

    linhas.forEach((linha, indice) => {
      garantir(passo, tituloSecao);

      if (marcador && indice === 0) {
        fillColor(COR.verde);
        pdf.circle(MARGEM + 1.7, y - 1.2, 0.6, 'F');
      }

      estilo(tamanho);
      escrever(linha, MARGEM + recuo, y);
      y += passo;
    });

    y += 0.5;
  };

  const escreverConteudo = (texto: string, tituloSecao: string) => {
    const linhas = limpar(texto).split('\n');

    linhas.forEach((original, indice) => {
      const linha = original.trim();

      if (!linha) {
        y += 2.2;
        return;
      }

      const marcador = /^[-•●*]\s+/.test(linha);
      const numerada = /^\d+[.)]\s+/.test(linha);
      const rotulo = linha.endsWith(':') && linha.length < 65;

      if (rotulo) {
        garantir(14, tituloSecao);
        estilo(9.8, 'bold', COR.verde);

        quebrar(linha, LARGURA, 9.8, 'bold').forEach((parte) => {
          estilo(9.8, 'bold', COR.verde);
          escrever(parte, MARGEM, y);
          y += 4.8;
        });

        if (linhas[indice + 1]?.trim()) y += 1;
        return;
      }

      escreverBloco(linha, tituloSecao, marcador, numerada);
    });
  };

  pdf.setProperties({
    title: conteudo.titulo,
    subject: 'Planejamento de aula',
    author: professor || 'Lousa',
    creator: 'Lousa'
  });

  // Identidade Lousa
  fillColor(COR.verde);
  pdf.roundedRect(MARGEM, y, 7, 7, 1, 1, 'F');

  estilo(15, 'bold', COR.verde);
  escrever('Lousa', MARGEM + 11, y + 5.8);
  y += 18;

  estilo(8, 'bold', COR.verde);
  escrever('PLANEJAMENTO DE AULA', MARGEM, y);
  y += 9;

  // Título criado pela IA
  const titulo = quebrar(limpar(conteudo.titulo), LARGURA, 19, 'bold');

  estilo(19, 'bold', COR.texto);

  titulo.forEach((linha) => {
    escrever(linha, MARGEM, y);
    y += 7.7;
  });

  y += 3;

  if (professor) {
    const linhas = quebrar(
      `Professor(a): ${limpar(professor)}`,
      LARGURA,
      9
    );

    linhas.forEach((linha) => {
      estilo(9);
      escrever(linha, MARGEM, y);
      y += 4.5;
    });
  }

  estilo(8, 'normal', COR.cinza);

  escrever(
    `Gerado em ${new Intl.DateTimeFormat('pt-BR').format(new Date())}`,
    MARGEM,
    y
  );

  y += 10;

  // Dados da aula
  const infos = [
    ['Nível', dados.nivelEnsino || 'Não informado'],
    ['Matéria', dados.materia],
    ['Turma / período', dados.turma],
    ['Duração', `${dados.duracao} min`]
  ];

  const col = (LARGURA - 18) / 2;

  const valores = infos.map(([rotulo, valor]) => ({
    rotulo,
    linhas: quebrar(limpar(valor), col - 5, 9.4, 'bold')
  }));

  const alturaLinha = (a: number, b: number) =>
    Math.max(16, 8 + Math.max(a, b) * 4.3);

  const h1 = alturaLinha(
    valores[0].linhas.length,
    valores[1].linhas.length
  );

  const h2 = alturaLinha(
    valores[2].linhas.length,
    valores[3].linhas.length
  );

  const alturaQuadro = h1 + h2 + 12;

  garantir(alturaQuadro + 10);

  fillColor(COR.verde);
  pdf.roundedRect(MARGEM, y, LARGURA, alturaQuadro, 3, 3, 'F');

  const topo = y;

  valores.forEach(({ rotulo, linhas }, i) => {
    const coluna = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGEM + 6 + coluna * (col + 6);
    const yy = topo + 9 + (row ? h1 + 2 : 0);

    estilo(7.3, 'bold', [182, 202, 190]);
    escrever(rotulo.toUpperCase(), x, yy);

    linhas.forEach((linha, index) => {
      estilo(9.4, 'bold', COR.branco);
      escrever(linha, x, yy + 5 + index * 4.3);
    });
  });

  y = topo + alturaQuadro + 12;

  // Seções livres definidas pela IA
  conteudo.secoes.forEach((secao) => {
    const tituloSecao = limpar(secao.titulo);
    const linhasTitulo = quebrar(tituloSecao, LARGURA, 12, 'bold');

    garantir(12 + linhasTitulo.length * 5.4, tituloSecao);
    y += 2;

    linhasTitulo.forEach((linha) => {
      estilo(12, 'bold', COR.verde);
      escrever(linha, MARGEM, y);
      y += 5.4;
    });

    y += 3;

    escreverConteudo(secao.conteudo, tituloSecao);

    if (y + 7 <= LIMITE) {
      y += 3;
      drawColor(COR.claro);
      pdf.line(MARGEM, y, 210 - MARGEM, y);
      y += 4;
    }
  });

  if (dados.observacoes?.trim()) {
    garantir(14);

    estilo(10, 'bold', COR.verde);
    escrever('Observações informadas pelo professor', MARGEM, y);
    y += 7;

    escreverConteudo(
      dados.observacoes,
      'Observações do professor'
    );
  }

  // Rodapé
  const total = pdf.getNumberOfPages();

  for (let pagina = 1; pagina <= total; pagina++) {
    pdf.setPage(pagina);

    drawColor(COR.claro);
    pdf.line(MARGEM, 281, 210 - MARGEM, 281);

    estilo(7.4, 'normal', COR.cinza);
    escrever('Lousa | Plano de aula', MARGEM, 288);

    pdf.text(
      `Página ${pagina} de ${total}`,
      210 - MARGEM,
      288,
      { align: 'right', charSpace: 0 }
    );
  }

  pdf.save(`plano-de-aula-${nomeSeguro(conteudo.titulo)}.pdf`);
};