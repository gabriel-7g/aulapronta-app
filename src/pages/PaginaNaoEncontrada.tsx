import React from 'react';

import {
  IonContent,
  IonPage,
  useIonRouter
} from '@ionic/react';

import {
  estaAutenticado
} from '../utils/auth';

import './PaginaNaoEncontrada.css';


const PaginaNaoEncontrada: React.FC = () => {
  const router = useIonRouter();

  const usuarioLogado =
    estaAutenticado();


  const voltarAoSistema = () => {
    router.push(
      usuarioLogado ? '/' : '/login',
      'root'
    );
  };


  return (
    <IonPage>

      <IonContent
        fullscreen
        className="conteudo-404"
      >

        <main className="pagina-404">

          {/* MARCA */}

          <div className="marca-404">

            <span className="marca-404-simbolo" />

            <span>
              Lousa
            </span>

          </div>


          {/* CARD */}

          <section className="card-404">

            <span
              className="fita-404"
              aria-hidden="true"
            />


            <div
              className="numero-404"
              aria-hidden="true"
            >
              404
            </div>


            <span className="etiqueta-404">
              página não encontrada
            </span>


            <h1>
              Parece que essa aula não está no quadro.
            </h1>


            <p>
              O endereço acessado não existe ou pode ter sido
              digitado incorretamente.
            </p>


            <button
              type="button"
              className="botao-voltar-404"
              onClick={voltarAoSistema}
            >
              {usuarioLogado
                ? 'Voltar ao sistema'
                : 'Ir para o login'}
            </button>

          </section>


          <p className="rodape-404">
            Planejamentos mais simples.
            Aulas mais organizadas.
          </p>

        </main>

      </IonContent>

    </IonPage>
  );
};


export default PaginaNaoEncontrada;