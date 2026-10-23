import React, { useCallback, useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';

import { obterToken } from '../utils/auth';
import './ConsumoIa.css';

interface SaldoIa {
  limite: number;
  usados: number;
  reservados: number;
  disponiveis: number;
  geracoes: number;
}

interface ConsumoIaResposta {
  dia: string;
  usuario: SaldoIa;
  global: SaldoIa;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const numero = (valor: number) =>
  new Intl.NumberFormat('pt-BR').format(valor);

const ConsumoIa: React.FC = () => {
  const [consumo, setConsumo] = useState<ConsumoIaResposta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarConsumo = useCallback(async () => {
    const token = obterToken();

    if (!token) {
      setCarregando(false);
      setErro('Faça login para consultar seu consumo.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const resposta = await fetch(`${API_URL}/api/ia/meu-consumo`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!resposta.ok) {
        throw new Error('Não foi possível consultar o consumo da IA.');
      }

      const dados: ConsumoIaResposta = await resposta.json();
      setConsumo(dados);
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : 'Ocorreu um erro ao consultar seu consumo.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void carregarConsumo();
  }, [carregarConsumo]);

  const usuario = consumo?.usuario;
  const global = consumo?.global;

  const comprometidos = usuario
    ? usuario.usados + usuario.reservados
    : 0;

  const percentual = usuario?.limite
    ? Math.min(100, Math.round((comprometidos / usuario.limite) * 100))
    : 0;

  const cotaEsgotada = Boolean(
    usuario && global &&
    (usuario.disponiveis <= 0 || global.disponiveis <= 0)
  );

  return (
    <section className="consumo-ia" aria-label="Consumo de inteligência artificial">
      <div className="consumo-ia-topo">
        <div>
          <span className="consumo-ia-etiqueta">inteligência artificial</span>
          <h2>Seu consumo de IA</h2>
          <p>Acompanhe seus tokens e planejamentos gerados hoje.</p>
        </div>

        <button
          type="button"
          className="consumo-ia-atualizar"
          disabled={carregando}
          onClick={() => void carregarConsumo()}
        >
          {carregando ? 'Atualizando...' : '↻ Atualizar'}
        </button>
      </div>

      {erro && (
        <p className="consumo-ia-erro" role="alert">
          {erro}
        </p>
      )}

      {!consumo && carregando && (
        <p className="consumo-ia-carregando">Consultando seu consumo...</p>
      )}

      {usuario && global && (
        <>
          <div className="consumo-ia-numeros">
            <div className="consumo-ia-destaque">
              <span>Tokens disponíveis</span>
              <strong>{numero(usuario.disponiveis)}</strong>
              <small>de {numero(usuario.limite)} tokens diários</small>
            </div>

            <div className="consumo-ia-metrica">
              <span>Tokens utilizados</span>
              <strong>{numero(usuario.usados)}</strong>
            </div>

            <div className="consumo-ia-metrica">
              <span>Planos gerados</span>
              <strong>{numero(usuario.geracoes)}</strong>
            </div>
          </div>

          <div className="consumo-ia-progresso">
            <div className="consumo-ia-progresso-topo">
              <span>Uso da sua cota diária</span>
              <strong>{percentual}%</strong>
            </div>

            <div
              className="consumo-ia-barra"
              role="progressbar"
              aria-label="Cota diária comprometida"
              aria-valuenow={Math.min(comprometidos, usuario.limite)}
              aria-valuemin={0}
              aria-valuemax={usuario.limite}
            >
              <div
                className="consumo-ia-barra-preenchimento"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>

          {usuario.reservados > 0 && (
            <p className="consumo-ia-observacao">
              {numero(usuario.reservados)} tokens estão reservados para
              gerações em andamento.
            </p>
          )}

          {cotaEsgotada && (
            <p className="consumo-ia-aviso" role="status">
              {usuario.disponiveis <= 0
                ? 'Sua cota diária de IA foi atingida.'
                : 'A cota geral de IA do Lousa foi atingida hoje.'}
            </p>
          )}

          <p className="consumo-ia-rodape">
            Referência: {consumo.dia.split('-').reverse().join('/')}
            {' · '}A cota é renovada diariamente. Cada geração utiliza
            tokens de entrada e saída, e exige saldo suficiente para a
            reserva estimada.
          </p>
        </>
      )}
    </section>
  );
};

export default ConsumoIa;