import { useState } from "react";
import { Route, Routes } from "react-router-dom";
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
import Prueba from "./components/Cursos/Prueba";
import RegistroAlumnos from "./components/Formularios/RegistroAlumnos";
import { RegistroPagos } from "./components/Formularios/RegistroPagos";

const App = () => {
  return (
    <div>
      <PrincipalHeader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="/reset_password" element={<ResetPasswordSendEmail />} />
        <Route path="/reset_password/:code" element={<ChangePassword />} />

        <Route path="/register_discente/:code" element={<RegistroAlumnos />} />
        <Route path="/register_pago/:code" element={<RegistroPagos />} />

        <Route path="/giscopnsc" element={<Giscopnsc />} />
        <Route path="/prueba" element={<Prueba />} />

        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
      <Alert />
    </div>
  );
};

export default App;
