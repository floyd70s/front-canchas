import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LogoutButton } from "./Logout";

export const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    isAuthenticated && (
      <div className="user-menu">
        <img src={user.picture} alt={user.name} className="avatar-img" />
        <div className="user-info profile-container"> {/* Agrega la clase profile-container */}
          <h2>{user.name}</h2>
          <p>Email: {user.email}</p>
          <div className="logout-button">
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  );
};
