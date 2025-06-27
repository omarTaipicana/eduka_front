import React, { useEffect, useState, useRef } from "react";
import "./styles/Home.css";
import useAuth from "../hooks/useAuth";
import useCrud from "../hooks/useCrud";

const Home = () => {
  const token = localStorage.getItem("token");
  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [course, getCourse] = useCrud();
  const [inscripciones, getInscripcion] = useCrud();

  const [activeSection, setActiveSection] = useState("datos-personales");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    getInscripcion(PATH_INSCRIPCIONES);
    getCourse(PATH_COURSES);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      const success = await loggedUser();

      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
      }
    };
    checkToken();
  }, [token]);

  // Cerrar menú si clic fuera de menú y fuera del botón hamburguesa
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const inscrito = inscripciones?.find((i) => i.email === user?.email);
  const curso = course?.find((c) => c.id === inscrito?.courseId);

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  return (
    <div className="home-container">
      {/* Botón hamburguesa para mobile */}
      <button
        ref={hamburgerRef}
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
      </button>

      {/* Menú lateral o desplegable */}
      <nav
        className={`home-menu ${menuOpen ? "open" : ""}`}
        ref={menuRef}
        aria-hidden={!menuOpen && window.innerWidth <= 768}
      >
        <button
          className={`menu-btn ${activeSection === "datos-personales" ? "active" : ""}`}
          onClick={() => handleSelect("datos-personales")}
        >
          📄 Datos Personales
        </button>
        <button
          className={`menu-btn ${activeSection === "cursos" ? "active" : ""}`}
          onClick={() => handleSelect("cursos")}
        >
          📚 Cursos Inscritos
        </button>
        <button
          className={`menu-btn ${activeSection === "calificaciones" ? "active" : ""}`}
          onClick={() => handleSelect("calificaciones")}
        >
          📝 Calificaciones
        </button>
        <button
          className={`menu-btn ${activeSection === "pagos" ? "active" : ""}`}
          onClick={() => handleSelect("pagos")}
        >
          💳 Pagos
        </button>
        <button
          className={`menu-btn ${activeSection === "advertencia" ? "active" : ""}`}
          onClick={() => handleSelect("advertencia")}
        >
          ⚠️ Importante
        </button>
      </nav>

      <main className="home-content" tabIndex="-1">
        {activeSection === "datos-personales" && (
          <section className="section datos-personales">
            <h2>📄 Datos personales</h2>
            {inscrito ? (
              <ul className="data-list">
                <li><strong>Grado:</strong> {inscrito.grado}</li>
                <li><strong>Nombre:</strong> {inscrito.nombres} {inscrito.apellidos}</li>
                <li><strong>Cédula:</strong> {inscrito.cedula}</li>
                <li><strong>Email:</strong> {inscrito.email}</li>
                <li><strong>Celular:</strong> {inscrito.celular}</li>
                <li><strong>Subsistema:</strong> {inscrito.subsistema}</li>
              </ul>
            ) : (
              <p>No se encontraron datos personales.</p>
            )}
          </section>
        )}

        {activeSection === "cursos" && (
          <section className="section cursos">
            <h2>📚 Cursos inscritos</h2>
            {curso ? (
              <p>Inscrito en: <strong>{curso.nombre}</strong></p>
            ) : (
              <p>No hay cursos inscritos.</p>
            )}
          </section>
        )}

        {activeSection === "calificaciones" && (
          <section className="section calificaciones">
            <h2>📝 Calificaciones</h2>
            <p>Próximamente podrás consultar tus calificaciones.</p>
          </section>
        )}

        {activeSection === "pagos" && (
          <section className="section pagos">
            <h2>💳 Pagos</h2>
            <p>Se mostrará el estado y comprobantes de pagos.</p>
          </section>
        )}

        {activeSection === "advertencia" && (
          <section className="section advertencia">
            <h2>⚠️ Importante</h2>
            <p>
              Verifica que tus datos estén correctos, ya que se utilizarán en el certificado.
              Para correcciones, comunícate con el administrador.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
