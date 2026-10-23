import React from 'react';
import { Route } from 'react-router-dom';

import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';

import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/login';
import Home from './pages/Home';
import Planejamentos from './pages/Planejamentos';
import GerandoPlano from './pages/GerandoPlano';
import PlanoGerado from './pages/PlanoGerado';
import AdminUsuarios from './pages/AdminUsuarios';
import PaginaNaoEncontrada from './pages/PaginaNaoEncontrada';

import BotaoTema from './components/BotaoTema';

import {
  PaginaInicial,
  RotaAdmin,
  RotaProtegida
} from './rotas/RotasProtegidas';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';

import '@ionic/react/css/palettes/dark.class.css';

import './theme/variables.css';
import './theme/responsive.css';
import './theme/acessibility.css';
import './theme/dark.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/usuarios"
          element={
            <RotaAdmin>
              <AdminUsuarios />
            </RotaAdmin>
          }
        />

        <Route
          path="/planejamentos"
          element={
            <RotaProtegida>
              <Planejamentos />
            </RotaProtegida>
          }
        />

        <Route
          path="/home"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />

        <Route
          path="/gerando-plano"
          element={
            <RotaProtegida>
              <GerandoPlano />
            </RotaProtegida>
          }
        />

        <Route
          path="/plano-gerado"
          element={
            <RotaProtegida>
              <PlanoGerado />
            </RotaProtegida>
          }
        />

        <Route path="/" element={<PaginaInicial />} />
        <Route path="*" element={<PaginaNaoEncontrada />} />

      </IonRouterOutlet>

      <BotaoTema />
    </IonReactRouter>
  </IonApp>
);

export default App;