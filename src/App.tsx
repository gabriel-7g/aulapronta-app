import React from 'react';

import {
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

import Login from './pages/login';
import Home from './pages/Home';
import Planejamentos from './pages/Planejamentos';
import GerandoPlano from './pages/GerandoPlano';
import PlanoGerado from './pages/PlanoGerado';
import AdminUsuarios from './pages/AdminUsuarios';
import PaginaNaoEncontrada from './pages/PaginaNaoEncontrada';


/* =========================================================
   ROTAS
   ========================================================= */

import {
  PaginaInicial,
  RotaAdmin,
  RotaProtegida
} from './rotas/RotasProtegidas';


/* =========================================================
   IONIC
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

import '@ionic/react/css/palettes/dark.system.css';


/* =========================================================
   TEMA GLOBAL
   ========================================================= */

import './theme/variables.css';
import './theme/responsive.css';
import './theme/accessibility.css';


setupIonicReact();


/* =========================================================
   APP
   ========================================================= */

const App: React.FC = () => {
  return (
    <IonApp>

      <IonReactRouter>

        <IonRouterOutlet>


          {/* LOGIN */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ADMIN */}

          <Route
            path="/admin/usuarios"
            element={
              <RotaAdmin>
                <AdminUsuarios />
              </RotaAdmin>
            }
          />


          {/* PLANEJAMENTOS */}

          <Route
            path="/planejamentos"
            element={
              <RotaProtegida>
                <Planejamentos />
              </RotaProtegida>
            }
          />


          {/* NOVO PLANO */}

          <Route
            path="/home"
            element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            }
          />


          {/* GERANDO */}

          <Route
            path="/gerando-plano"
            element={
              <RotaProtegida>
                <GerandoPlano />
              </RotaProtegida>
            }
          />


          {/* PLANO GERADO */}

          <Route
            path="/plano-gerado"
            element={
              <RotaProtegida>
                <PlanoGerado />
              </RotaProtegida>
            }
          />


          {/* INÍCIO */}

          <Route
            path="/"
            element={<PaginaInicial />}
          />


          {/* 404 */}

          <Route
            path="*"
            element={<PaginaNaoEncontrada />}
          />


        </IonRouterOutlet>

      </IonReactRouter>

    </IonApp>
  );
};


export default App;