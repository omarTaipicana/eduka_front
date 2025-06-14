import React from "react";
import "./styles/Home.css";

const Home = () => {
  return (
    <div className="home-wrapper">
      <div className="home-container">
        <h1 className="home-title">Plataforma en Desarrollo</h1>
        <p className="home-description">
          Estamos trabajando para brindarte una mejor experiencia. Pronto podrás acceder a toda tu información personal, incluyendo:
        </p>
        <ul className="home-list">
          <li>Cursos en los que estás inscrito</li>
          <li>Certificados obtenidos</li>
          <li>Historial de pagos</li>
          <li>Seguimiento completo de tu trayectoria académica</li>
        </ul>
        <p className="home-footer">
          Gracias por tu paciencia y confianza.
        </p>
      </div>
    </div>
  );
};

export default Home;
