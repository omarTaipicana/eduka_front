// App.jsx
import React from "react";
import "./App.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

const App = () => {
  return (
    <div className="app">
      <nav className="navbar">
        <img
          src="/images/eduka_sf.png"
          alt="Logo Eduka"
          className="logo-navbar"
        />
        <div className="navbar-links">
          <a href="#inicio">Inicio</a>
          <a href="#cursos">Cursos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </div>
      </nav>

      <header className="header" id="inicio">
        <img src="/images/eduka_sf.png" alt="Logo Eduka" className="logo" />
        <h1>Tu camino al conocimiento empieza aquí</h1>
        <p>Aprende, crece, y mejora con nuestros cursos.</p>
        <a href="#contacto" className="cta-button">
          Contáctanos
        </a>
      </header>

      <section className="cursos" id="cursos">
        <h2>Nuestros Cursos</h2>
        <div className="curso-lista">
          <div className="curso">
            <h3>Curso de React</h3>
            <p>Aprende React desde cero hasta avanzado.</p>
          </div>
          <div className="curso">
            <h3>Curso de Power BI</h3>
            <p>Crea dashboards profesionales e interactivos.</p>
          </div>
          <div className="curso">
            <h3>Curso de Node.js</h3>
            <p>Desarrolla aplicaciones backend escalables.</p>
          </div>
        </div>
      </section>

      <section className="nosotros" id="nosotros">
        <h2>Nosotros</h2>
        <p>
          Eduka es una organización dedicada a ofrecer cursos de alta calidad en
          diversas áreas del conocimiento. Nuestros programas están diseñados
          para ayudar a los estudiantes a adquirir nuevas habilidades y avanzar
          en sus carreras profesionales.
        </p>
      </section>

      <section className="contacto" id="contacto">
        <h2>Contáctanos</h2>
        <form className="formulario">
          <input type="text" placeholder="Nombre" required />
          <input type="email" placeholder="Correo electrónico" required />
          <textarea rows="4" placeholder="Mensaje" required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </section>

      <footer className="footer">
        <p>Síguenos en redes sociales</p>
        <div className="redes-sociales">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
        <a
          className="whatsapp-button"
          href="https://wa.me/593999999999"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contáctanos por WhatsApp
        </a>
        <p>&copy; 2025 Eduka. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
