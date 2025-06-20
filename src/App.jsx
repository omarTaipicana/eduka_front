import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Alert from "./components/shared/Alert";
import Home from "./pages/Home";
import PrincipalHeader from "./components/shared/PrincipalHeader";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import ResetPasswordSendEmail from "./pages/auth/ResetPasswordSendEmail";
import ChangePassword from "./pages/auth/ChangePassword";
import Footer from "./components/shared/Footer";
import Giscopnsc from "./components/Cursos/Giscopnsc";
import RegistroAlumnos from "./components/Formularios/RegistroAlumnos";
import { RegistroPagos } from "./components/Formularios/RegistroPagos";
import Accv from "./components/Cursos/Accv";

const App = () => {
  const location = useLocation();

  return (
    <div>
      {location.pathname !== "/" && <PrincipalHeader />}
      <Routes>
        <Route path="/home" element={<Home />} />

        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="/reset_password" element={<ResetPasswordSendEmail />} />
        <Route path="/reset_password/:code" element={<ChangePassword />} />

        <Route path="/register_discente/:code" element={<RegistroAlumnos />} />
        <Route path="/register_pago/:code" element={<RegistroPagos />} />

        <Route path="/giscopnsc" element={<Giscopnsc />} />
        <Route path="/accv" element={<Accv />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
      <Alert />
    </div>
  );
};

export default App;
