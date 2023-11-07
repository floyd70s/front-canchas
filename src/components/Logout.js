import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../App.css";

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <div className="user-info">
      <p
        className="logout-text"
        onClick={() => logout({ returnTo: window.location.origin })}
      >
        Cerrar Sesión
      </p>
    </div>
  );
};