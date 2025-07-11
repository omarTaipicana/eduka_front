import React, { useState, useRef, useEffect } from "react";
import "./styles/Secretaria.css";
import useCrud from "../hooks/useCrud";

const Secretaria = () => {
  const [activeSection, setActiveSection] = useState("inscripciones");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cedulaBuscada, setCedulaBuscada] = useState("");
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";
  const PATH_PAGOS = "/pagos";

  const [courses, getCourses] = useCrud();
  const [inscripciones, getInscripciones] = useCrud();
  const [pagos, getPagos] = useCrud();

  useEffect(() => {
    getInscripciones(PATH_INSCRIPCIONES);
    getCourses(PATH_COURSES);
    getPagos(PATH_PAGOS);
  }, []);

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
    limpiarFiltros();
  };

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
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const limpiarFiltros = () => {
    setCedulaBuscada("");
    setNombreBuscado("");
    setSugerencias([]);
  };

  // Filtrar inscripciones por cédula
  const filtrarInscripcionesPorCedula = inscripciones?.filter(
    (i) => i.cedula === cedulaBuscada.trim()
  );

  // Filtrar inscripciones por nombre para inscripciones
  const filtrarInscripcionesPorNombre = inscripciones?.filter((i) => {
    const nombreCompleto = `${i.nombres} ${i.apellidos}`.toLowerCase();
    return nombreCompleto.includes(nombreBuscado.toLowerCase().trim());
  });

  // Filtrar inscripciones que tienen pagos (ids de inscripciones con pago)
  const inscripcionesConPagoIds = pagos?.map((p) => p.inscripcionId) ?? [];

  // Filtrar inscripciones por nombre para la sección pagos, solo si tienen pagos
  const filtrarInscripcionesPorNombreEnPagos = inscripciones?.filter(
    (i) =>
      inscripcionesConPagoIds.includes(i.id) &&
      `${i.nombres} ${i.apellidos}`.toLowerCase().includes(nombreBuscado.toLowerCase().trim())
  );

  // Manejar búsqueda por nombre (input)
  const handleBuscarPorNombre = (e) => {
    const valor = e.target.value;
    setNombreBuscado(valor);

    if (valor.trim() === "") {
      setSugerencias([]);
      return;
    }

    // Según sección, elegimos qué inscripciones filtrar para sugerencias
    let baseFiltrado = [];

    if (activeSection === "pagos") {
      // Solo inscripciones con pago
      baseFiltrado = inscripciones?.filter((i) =>
        inscripcionesConPagoIds.includes(i.id)
      );
    } else {
      baseFiltrado = inscripciones || [];
    }

    const filtradas = baseFiltrado.filter((i) => {
      const nombreCompleto = `${i.nombres} ${i.apellidos}`.toLowerCase();
      return nombreCompleto.includes(valor.toLowerCase().trim());
    });

    setSugerencias(filtradas.slice(0, 6)); // Limitar sugerencias a 6
  };

  // Al seleccionar sugerencia llenamos input y vaciamos sugerencias
  const seleccionarSugerencia = (sug) => {
    setNombreBuscado(`${sug.nombres} ${sug.apellidos}`);
    setCedulaBuscada(sug.cedula);
    setSugerencias([]);
  };

  // Para mostrar las inscripciones filtradas por nombre o cédula según lo que se use
  let inscripcionesAMostrar = [];

  if (cedulaBuscada.trim() !== "") {
    inscripcionesAMostrar = filtrarInscripcionesPorCedula;
  } else if (nombreBuscado.trim() !== "") {
    inscripcionesAMostrar =
      activeSection === "pagos"
        ? filtrarInscripcionesPorNombreEnPagos
        : filtrarInscripcionesPorNombre;
  }

  return (
    <div className="secretaria_container">
      <button
        ref={hamburgerRef}
        className="secretaria_hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
      </button>

      <nav className={`secretaria_menu ${menuOpen ? "open" : ""}`} ref={menuRef}>
        <button
          className={`menu-btn ${activeSection === "inscripciones" ? "active" : ""}`}
          onClick={() => handleSelect("inscripciones")}
        >
          📝 Inscripciones
        </button>
        <button
          className={`menu-btn ${activeSection === "pagos" ? "active" : ""}`}
          onClick={() => handleSelect("pagos")}
        >
          💳 Pagos
        </button>
        <button
          className={`menu-btn ${activeSection === "certificados" ? "active" : ""}`}
          onClick={() => handleSelect("certificados")}
        >
          🎓 Certificados
        </button>
      </nav>

      <main className="secretaria_content">
        {["inscripciones", "pagos"].includes(activeSection) && (
          <>
            <div className="inputs_busqueda">
              <div className="input_group">
                <input
                  type="text"
                  className="buscador_input"
                  placeholder="🔍 Buscar por cédula"
                  value={cedulaBuscada}
                  onChange={(e) => {
                    setCedulaBuscada(e.target.value);
                    setNombreBuscado("");
                    setSugerencias([]);
                  }}
                />
              </div>

              <div className="input_group">
                <input
                  type="text"
                  className="buscador_input"
                  placeholder="🔍 Buscar por nombres y apellidos"
                  value={nombreBuscado}
                  onChange={handleBuscarPorNombre}
                  autoComplete="off"
                />
                {sugerencias.length > 0 && (
                  <ul className="sugerencias_lista" role="listbox">
                    {sugerencias.map((sug) => (
                      <li
                        key={sug.id}
                        onClick={() => seleccionarSugerencia(sug)}
                        className="sugerencia_item"
                        role="option"
                      >
                        {sug.nombres} {sug.apellidos} — {sug.cedula}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Botón para limpiar filtros */}
              <button className="btn_limpiar_filtros" onClick={limpiarFiltros}>
                ❌ Borrar filtros
              </button>
            </div>
          </>
        )}

        {activeSection === "inscripciones" &&
          inscripcionesAMostrar.length > 0 &&
          inscripcionesAMostrar.map((i) => {
            const curso = courses.find((c) => c.id === i.courseId);
            return (
              <div key={i.id} className="card_inscripcion">
                <h3>
                  {i.nombres} {i.apellidos}
                </h3>
                <p>
                  <strong>Cédula:</strong> {i.cedula}
                </p>
                <p>
                  <strong>Celular:</strong> {i.celular}
                </p>
                <p>
                  <strong>Subsistema:</strong> {i.subsistema}
                </p>
                <p>
                  <strong>Grado:</strong> {i.grado}
                </p>
                <p>
                  <strong>Email:</strong> {i.email}
                </p>
                <p>
                  <strong>Curso:</strong> {curso?.nombre || "No encontrado"}
                </p>
              </div>
            );
          })}

        {activeSection === "pagos" &&
          inscripcionesAMostrar.length > 0 &&
          inscripcionesAMostrar.map((i) => {
            const pagosRelacionados = pagos.filter((p) => p.inscripcionId === i.id);
            return pagosRelacionados.map((pago, idx) => {
              const curso = courses.find((c) => c.id === i.courseId);
              return (
                <div key={pago.id} className="card_pago">
                  <h3>Pago #{idx + 1}</h3>
                  <p>
                    <strong>Nombre:</strong> {i.nombres} {i.apellidos}
                  </p>
                  <p>
                    <strong>Curso:</strong> {curso?.nombre || "No encontrado"}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${pago.valorDepositado}
                  </p>
                  {pago.moneda && <p>💰 Incluye moneda</p>}
                  {pago.distintivo && <p>🎖️ Incluye distintivo</p>}
                  <p>Estado: {pago.verificado ? "✅ Verificado" : "⏳ Por verificar"}</p>
                  <a
                    className="btn_ver_comprobante"
                    href={pago.pagoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver comprobante
                  </a>
                </div>
              );
            });
          })}

        {activeSection === "certificados" && (
          <section className="secretaria_section">
            <h2>🎓 Certificados</h2>
            <p>📌 Pronto verás información sobre certificados.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Secretaria;
