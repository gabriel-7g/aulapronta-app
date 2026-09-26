import React from 'react';

import {
  Navigate,
  Route
} from 'react-router-dom';

import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';

import {
  IonReactRouter
} from '@ionic/react-router';


/* PÁGINAS */

import Login from './pages/login';

import CriarConta from './pages/CriarConta';

import Home from './pages/Home';

import PlanoGerado from './pages/PlanoGerado';

import Planejamentos from './pages/Planejamentos';


/* AUTENTICAÇÃO */

import {
  estaAutenticado
} from './utils/auth';


/* IONIC */

import '@ionic/react/css/core.css';

import '@ionic/react/css/normalize.css';

import '@ionic/react/css/structure.css';

import '@ionic/react/css/typography.css';

import '@ionic/react/css/padding.css';

import '@ionic/react/css/float-elements.css';

import '@ionic/react/css/text-alignment.css';

import '@ionic/react/css/text-transformation.css';

import '@ionic/react/css/flex-utils.css';

import '@ionic/react/css/display.css';


/* DARK MODE */

import '@ionic/react/css/palettes/dark.system.css';


/* THEME */

import './theme/variables.css';


setupIonicReact();


/*
  Componente usado para impedir acesso
  às páginas privadas sem login.
*/

interface RotaProtegidaProps {
  children: React.ReactNode;
}

const RotaProtegida:
React.FC<RotaProtegidaProps> = ({
  children
}) => {

  if (!estaAutenticado()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <>
      {children}
    </>
  );
};


const App: React.FC = () => (
  <IonApp>

    <IonReactRouter>

      <IonRouterOutlet>


        {/* =========================
            LOGIN
        ========================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* =========================
            CRIAR CONTA
        ========================= */}

        <Route
          path="/criar-conta"
          element={
            <CriarConta />
          }
        />


        {/* =========================
            MEUS PLANEJAMENTOS
        ========================= */}

        <Route
          path="/planejamentos"
          element={
            <RotaProtegida>

              <Planejamentos />

            </RotaProtegida>
          }
        />


        {/* =========================
            CRIAR PLANO
        ========================= */}

        <Route
          path="/home"
          element={
            <RotaProtegida>

              <Home />

            </RotaProtegida>
          }
        />


        {/* =========================
            PLANO GERADO
        ========================= */}

        <Route
          path="/plano-gerado"
          element={
            <RotaProtegida>

              <PlanoGerado />

            </RotaProtegida>
          }
        />


        {/* =========================
            PÁGINA INICIAL
        ========================= */}

        <Route
          path="/"
          element={
            estaAutenticado()
              ? (
                <Navigate
                  to="/planejamentos"
                  replace
                />
              )
              : (
                <Navigate
                  to="/login"
                  replace
                />
              )
          }
        />


        {/* =========================
            URL INVÁLIDA
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />


      </IonRouterOutlet>

    </IonReactRouter>

  </IonApp>
);

export default App;