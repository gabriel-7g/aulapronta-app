import React from 'react';

import {
  Navigate
} from 'react-router-dom';

import {
  ehAdministrador,
  estaAutenticado
} from '../utils/auth';


interface RotaProps {
  children: React.ReactNode;
}


/* =========================================================
   USUÁRIO AUTENTICADO
   ========================================================= */

export const RotaProtegida:
React.FC<RotaProps> = ({
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

  return <>{children}</>;
};


/* =========================================================
   ADMINISTRADOR
   ========================================================= */

export const RotaAdmin:
React.FC<RotaProps> = ({
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


  if (!ehAdministrador()) {
    return (
      <Navigate
        to="/planejamentos"
        replace
      />
    );
  }


  return <>{children}</>;
};


/* =========================================================
   ROTA INICIAL
   ========================================================= */

export const PaginaInicial:
React.FC = () => {

  if (!estaAutenticado()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (ehAdministrador()) {
    return (
      <Navigate
        to="/admin/usuarios"
        replace
      />
    );
  }

  return (
    <Navigate to="/planejamentos"replace/>);
};