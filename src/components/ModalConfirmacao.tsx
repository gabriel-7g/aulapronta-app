import React, { useEffect, useRef } from 'react';

import './ModalConfirmacao.css';


interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  perigo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}


const ModalConfirmacao: React.FC<ModalConfirmacaoProps> = ({
  aberto,
  titulo,
  descricao,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigo = false,
  onConfirmar,
  onCancelar
}) => {

  const modalRef = useRef<HTMLDivElement>(null);

  const botaoCancelarRef = useRef<HTMLButtonElement>(null);


  /* =====================================================
     TECLADO, FOCO E ACESSIBILIDADE
     ===================================================== */

  useEffect(() => {

    if (!aberto) {
      return;
    }


    /*
      Guarda o elemento que estava com foco
      antes de abrir o modal.
    */

    const elementoAtivo = document.activeElement;

    const elementoAnterior =
      elementoAtivo instanceof HTMLElement
        ? elementoAtivo
        : null;


    /*
      Evita que a página role atrás do modal.
    */

    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = 'hidden';


    /*
      Coloca o foco inicialmente no botão Cancelar.
    */

    const timeout = window.setTimeout(() => {

      botaoCancelarRef.current?.focus();

    }, 0);


    /*
      Controle do teclado.
    */

    const tratarTeclado = (evento: KeyboardEvent) => {

      /*
        ESC fecha o modal.
      */

      if (evento.key === 'Escape') {

        evento.preventDefault();

        onCancelar();

        return;
      }


      /*
        TAB fica preso dentro do modal.
      */

      if (evento.key !== 'Tab') {
        return;
      }


      if (!modalRef.current) {
        return;
      }


      const elementos = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
          ].join(',')
        )
      );


      if (elementos.length === 0) {
        return;
      }


      const primeiroElemento = elementos[0];

      const ultimoElemento = elementos[elementos.length - 1];


      /*
        SHIFT + TAB no primeiro elemento:
        manda para o último.
      */

      if (
        evento.shiftKey &&
        document.activeElement === primeiroElemento
      ) {

        evento.preventDefault();

        ultimoElemento.focus();

        return;
      }


      /*
        TAB no último elemento:
        volta para o primeiro.
      */

      if (
        !evento.shiftKey &&
        document.activeElement === ultimoElemento
      ) {

        evento.preventDefault();

        primeiroElemento.focus();

      }

    };


    document.addEventListener(
      'keydown',
      tratarTeclado
    );


    /*
      Limpeza quando o modal fecha.
    */

    return () => {

      window.clearTimeout(timeout);

      document.removeEventListener(
        'keydown',
        tratarTeclado
      );

      document.body.style.overflow =
        overflowAnterior;


      /*
        Devolve o foco para o botão
        que abriu o modal.
      */

      elementoAnterior?.focus();

    };

  }, [aberto, onCancelar]);


  /* =====================================================
     MODAL FECHADO
     ===================================================== */

  if (!aberto) {
    return null;
  }


  /* =====================================================
     CLICAR FORA
     ===================================================== */

  const clicarNoFundo = (
    evento: React.MouseEvent<HTMLDivElement>
  ) => {

    /*
      Só fecha se clicar no fundo.

      Clicar dentro da caixa do modal
      não fecha.
    */

    if (evento.target === evento.currentTarget) {

      onCancelar();

    }

  };


  /* =====================================================
     TELA
     ===================================================== */

  return (

    <div
      className="modal-confirmacao-overlay"
      onMouseDown={clicarNoFundo}
    >

      <div
        ref={modalRef}
        className="modal-confirmacao"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacao-titulo"
        aria-describedby="modal-confirmacao-descricao"
      >

        {/* ÍCONE */}

        <div
          className={
            perigo
              ? 'modal-confirmacao-icone modal-confirmacao-icone-perigo'
              : 'modal-confirmacao-icone'
          }
          aria-hidden="true"
        >
          !
        </div>


        {/* TÍTULO */}

        <h2 id="modal-confirmacao-titulo">
          {titulo}
        </h2>


        {/* DESCRIÇÃO */}

        <p id="modal-confirmacao-descricao">
          {descricao}
        </p>


        {/* BOTÕES */}

        <div className="modal-confirmacao-acoes">

          <button
            ref={botaoCancelarRef}
            type="button"
            className="modal-confirmacao-cancelar"
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>


          <button
            type="button"
            className={
              perigo
                ? 'modal-confirmacao-confirmar modal-confirmacao-confirmar-perigo'
                : 'modal-confirmacao-confirmar'
            }
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>

        </div>

      </div>

    </div>

  );

};


export default ModalConfirmacao;