import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Profile } from "./Profile";
import { LogoutButton } from "./Logout";
import { LoginButton } from "./Login";
import ReservasComponent from "./ReservasComponent";
import logo from "../images/logo.png";
import "../App.css";

function Menu() {
    const { isAuthenticated } = useAuth0();

    return (
        <div>
            <div className="menu">
                <div className="menu-left">
                    <div className="initial-screen">
                        <h1>Sistema de Reserva de Canchas</h1>
                        {isAuthenticated ? (
                            <>
                                <p>Reservar Cancha</p>
                                <p>Ver Reportes</p>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className="menu-right">
                    {isAuthenticated ? (
                        <div>
                            <div className="user-menu">
                                <Profile />
                            </div>
                        </div>
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </div>
            {isAuthenticated ? (
                <div className="reservas">
                    <ReservasComponent />
                </div>
            ) : null}
        </div>
    );
}

export default Menu;
