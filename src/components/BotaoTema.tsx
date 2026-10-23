import React, { useEffect, useState } from 'react';
import './BotaoTema.css';

const CHAVE_TEMA = 'lousa-tema';

const BotaoTema: React.FC = () => {
  const [escuro, setEscuro] = useState(
    () => localStorage.getItem(CHAVE_TEMA) === 'escuro'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('ion-palette-dark', escuro);
    localStorage.setItem(CHAVE_TEMA, escuro ? 'escuro' : 'claro');
  }, [escuro]);

  return (
    <button
      type="button"
      className="botao-tema"
      aria-label={escuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-pressed={escuro}
      title={escuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={() => setEscuro((atual) => !atual)}
    >
      <span aria-hidden="true">{escuro ? '☀' : '☾'}</span>
      <span>{escuro ? 'Modo claro' : 'Modo escuro'}</span>
    </button>
  );
};

export default BotaoTema;