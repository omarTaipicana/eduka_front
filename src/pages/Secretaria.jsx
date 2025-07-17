import React, { useState, useRef, useEffect } from "react";
import "./styles/Secretaria.css";
import useCrud from "../hooks/useCrud";

const Secretaria = () => {
  const [activeSection, setActiveSection] = useState("inscripciones");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cedulaBuscada, setCedulaBuscada] = useState("");
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroPago, setFiltroPago] = useState("");
  const [filtroCertificado, setFiltroCertificado] = useState("");
  const [cedulaPagoBuscada, setCedulaPagoBuscada] = useState("");

  const [sugerencias, setSugerencias] = useState([]);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";
  const PATH_PAGOS = "/pagos";
  const PATH_CERTIFICADOS = "/certificados";

  const [courses, getCourses] = useCrud();
  const [inscripciones, getInscripciones] = useCrud();
  const [pagos, getPagos] = useCrud();
  const [certificados, getCertificados] = useCrud();

  useEffect(() => {
    getInscripciones(PATH_INSCRIPCIONES);
    getCourses(PATH_COURSES);
    getPagos(PATH_PAGOS);
    getCertificados(PATH_CERTIFICADOS);
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
      `${i.nombres} ${i.apellidos}`
        .toLowerCase()
        .includes(nombreBuscado.toLowerCase().trim())
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
    inscripcionesAMostrar = (filtrarInscripcionesPorCedula || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (nombreBuscado.trim() !== "") {
    inscripcionesAMostrar =
      activeSection === "pagos"
        ? (filtrarInscripcionesPorNombreEnPagos || [])
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : (filtrarInscripcionesPorNombre || [])
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    // Aquí no asignar nada para inscripciones, para que no muestre nada sin filtro
    inscripcionesAMostrar = [];
  }

  const inscripcionesParaPagos = (inscripciones || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

      <nav
        className={`secretaria_menu ${menuOpen ? "open" : ""}`}
        ref={menuRef}
      >
        <button
          className={`menu-btn ${
            activeSection === "inscripciones" ? "active" : ""
          }`}
          onClick={() => handleSelect("inscripciones")}
        >
          🔎 Buscador
        </button>
        <button
          className={`menu-btn ${activeSection === "pagos" ? "active" : ""}`}
          onClick={() => handleSelect("pagos")}
        >
          📄 listado
        </button>
        <button
          className={`menu-btn ${
            activeSection === "certificados" ? "active" : ""
          }`}
          onClick={() => handleSelect("certificados")}
        >
          🎓 Certificados
        </button>
      </nav>

      <main className="secretaria_content">
        {["inscripciones"].includes(activeSection) && (
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
            const pagosRelacionados = pagos.filter(
              (p) => p.inscripcionId === i.id
            );

            return (
              <div key={i.id} className="grid_dos_columnas">
                <div className="card_inscripcion">
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

                  {(() => {
                    const certificado = certificados.find(
                      (c) => c.cedula === i.cedula && c.curso === i.curso
                    );

                    if (certificado?.url) {
                      return (
                        <a
                          className="btn_certificado"
                          href={certificado.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          🎓 Certificado emitido
                        </a>
                      );
                    } else {
                      return (
                        <p className="pendiente_certificado">
                          📌 Por certificar
                        </p>
                      );
                    }
                  })()}
                </div>

                <div className="card_pagos_inscripcion">
                  <h4>💳 Pagos relacionados</h4>
                  {pagosRelacionados.length === 0 ? (
                    <p>Sin pagos registrados.</p>
                  ) : (
                    pagosRelacionados.map((pago, idx) => (
                      <div key={pago.id} className="pago_detalle">
                        <p>
                          <strong>Pago #{idx + 1}</strong>
                        </p>
                        <p>Monto: ${pago.valorDepositado}</p>
                        {pago.moneda && <p>💰 Incluye moneda</p>}
                        {pago.distintivo && <p>🎖️ Incluye distintivo</p>}
                        <p>
                          Estado:{" "}
                          {pago.verificado
                            ? "✅ Verificado"
                            : "⏳ Por verificar"}
                        </p>
                        <a
                          className="btn_ver_comprobante"
                          href={pago.pagoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver comprobante
                        </a>
                        <hr />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

        {activeSection === "pagos" && (
          <div>
            {/* Filtros */}
            <div className="inputs_busqueda">
              <div className="input_group">
                <input
                  type="text"
                  placeholder="Buscar por cédula..."
                  value={cedulaPagoBuscada}
                  onChange={(e) => setCedulaPagoBuscada(e.target.value)}
                  className="buscador_input"
                />
              </div>
              <div className="input_group">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="buscador_input"
                />
              </div>
              <div className="input_group">
                <select
                  value={filtroPago}
                  onChange={(e) => setFiltroPago(e.target.value)}
                  className="buscador_input"
                >
                  <option value="">Todos</option>
                  <option value="con_pago">Con pago</option>
                  <option value="sin_pago">Sin pago</option>
                </select>
              </div>
              <div className="input_group">
                <select
                  value={filtroCertificado}
                  onChange={(e) => setFiltroCertificado(e.target.value)}
                  className="buscador_input"
                >
                  <option value="">Todos</option>
                  <option value="con_certificado">Con certificado</option>
                  <option value="sin_certificado">Sin certificado</option>
                </select>
              </div>

              <button
                className="btn_limpiar_filtros"
                onClick={() => {
                  setCedulaPagoBuscada("");
                  setBusqueda("");
                  setFiltroPago("");
                  setFiltroCertificado("");
                }}
              >
                ❌ Limpiar filtros
              </button>
            </div>

            {/* Tabla */}
            <div
              className="numero-registros"
              style={{ marginBottom: "10px", fontWeight: "bold" }}
            >
              Número de registros:{" "}
              {
                inscripcionesParaPagos.filter((i) => {
                  const pagosRelacionados = pagos.filter(
                    (p) => p.inscripcionId === i.id
                  );
                  const certificado = certificados.find(
                    (c) => c.cedula === i.cedula
                  );

                  const nombreCompleto =
                    `${i.nombres} ${i.apellidos}`.toLowerCase();
                  const cumpleBusqueda = nombreCompleto.includes(
                    busqueda.toLowerCase()
                  );

                  const cumpleFiltroPago =
                    filtroPago === ""
                      ? true
                      : filtroPago === "con_pago"
                      ? pagosRelacionados.length > 0
                      : pagosRelacionados.length === 0;

                  const cumpleFiltroCertificado =
                    filtroCertificado === ""
                      ? true
                      : filtroCertificado === "con_certificado"
                      ? !!certificado
                      : !certificado;

                  return (
                    cumpleBusqueda &&
                    cumpleFiltroPago &&
                    cumpleFiltroCertificado
                  );
                }).length
              }
            </div>
            <div className="contenedor-tabla-pagos">
              <table className="tabla-pagos">
                <thead>
                  <tr>
                    <th>Cédula</th>
                    <th>Grado</th>
                    <th className="col-curso">Nombre</th>
                    <th className="col-curso">Email</th>
                    <th>Celular</th>
                    <th className="col-curso">Curso</th>
                    <th>Pagos</th>
                    <th>Certificado</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripcionesParaPagos
                    .filter((i) => {
                      const pagosRelacionados = pagos.filter(
                        (p) => p.inscripcionId === i.id
                      );
                      const certificado = certificados.find(
                        (c) => c.cedula === i.cedula
                      );

                      const nombreCompleto =
                        `${i.nombres} ${i.apellidos}`.toLowerCase();
                      const cumpleBusqueda = nombreCompleto.includes(
                        busqueda.toLowerCase()
                      );

                      const cumpleFiltroPago =
                        filtroPago === ""
                          ? true
                          : filtroPago === "con_pago"
                          ? pagosRelacionados.length > 0
                          : pagosRelacionados.length === 0;

                      const cumpleFiltroCertificado =
                        filtroCertificado === ""
                          ? true
                          : filtroCertificado === "con_certificado"
                          ? !!certificado
                          : !certificado;

                      const cumpleFiltroCedula =
                        cedulaPagoBuscada.trim() === ""
                          ? true
                          : i.cedula.includes(cedulaPagoBuscada.trim());

                      return (
                        cumpleBusqueda &&
                        cumpleFiltroPago &&
                        cumpleFiltroCertificado &&
                        cumpleFiltroCedula
                      );
                    })
                    .map((i) => {
                      const pagosRelacionados = pagos.filter(
                        (p) => p.inscripcionId === i.id
                      );
                      const certificado = certificados.find(
                        (c) => c.cedula === i.cedula
                      );
                      const curso = courses.find((c) => c.id === i.courseId);

                      return (
                        <tr key={i.id}>
                          <td>{i.cedula}</td>
                          <td>{i.grado}</td>
                          <td className="col-curso">
                            {i.nombres} {i.apellidos}
                          </td>
                          <td className="col-curso">{i.email}</td>
                          <td>{i.celular}</td>
                          <td className="col-curso">
                            {curso?.nombre || "No encontrado"}
                          </td>
                          <td>
                            {pagosRelacionados.length > 0
                              ? pagosRelacionados.map((p, idx) => (
                                  <div key={p.id}>
                                    <a
                                      href={p.pagoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Pago {idx + 1}
                                    </a>
                                  </div>
                                ))
                              : "----"}
                          </td>
                          <td>
                            {certificado ? (
                              <a
                                href={certificado.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver
                              </a>
                            ) : (
                              "-----"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
