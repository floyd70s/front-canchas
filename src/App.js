import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Menu from "./components/menu";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Menu />
    </div>
  );
}

export default App;
