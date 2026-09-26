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

import Home from './pages/Home';

import PlanoGerado from './pages/PlanoGerado';

import Planejamentos from './pages/Planejamentos';

/* IONIC CSS */

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

const App: React.FC = () => (
  <IonApp>

    <IonReactRouter>

      <IonRouterOutlet>

        {/* HOME */}

        <Route
          path="/home"
          element={
            <Home />
          }
        />

        {/* PLANO GERADO */}

        <Route
          path="/plano-gerado"
          element={
            <PlanoGerado />
          }
        />

        {/* PLANEJAMENTOS SALVOS */}

        <Route
          path="/planejamentos"
          element={
            <Planejamentos />
          }
        />

        {/* REDIRECIONAMENTO */}

        <Route
          path="/"
          element={
            <Navigate
              to="/planejamentos"
              replace
            />
          }
        />

      </IonRouterOutlet>

    </IonReactRouter>

  </IonApp>
);

export default App;