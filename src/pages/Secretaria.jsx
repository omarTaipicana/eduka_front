import React, { useState, useRef, useEffect, useMemo } from "react";
import "./styles/Secretaria.css";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import useAuth from "../hooks/useAuth";

const Secretaria = () => {
  const [activeSection, setActiveSection] = useState("inscripciones");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cedulaBuscada, setCedulaBuscada] = useState("");
  const [nombreBuscado, setNombreBuscado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroPago, setFiltroPago] = useState("");
  const [filtroCertificado, setFiltroCertificado] = useState("");
  const [filtroDetalle, setFiltroDetalle] = useState("");
  const [filtroUltimoAcceso, setFiltroUltimoAcceso] = useState("");
  const [cedulaPagoBuscada, setCedulaPagoBuscada] = useState("");
  const [inputCedula, setInputCedula] = useState("");
  const [inputNombre, setInputNombre] = useState("");
  const [busquedaTemporal, setBusquedaTemporal] = useState("");
  const [cedulaTemporal, setCedulaTemporal] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [editInscripcionId, setEditInscripcionId] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const observacionRef = useRef(null);

  const registrosPorPagina = 10;

  const [sugerencias, setSugerencias] = useState([]);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";
  const PATH_PAGOS = "/pagos";
  const PATH_CERTIFICADOS = "/certificados";
  const PATH_MOODLE = "/usuarios_m";

  const [courses, getCourses] = useCrud();
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [
    inscripciones,
    getInscripciones,
    ,
    ,
    updateInscripciones,
    ,
    isLoadingI,
  ] = useCrud();
  const [pagos, getPagos] = useCrud();
  const pago = pagos.filter((p) => p.confirmacion === true);
  const [certificados, getCertificados] = useCrud();
  const [moodle, getMoodle, , , , , isLoadingM] = useCrud();

  useEffect(() => {
    getInscripciones(PATH_INSCRIPCIONES);
    getCourses(PATH_COURSES);
    getPagos(PATH_PAGOS);
    getCertificados(PATH_CERTIFICADOS);
    getMoodle(PATH_MOODLE);
    loggedUser();
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
    setInputCedula("");
    setInputNombre("");
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

  const handleBuscar = () => {
    setCedulaBuscada(inputCedula);
    setNombreBuscado(inputNombre);
    setSugerencias([]); // opcionalmente vacía sugerencias
  };

  const datosFiltrados = useMemo(() => {
    const filtrados = inscripcionesParaPagos.filter((i) => {
      const pagosRelacionados = pagos.filter((p) => p.inscripcionId === i.id);
      const certificado = certificados.find((c) => c.cedula === i.cedula);
      const curso = courses.find((c) => c.id === i.courseId);
      const usuarioMoodle = moodle.find((u) => u.email === i.email);

      const nombreCompleto = `${i.nombres} ${i.apellidos}`.toLowerCase();
      const cumpleBusqueda = nombreCompleto.includes(busqueda.toLowerCase());

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

      // Detalle (nota final)
      let detalleEstado = "";
      if (!usuarioMoodle) {
        detalleEstado = "sin_usuario_moodle";
      } else {
        const cursoMoodle = usuarioMoodle.courses?.find(
          (mc) => mc.fullname === curso?.sigla
        );
        if (!cursoMoodle) {
          detalleEstado = "no_matriculado";
        } else {
          const nota = cursoMoodle.grades?.["Nota Final"];
          if (nota == null) {
            detalleEstado = "sin_calificacion";
          } else if (Number(nota) >= 7) {
            detalleEstado = "aprobado";
          } else {
            detalleEstado = "no_aprobado";
          }
        }
      }

      const cumpleFiltroDetalle =
        filtroDetalle === "" ? true : filtroDetalle === detalleEstado;

      // Último acceso
      let ultimoAccesoEstado = "";
      if (!usuarioMoodle) {
        ultimoAccesoEstado = "sin_usuario";
      } else if (
        usuarioMoodle.lastaccess === "0" ||
        usuarioMoodle.lastaccess === 0
      ) {
        ultimoAccesoEstado = "no_ingresa";
      } else {
        ultimoAccesoEstado = "registra_ingreso";
      }

      const cumpleFiltroUltimoAcceso =
        filtroUltimoAcceso === ""
          ? true
          : filtroUltimoAcceso === ultimoAccesoEstado;

      return (
        cumpleBusqueda &&
        cumpleFiltroPago &&
        cumpleFiltroCertificado &&
        cumpleFiltroCedula &&
        cumpleFiltroDetalle &&
        cumpleFiltroUltimoAcceso
      );
    });

    // Ordena por fecha descendente (más reciente primero)
    return filtrados.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [
    inscripcionesParaPagos,
    pagos,
    certificados,
    courses,
    moodle,
    busqueda,
    cedulaPagoBuscada,
    filtroPago,
    filtroCertificado,
    filtroDetalle,
    filtroUltimoAcceso,
  ]);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    return datosFiltrados.slice(inicio, fin);
  }, [datosFiltrados, paginaActual]);

  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

  const iniciarEdicion = (inscripcion) => {
    setEditInscripcionId(inscripcion.id);
  };

  const cancelarEdicion = () => {
    setEditInscripcionId();
  };

  const guardarEdicion = async (inscripcionId) => {
    const nuevaObservacion = observacionRef.current?.value.trim() || "";
    setIsSaving(true); // ← inicia carga

    try {
      await updateInscripciones(PATH_INSCRIPCIONES, inscripcionId, {
        observacion: nuevaObservacion,
        usuarioEdicion: user.email,
      });
      await getInscripciones(PATH_INSCRIPCIONES);
      cancelarEdicion();
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setIsSaving(false); // ← finaliza carga
    }
  };

  return (
    <div>
      {isLoadingM && <IsLoading />}
      {isLoadingI && <IsLoading />}

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
                    value={inputCedula}
                    onChange={(e) => setInputCedula(e.target.value)}
                  />
                </div>

                <div className="input_group">
                  <input
                    type="text"
                    className="buscador_input"
                    placeholder="🔍 Buscar por nombres y apellidos"
                    value={inputNombre}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setInputNombre(valor);

                      const sugerenciasFiltradas = inscripciones.filter((i) =>
                        `${i.nombres} ${i.apellidos}`
                          .toLowerCase()
                          .includes(valor.toLowerCase())
                      );

                      setSugerencias(sugerenciasFiltradas);
                    }}
                    autoComplete="off"
                  />

                  {/* si quieres que siga funcionando el autocompletado cuando escribes */}
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

                <button className="btn_buscar" onClick={handleBuscar}>
                  🔍 Buscar
                </button>

                <button
                  className="btn_limpiar_filtros"
                  onClick={limpiarFiltros}
                >
                  ❌ Borrar filtros
                </button>
              </div>
            </>
          )}

          {/* Inscripcion------------------------------------------------------------------------- */}

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
                      <strong>Inscripción:</strong>{" "}
                      {curso?.nombre || "No encontrado"}
                    </p>
                    <p>
                      <strong>Fecha de inscripción:</strong>{" "}
                      {i?.createdAt
                        ? new Date(i.createdAt)
                            .toLocaleString("es-EC", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false,
                              timeZone: "America/Guayaquil",
                            })
                            .replace(",", "")
                        : "No encontrado"}
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

                    {(() => {
                      const usuarioMoodle = moodle.find(
                        (u) => u.email.toLowerCase() === i.email.toLowerCase()
                      );

                      if (!usuarioMoodle) {
                        return (
                          <p className="pendiente_certificado">
                            ⛔ Sin usuario en Moodle
                          </p>
                        );
                      }

                      const cursoMoodle = usuarioMoodle.courses.find(
                        (c) =>
                          c.fullname.toLowerCase() ===
                          curso?.sigla?.toLowerCase()
                      );

                      if (!cursoMoodle) {
                        return (
                          <p className="pendiente_certificado">
                            📌 No esta matriculad@ en este curso
                          </p>
                        );
                      }

                      const notaFinal = cursoMoodle.grades?.["Nota Final"];

                      if (!notaFinal) {
                        return (
                          <p className="pendiente_certificado">
                            📌 Calificación no registrada
                          </p>
                        );
                      }

                      return (
                        <div>
                          <p className="nota_curso">
                            ✅ <strong>Nota Final:</strong> {notaFinal}
                          </p>
                          <p>
                            <strong>Último acceso:</strong>{" "}
                            {usuarioMoodle?.lastaccess
                              ? new Date(
                                  parseInt(usuarioMoodle.lastaccess) * 1000
                                ).toLocaleString("es-EC", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: false,
                                  timeZone: "America/Guayaquil",
                                })
                              : "Sin registro"}
                          </p>
                        </div>
                      );
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

          {/* Pagos------------------------------------------------------------------------- */}

          {activeSection === "pagos" && (
            <div>
              {/* Filtros */}
              <div className="inputs_busqueda">
                <div className="input_group">
                  <input
                    type="text"
                    placeholder="Buscar por cédula..."
                    value={cedulaTemporal}
                    onChange={(e) => setCedulaTemporal(e.target.value)}
                    className="buscador_input"
                  />
                </div>
                <div className="input_group">
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={busquedaTemporal}
                    onChange={(e) => setBusquedaTemporal(e.target.value)}
                    className="buscador_input"
                  />
                </div>

                <div className="input_group">
                  <select
                    value={filtroDetalle}
                    onChange={(e) => setFiltroDetalle(e.target.value)}
                    className="buscador_input"
                  >
                    <option value="">Detalle</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="no_aprobado">No aprobado</option>
                    <option value="sin_calificacion">Sin calificación</option>
                    <option value="sin_usuario_moodle">
                      Sin usuario Moodle
                    </option>
                    <option value="no_matriculado">No está matriculado</option>
                  </select>
                </div>

                <div className="input_group">
                  <select
                    value={filtroUltimoAcceso}
                    onChange={(e) => setFiltroUltimoAcceso(e.target.value)}
                    className="buscador_input"
                  >
                    <option value="">Ultimo Acceso</option>
                    <option value="sin_usuario">Sin usuario</option>
                    <option value="no_ingresa">No ingresa</option>
                    <option value="registra_ingreso">Registra ingreso</option>
                  </select>
                </div>

                <div className="input_group">
                  <select
                    value={filtroPago}
                    onChange={(e) => setFiltroPago(e.target.value)}
                    className="buscador_input"
                  >
                    <option value="">Pagos</option>
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
                    <option value="">Certificados</option>
                    <option value="con_certificado">Con certificado</option>
                    <option value="sin_certificado">Sin certificado</option>
                  </select>
                </div>

                <div className="input_group">
                  <button
                    className="btn_buscar"
                    onClick={() => {
                      setBusqueda(busquedaTemporal);
                      setCedulaPagoBuscada(cedulaTemporal);
                    }}
                  >
                    🔍 Buscar
                  </button>
                </div>

                <div className="input_group">
                  <button
                    className="btn_limpiar_filtros"
                    onClick={() => {
                      setBusquedaTemporal("");
                      setCedulaTemporal("");
                      setBusqueda("");
                      setCedulaPagoBuscada("");
                      setFiltroPago("");
                      setFiltroCertificado("");
                      setFiltroDetalle("");
                      setFiltroUltimoAcceso("");
                    }}
                  >
                    ❌ Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="paginacion">
                <button
                  onClick={() => setPaginaActual(1)}
                  disabled={paginaActual === 1}
                >
                  «
                </button>
                <button
                  onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                  disabled={paginaActual === 1}
                >
                  ‹
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === totalPaginas ||
                      (n >= paginaActual - 2 && n <= paginaActual + 2)
                  )
                  .map((n, idx, arr) => (
                    <React.Fragment key={n}>
                      {idx > 0 && n - arr[idx - 1] > 1 && (
                        <span className="puntos">...</span>
                      )}
                      <button
                        onClick={() => setPaginaActual(n)}
                        className={paginaActual === n ? "pagina-actual" : ""}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() =>
                    setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                  }
                  disabled={paginaActual === totalPaginas}
                >
                  ›
                </button>
                <button
                  onClick={() => setPaginaActual(totalPaginas)}
                  disabled={paginaActual === totalPaginas}
                >
                  »
                </button>
              </div>

              {/* Tabla */}
              <div className="numero-registros">
                Número de registros: {datosFiltrados.length} / Página{" "}
                {paginaActual} de {totalPaginas}
              </div>
              <div className="contenedor-tabla-pagos">
                <table className="tabla-pagos">
                  <thead>
                    <tr>
                      <th>Cédula</th>
                      <th>Grado</th>
                      <th className="col-curso">Nombre</th>
                      <th className="col-curso">Detalle</th>
                      <th className="col-curso">Ultimo Acceso</th>

                      <th>Celular</th>
                      <th className="col-curso">Curso</th>
                      <th>Pagos</th>
                      <th>Certificado</th>
                      <th>Observacion</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados.map((i) => {
                      const isEditing = editInscripcionId === i.id;
                      const pagosRelacionados = pagos.filter(
                        (p) => p.inscripcionId === i.id
                      );
                      const certificado = certificados.find(
                        (c) => c.cedula === i.cedula
                      );
                      const curso = courses.find((c) => c.id === i.courseId);
                      const usuarioMoodle = moodle.find(
                        (u) => u.email === i.email
                      );

                      const notaFinal = (() => {
                        if (!usuarioMoodle) return "Sin usuario Moodle";
                        const cursoMoodle = usuarioMoodle.courses?.find(
                          (mc) => mc.fullname === curso?.sigla
                        );
                        if (!cursoMoodle) return "No está matriculado";
                        const nota = cursoMoodle.grades?.["Nota Final"];
                        return nota != null ? nota : "Sin calificación";
                      })();

                      const ultimoAcceso = (() => {
                        if (!usuarioMoodle) return "Sin usuario";
                        if (
                          usuarioMoodle.lastaccess === "0" ||
                          usuarioMoodle.lastaccess === 0
                        ) {
                          return "No ingresa";
                        }
                        return new Date(
                          parseInt(usuarioMoodle.lastaccess) * 1000
                        ).toLocaleString("es-EC", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                          timeZone: "America/Guayaquil",
                        });
                      })();

                      return (
                        <tr key={i.id}>
                          <td>{i.cedula}</td>
                          <td>{i.grado}</td>
                          <td className="col-curso">
                            {i.nombres} {i.apellidos}
                          </td>
                          <td className="col-curso">{notaFinal}</td>
                          <td className="col-curso">{ultimoAcceso}</td>
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

                          <td className="celda-observacion">
                            {" "}
                            {isEditing ? (
                              <input
                                type="text"
                                defaultValue={i.observacion || ""}
                                ref={observacionRef}
                                className="vp-input"
                              />
                            ) : i.observacion ? (
                              i.observacion
                            ) : (
                              "👍"
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => guardarEdicion(i.id)}
                                  className="vp-btn-save"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelarEdicion}
                                  className="vp-btn-cancel"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => iniciarEdicion(i)}
                                className="vp-btn-edit"
                              >
                                Reg. Observación
                              </button>
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
    </div>
  );
};

export default Secretaria;
