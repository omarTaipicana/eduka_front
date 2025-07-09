import React, { useEffect, useState, useRef } from "react";
import "./styles/Home.css";
import useAuth from "../hooks/useAuth";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";

const Home = () => {
  const token = localStorage.getItem("token");
  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";
  const PATH_PAGOS = "/pagos";

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [course, getCourse] = useCrud();
  const [inscripciones, getInscripcion] = useCrud();
  const [pago, getPago] = useCrud();

  const [activeSection, setActiveSection] = useState("datos-personales");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    getInscripcion(PATH_INSCRIPCIONES);
    getCourse(PATH_COURSES);
    getPago(PATH_PAGOS);
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

  const inscritos = inscripciones?.filter((i) => i.email === user?.email);
  const cursosInscritos = course?.filter((c) =>
    inscritos?.some((i) => i.courseId === c.id)
  );

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      dias += ultimoMes.getDate();
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    return `${años} años ${meses} meses ${dias} días`;
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
          className={`menu-btn ${
            activeSection === "datos-personales" ? "active" : ""
          }`}
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
          className={`menu-btn ${
            activeSection === "calificaciones" ? "active" : ""
          }`}
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
          className={`menu-btn ${
            activeSection === "advertencia" ? "active" : ""
          }`}
          onClick={() => handleSelect("advertencia")}
        >
          ⚠️ Importante
        </button>
      </nav>

      <main className="home-content" tabIndex="-1">
        {activeSection === "datos-personales" && (
          <section className="section datos-personales">
            <h2>📄 Datos personales</h2>
            {user ? (
              <ul className="data-list">
                <li>
                  <strong>Nombre:</strong>{" "}
                  {user.firstName && user.lastName ? (
                    `${user.firstName} ${user.lastName}`
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
                <li>
                  <strong>Cédula:</strong>{" "}
                  {user.cI ? (
                    user.cI
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
                <li>
                  <strong>Email:</strong>{" "}
                  {user.email ? (
                    user.email
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
                <li>
                  <strong>Celular:</strong>{" "}
                  {user.cellular ? (
                    user.cellular
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
                <li>
                  <strong>Edad:</strong>{" "}
                  {user.dateBirth ? (
                    calcularEdad(user.dateBirth)
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
                <li>
                  <strong>Provincia:</strong>{" "}
                  {user.province ? (
                    user.province
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
                <li>
                  <strong>Ciudad:</strong>{" "}
                  {user.city ? (
                    user.city
                  ) : (
                    <span style={{ color: "red" }}>
                      Complete información en su perfil
                    </span>
                  )}
                </li>
              </ul>
            ) : (
              <IsLoading />
            )}
          </section>
        )}

        {activeSection === "cursos" && (
          <section className="section cursos">
            <h2>📚 Cursos inscritos</h2>
            {cursosInscritos?.length > 0 ? (
              <ul className="curso-list">
                {cursosInscritos.map((curso) => (
                  <li key={curso.id} className="curso-item">
                    <span className="curso-icon">🔹</span>{" "}
                    <a
                      href={`https://acadexeduc.com/course/view.php?name=${curso.sigla}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "none",
                        color: "#007bff",
                        fontWeight: "bold",
                      }}
                    >
                      {curso.nombre}
                    </a>
                  </li>
                ))}
              </ul>
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
            {user ? (
              (() => {
                const pagosDelUsuario = pago?.filter((p) =>
                  inscripciones?.some(
                    (i) => i.id === p.inscripcionId && i.email === user.email
                  )
                );

                if (pagosDelUsuario?.length > 0) {
                  return pagosDelUsuario.map((pagoItem, i) => {
                    const insc = inscripciones?.find(
                      (i) => i.id === pagoItem.inscripcionId
                    );
                    const curso = course?.find((c) => c.id === insc?.courseId);

                    const extras = [];
                    if (pagoItem.moneda) extras.push("moneda");
                    if (pagoItem.distintivo) extras.push("distintivo");

                    return (
                      <div
                        key={pagoItem.id}
                        className="pago_item"
                        style={{ marginBottom: "1.5rem" }}
                      >
                        <p>
                          <strong>Pago #{i + 1}</strong>{" "}
                          {i === 0
                            ? `por el certificado${
                                extras.length > 0
                                  ? ", incluyendo " + extras.join(" y ")
                                  : ""
                              }`
                            : extras.length > 0
                            ? `por ${extras.join(" y ")}`
                            : ""}
                          .
                        </p>
                        <p>
                          <strong>Curso:</strong> {curso?.nombre || "—"}
                        </p>
                        <p>
                          <strong>Estado:</strong>{" "}
                          {pagoItem.verificado
                            ? "✅ Verificado"
                            : "⏳ Por verificar"}
                        </p>
                        <p>
                          <strong>Monto:</strong> ${pagoItem.valorDepositado}
                        </p>
                        <a
                          className="modal_pago_ver_imagen"
                          href={pagoItem.pagoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#007bff",
                            textDecoration: "underline",
                          }}
                        >
                          Ver comprobante de pago
                        </a>
                        <hr />
                      </div>
                    );
                  });
                } else {
                  return <p>No se encontraron pagos registrados.</p>;
                }
              })()
            ) : (
              <p>No se encontraron pagos registrados.</p>
            )}
          </section>
        )}

        {activeSection === "advertencia" && (
          <section className="section advertencia">
            <h2>⚠️ Importante</h2>
            <p>
              Verifica que tus datos estén correctos, ya que se utilizarán en el
              certificado. Para correcciones, comunícate con el administrador.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
