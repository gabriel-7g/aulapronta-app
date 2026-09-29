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


/* =========================================================
   PÁGINAS
   ========================================================= */

import Login
  from './pages/login';

import Planejamentos
  from './pages/Planejamentos';

import Home
  from './pages/Home';

import GerandoPlano
  from './pages/GerandoPlano';

import PlanoGerado
  from './pages/PlanoGerado';

import AdminUsuarios
  from './pages/AdminUsuarios';


/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

import {
  ehAdministrador,
  estaAutenticado
} from './utils/auth';


/* =========================================================
   IONIC CSS
   ========================================================= */

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


/* =========================================================
   ROTA PROTEGIDA
   ========================================================= */

interface RotaProtegidaProps {

  children:
    React.ReactNode;

}


const RotaProtegida:
React.FC<
  RotaProtegidaProps
> = ({
  children
}) => {

  if (
    !estaAutenticado()
  ) {

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


/* =========================================================
   ROTA DE ADMINISTRADOR
   ========================================================= */

interface RotaAdminProps {

  children:
    React.ReactNode;

}


const RotaAdmin:
React.FC<
  RotaAdminProps
> = ({
  children
}) => {

  /*
    Primeiro verificamos se
    existe uma sessão válida.
  */

  if (
    !estaAutenticado()
  ) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  /*
    Depois verificamos se
    realmente é administrador.
  */

  if (
    !ehAdministrador()
  ) {

    return (

      <Navigate
        to="/planejamentos"
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


/* =========================================================
   APP
   ========================================================= */

const App:
React.FC = () => (

  <IonApp>

    <IonReactRouter>

      <IonRouterOutlet>


        {/* LOGIN */}

        <Route
          path="/login"

          element={
            <Login />
          }
        />


        {/* ===============================================
            ADMINISTRADOR
           =============================================== */}

        <Route
          path="/admin/usuarios"

          element={

            <RotaAdmin>

              <AdminUsuarios />

            </RotaAdmin>

          }
        />


        {/* ===============================================
            PLANEJAMENTOS
           =============================================== */}

        <Route
          path="/planejamentos"

          element={

            <RotaProtegida>

              <Planejamentos />

            </RotaProtegida>

          }
        />


        {/* ===============================================
            CRIAR PLANO
           =============================================== */}

        <Route
          path="/home"

          element={

            <RotaProtegida>

              <Home />

            </RotaProtegida>

          }
        />


        {/* ===============================================
            GERANDO PLANO
           =============================================== */}

        <Route
          path="/gerando-plano"

          element={

            <RotaProtegida>

              <GerandoPlano />

            </RotaProtegida>

          }
        />


        {/* ===============================================
            PLANO GERADO
           =============================================== */}

        <Route
          path="/plano-gerado"

          element={

            <RotaProtegida>

              <PlanoGerado />

            </RotaProtegida>

          }
        />


        {/* ===============================================
            PÁGINA INICIAL
           =============================================== */}

        <Route
          path="/"

          element={

            estaAutenticado()

              ? (

                ehAdministrador()

                  ? (

                    <Navigate
                      to=
                        "/admin/usuarios"

                      replace
                    />

                  )

                  : (

                    <Navigate
                      to=
                        "/planejamentos"

                      replace
                    />

                  )

              )

              : (

                <Navigate
                  to="/login"
                  replace
                />

              )

          }
        />


        {/* ===============================================
            URL INVÁLIDA
           =============================================== */}

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