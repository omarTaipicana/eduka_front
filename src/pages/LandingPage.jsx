import React, { useState } from "react";
import "./styles/LandingPage.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";

const LandingPage = () => {
 const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };
  

  return (
    <div className="app">
      <nav className="navbar">
        <img
          src="/images/eduka_sf.png"
          alt="Logo Eduka"
          className="logo_navbar"
        />
        <div className="menu_icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`navbar_links ${menuOpen ? "open" : ""}`}>
          <a href="#inicio" onClick={toggleMenu}>
            Inicio
          </a>
          <a href="#cursos" onClick={toggleMenu}>
            Cursos
          </a>
          <a href="#nosotros" onClick={toggleMenu}>
            Nosotros
          </a>
          <a href="#contacto" onClick={toggleMenu}>
            Contacto
          </a>
        </div>
      </nav>

      <header className="header" id="inicio">
        <motion.img
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src="/images/eduka_sf.png"
          alt="Logo Eduka"
          className="logo"
        />
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Tu camino al conocimiento empieza aquí
        </motion.h1>
        <p>Aprende, crece, y mejora con nuestros cursos.</p>
        <a href="#contacto" className="cta_button">
          Contáctanos
        </a>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cursos"
        id="cursos"
      >
        <h2>Nuestros Cursos</h2>
        <div className="curso_lista">
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
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="nosotros"
        id="nosotros"
      >
        <h2>Nosotros</h2>
        <p>
          Eduka es una organización dedicada a ofrecer cursos de alta calidad en
          diversas áreas del conocimiento. Nuestros programas están diseñados
          para ayudar a los estudiantes a adquirir nuevas habilidades y avanzar
          en sus carreras profesionales.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="contacto"
        id="contacto"
      >
        <h2>Contáctanos</h2>
        <form className="formulario">
          <input type="text" placeholder="Nombre" required />
          <input type="email" placeholder="Correo electrónico" required />
          <textarea rows="4" placeholder="Mensaje" required></textarea>
          <button type="submit">Enviar</button>
        </form>
      </motion.section>

      <footer className="footer">
        <p>Síguenos en redes sociales</p>
        <div className="redes_sociales">
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
        <div className="btn_acceso">
          <a
            className="whatsapp_button"
            href="https://wa.me/593983029083"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contáctanos por WhatsApp
          </a>

          <a
            className="plataforma_button"
            href="https://acadexeduc.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Accede a nuestra Plataforma Educativa MOODLE ACADEX
          </a>
        </div>

        <p>&copy; 2025 Eduka. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
export default LandingPage