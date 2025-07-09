import React, { useState, useRef, useEffect } from "react";
import "./styles/ValidacionPago.css";
import useCrud from "../hooks/useCrud";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PATH_PAGOS = "/pagos";
const PATH_INSCRIPCIONES = "/inscripcion";

const ValidacionPago = () => {
  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const [inscripciones, getInscripciones] = useCrud();
  const [
    pago,
    getPago,
    postPago,
    deletePago,
    updatePago,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    PagoPdf,
    newPago,
  ] = useCrud();

  const [editPagoId, setEditPagoId] = useState(null);
  const [editValorDepositado, setEditValorDepositado] = useState("");
  const [editVerificado, setEditVerificado] = useState(false);

  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroVerificado, setFiltroVerificado] = useState("todos");
  const [filtroMoneda, setFiltroMoneda] = useState("todos");
  const [filtroDistintivo, setFiltroDistintivo] = useState("todos");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroEntregado, setFiltroEntregado] = useState("todos");

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

  const [ordenFechaDesc, setOrdenFechaDesc] = useState(true);

  useEffect(() => {
    getPago(PATH_PAGOS);
    getInscripciones(PATH_INSCRIPCIONES);
  }, []);

  const iniciarEdicion = (pago) => {
  setEditPagoId(pago.id);
  setEditValorDepositado(pago.valorDepositado || "");
  setEditVerificado(pago.verificado || false);
};

const cancelarEdicion = () => {
  setEditPagoId(null);
  setEditValorDepositado("");
  setEditVerificado(false);
};

const guardarEdicion = async (pagoId) => {
  try {
    await updatePago(PATH_PAGOS, pagoId, {
      valorDepositado: parseFloat(editValorDepositado),
      verificado: editVerificado,
    });
    await getPago(PATH_PAGOS);
    cancelarEdicion();
  } catch (error) {
    alert("Error al guardar los cambios.");
  }
};

  const listaCursos = React.useMemo(() => {
    if (!pago) return [];
    const cursos = pago.map((p) => p.curso);
    return [...new Set(cursos)].sort();
  }, [pago]);

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

  const ordenarPorFecha = (array) => {
    return [...array].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return ordenFechaDesc ? dateB - dateA : dateA - dateB;
    });
  };

  const pagosEntregaFiltrados = () => {
    if (!pago || !inscripciones) return [];

    const filtrados = pago
      .filter((p) => p.moneda || p.distintivo)
      .filter((p) => {
        const inscrip = inscripciones.find((i) => i.id === p.inscripcionId);
        if (!inscrip) return false;

        if (filtroCurso && p.curso !== filtroCurso) return false;
        if (filtroVerificado === "verificados" && !p.verificado) return false;
        if (filtroVerificado === "no" && p.verificado) return false;
        if (filtroMoneda === "si" && !p.moneda) return false;
        if (filtroMoneda === "no" && p.moneda) return false;
        if (filtroDistintivo === "si" && !p.distintivo) return false;
        if (filtroDistintivo === "no" && p.distintivo) return false;
        if (filtroEntregado === "si" && !p.entregado) return false;
        if (filtroEntregado === "no" && p.entregado) return false;

        if (filtroFecha) {
          const fechaPago = new Date(p.createdAt).toISOString().split("T")[0];
          if (fechaPago !== filtroFecha) return false;
        }

        if (filtroGrado) {
          const textoFiltro = filtroGrado.toLowerCase();
          return (
            inscrip.grado?.toLowerCase().includes(textoFiltro) ||
            inscrip.nombres?.toLowerCase().includes(textoFiltro) ||
            inscrip.apellidos?.toLowerCase().includes(textoFiltro)
          );
        }

        return true;
      });

    return ordenarPorFecha(filtrados);
  };

  const pagosFiltrados = () => {
    if (!pago || !inscripciones) return [];

    const filtrados = pago.filter((p) => {
      const inscrip = inscripciones.find((i) => i.id === p.inscripcionId);
      if (!inscrip) return false;

      if (filtroCurso && p.curso !== filtroCurso) return false;
      if (filtroVerificado === "verificados" && !p.verificado) return false;
      if (filtroVerificado === "no" && p.verificado) return false;
      if (filtroMoneda === "si" && !p.moneda) return false;
      if (filtroMoneda === "no" && p.moneda) return false;
      if (filtroDistintivo === "si" && !p.distintivo) return false;
      if (filtroDistintivo === "no" && p.distintivo) return false;

      if (filtroFechaDesde || filtroFechaHasta) {
        const pagoFecha = p.createdAt ? new Date(p.createdAt) : null;
        if (pagoFecha) {
          if (filtroFechaDesde) {
            const desde = new Date(filtroFechaDesde);
            if (pagoFecha < desde) return false;
          }
          if (filtroFechaHasta) {
            const hasta = new Date(filtroFechaHasta);
            hasta.setHours(23, 59, 59, 999);
            if (pagoFecha > hasta) return false;
          }
        }
      }
      if (filtroFecha) {
        const fechaPago = new Date(p.createdAt).toISOString().split("T")[0];
        if (fechaPago !== filtroFecha) return false;
      }

      if (filtroGrado) {
        const textoFiltro = filtroGrado.toLowerCase();
        const matchesGrado = inscrip.grado?.toLowerCase().includes(textoFiltro);
        const matchesNombres = inscrip.nombres
          ?.toLowerCase()
          .includes(textoFiltro);
        const matchesApellidos = inscrip.apellidos
          ?.toLowerCase()
          .includes(textoFiltro);
        if (!matchesGrado && !matchesNombres && !matchesApellidos) return false;
      }

      return true;
    });

    return ordenarPorFecha(filtrados);
  };

  const descargarExcel = () => {
    const pagos = pagosFiltrados();

    // Preparar datos para Excel
    const datosExcel = pagos.map((p) => {
      const inscrip = inscripciones.find((i) => i.id === p.inscripcionId) || {};
      return {
        Grado: inscrip.grado || "",
        Nombres: inscrip.nombres || "",
        Apellidos: inscrip.apellidos || "",
        Cedula: inscrip.cedula || "",
        Curso: p.curso || "",
        "Valor Depositado": p.valorDepositado?.toFixed(2) || "0.00",
        Comprobante: p.pagoUrl || "",
        Verificado: p.verificado ? "Sí" : "No",
        Fecha: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      };
    });

    // Crear libro y hoja
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");

    // Generar archivo excel en formato blob
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Descargar archivo con nombre
    saveAs(blob, "pagos_filtrados.xlsx");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return <p>📋 Pronto tendrás información del Resumen General.</p>;

      case "validarPagos":
        return (
          <div className="vp-validar-pagos-container">
            <div className="vp-filtros">
              <button
                className="vp-btn-clear"
                onClick={() => {
                  setFiltroCurso("");
                  setFiltroVerificado("todos");
                  setFiltroMoneda("todos");
                  setFiltroDistintivo("todos");
                  setFiltroGrado("");
                  setFiltroFecha("");
                }}
              >
                Eliminar Filtros
              </button>
              <div className="vp-filtro">
                <label>Curso:</label>
                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
                  <option value="">Todos</option>
                  {listaCursos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="vp-filtro">
                <label>Verificado:</label>
                <select
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="verificados">Verificados</option>
                  <option value="no">No Verificados</option>
                </select>
              </div>
              <div className="vp-filtro">
                <label>Moneda:</label>
                <select
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="vp-filtro">
                <label>Distintivo:</label>
                <select
                  value={filtroDistintivo}
                  onChange={(e) => setFiltroDistintivo(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="vp-filtro">
                <label>Grado / Nombres / Apellidos:</label>
                <input
                  type="text"
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                  placeholder="Buscar..."
                />
              </div>
              <div className="vp-filtro">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  placeholder="Ej: 2025-07-09"
                />
              </div>
            </div>

            <div
              style={{
                marginBottom: "10px",
                color: "#0053a0",
                fontWeight: 600,
              }}
            >
              Mostrando {pagosFiltrados().length} resultados
            </div>

            {pago && pago.length > 0 ? (
              <div className="vp-tabla-scroll">
                <table className="vp-pagos-table">
                  <thead>
                    <tr>
                      <th>Discente (Grado, Nombres, Apellidos)</th>
                      <th
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => setOrdenFechaDesc((prev) => !prev)}
                        title="Ordenar por fecha"
                      >
                        Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                      </th>
                      <th>Curso</th>
                      <th>Distintivo</th>
                      <th>Moneda</th>
                      <th>Valor Depositado</th>
                      <th>Pago (comprobante)</th>
                      <th>Verificado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados().map((p) => {
                      const inscrip = inscripciones.find(
                        (i) => i.id === p.inscripcionId
                      );
                      const isEditing = editPagoId === p.id;
                      return (
                        <tr key={p.id}>
                          <td>
                            {inscrip
                              ? `${inscrip.grado} - ${inscrip.nombres} ${inscrip.apellidos}`
                              : "Sin inscripción"}
                          </td>
                          <td>
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>{p.curso}</td>
                          <td style={{ textAlign: "center" }}>
                            {p.distintivo ? "✅" : "❌"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {p.moneda ? "✅" : "❌"}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={editValorDepositado}
                                onChange={(e) =>
                                  setEditValorDepositado(e.target.value)
                                }
                              />
                            ) : (
                              `$${p.valorDepositado?.toFixed(2) || "0.00"}`
                            )}
                          </td>
                          <td>
                            {p.pagoUrl ? (
                              <a
                                href={p.pagoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver Comprobante
                              </a>
                            ) : (
                              "No disponible"
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isEditing ? (
                              <input
                                type="checkbox"
                                checked={editVerificado}
                                onChange={(e) =>
                                  setEditVerificado(e.target.checked)
                                }
                              />
                            ) : p.verificado ? (
                              "✅"
                            ) : (
                              "❌"
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => guardarEdicion(p.id)}
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
                                onClick={() => iniciarEdicion(p)}
                                className="vp-btn-edit"
                              >
                                Registrar Validación
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No hay pagos para mostrar.</p>
            )}
          </div>
        );

      case "registrarEntregas":
        return (
          <div className="vp-validar-pagos-container">
            {/* FILTROS */}
            <div className="vp-filtros">
              <button
                className="vp-btn-clear"
                onClick={() => {
                  setFiltroCurso("");
                  setFiltroVerificado("todos");
                  setFiltroMoneda("todos");
                  setFiltroDistintivo("todos");
                  setFiltroGrado("");
                  setFiltroEntregado("todos");
                  setFiltroFecha("");
                }}
              >
                Eliminar Filtros
              </button>
              <div className="vp-filtro">
                <label>Curso:</label>
                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
                  <option value="">Todos</option>
                  {listaCursos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="vp-filtro">
                <label>Verificado:</label>
                <select
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="verificados">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="vp-filtro">
                <label>Moneda:</label>
                <select
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="vp-filtro">
                <label>Distintivo:</label>
                <select
                  value={filtroDistintivo}
                  onChange={(e) => setFiltroDistintivo(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="vp-filtro">
                <label>Entregado:</label>
                <select
                  value={filtroEntregado}
                  onChange={(e) => setFiltroEntregado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="vp-filtro">
                <label>Grado/Nombres:</label>
                <input
                  type="text"
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                  placeholder="Buscar grado o nombres"
                />
              </div>
              <div className="vp-filtro">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
            </div>

            {/* TABLA */}
            <p
              style={{
                marginBottom: "10px",
                color: "#0053a0",
                fontWeight: 600,
              }}
            >
              Mostrando {pagosEntregaFiltrados().length} resultados
            </p>

            <div className="vp-tabla-scroll">
              <table className="vp-pagos-table">
                <thead>
                  <tr>
                    <th>Discente</th>
                    <th
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setOrdenFechaDesc((prev) => !prev)}
                      title="Ordenar por fecha"
                    >
                      Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                    </th>
                    <th>Curso</th>
                    <th>Moneda</th>
                    <th>Distintivo</th>
                    <th>Valor Pagado</th>
                    <th>Verificado</th>
                    <th>Comprobante</th>
                    <th>Entregado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosEntregaFiltrados().map((p) => {
                    const inscrip = inscripciones.find(
                      (i) => i.id === p.inscripcionId
                    );
                    if (!inscrip) return null;

                    const toggleEntrega = async () => {
                      try {
                        await updatePago(PATH_PAGOS, p.id, {
                          entregado: !p.entregado,
                        });
                        await getPago(PATH_PAGOS);
                      } catch (error) {
                        alert("Error al actualizar entrega.");
                      }
                    };

                    return (
                      <tr key={p.id}>
                        <td>
                          {`${inscrip.grado} - ${inscrip.nombres} ${inscrip.apellidos}`}
                        </td>
                        <td>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>{p.curso}</td>
                        <td style={{ textAlign: "center" }}>
                          {p.moneda ? "✅" : "❌"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {p.distintivo ? "✅" : "❌"}
                        </td>
                        <td>${p.valorDepositado?.toFixed(2) || "0.00"}</td>
                        <td style={{ textAlign: "center" }}>
                          {p.verificado ? "✅" : "❌"}
                        </td>
                        <td>
                          {p.pagoUrl ? (
                            <a
                              href={p.pagoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {p.entregado ? "✅" : "❌"}
                        </td>
                        <td>
                          <button
                            onClick={toggleEntrega}
                            className="vp-btn-edit"
                          >
                            {p.entregado
                              ? "Quitar Entrega"
                              : "Registrar Entrega"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "listaPagos":
        return (
          <div className="vp-validar-pagos-container">
            <div
              className="vp-filtros"
              style={{
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                display: "flex",
              }}
            >
              <div className="vp-filtro" style={{ flex: "1 1 150px" }}>
                <label>Verificado:</label>
                <select
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="verificados">Verificados</option>
                  <option value="no">No Verificados</option>
                </select>
              </div>

              <div className="vp-filtro" style={{ flex: "1 1 150px" }}>
                <label>Fecha Desde:</label>
                <input
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
              </div>

              <div className="vp-filtro" style={{ flex: "1 1 150px" }}>
                <label>Fecha Hasta:</label>
                <input
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  setFiltroVerificado("todos");
                  setFiltroFechaDesde("");
                  setFiltroFechaHasta("");
                }}
                className="vp-btn-clear"
                style={{ height: "2.5rem", marginLeft: "auto" }}
              >
                Eliminar filtros
              </button>

              <button
                onClick={descargarExcel}
                className="vp-btn-clear"
                style={{ height: "2.5rem", marginLeft: "auto" }}
              >
                Descragra
              </button>
            </div>

            <div style={{ fontWeight: 600, margin: "10px 0" }}>
              Total: {pagosFiltrados().length}
            </div>

            <div className="vp-tabla-scroll">
              <table className="vp-pagos-table">
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Cédula</th>
                    <th
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setOrdenFechaDesc((prev) => !prev)}
                      title="Ordenar por fecha"
                    >
                      Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                    </th>
                    <th>Curso</th>
                    <th>Valor Depositado</th>

                    <th>Comprobante</th>
                    <th>Verificado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados().map((p) => {
                    const inscrip = inscripciones.find(
                      (i) => i.id === p.inscripcionId
                    );
                    return (
                      <tr key={p.id}>
                        <td>{inscrip?.grado || "-"}</td>
                        <td>{inscrip?.nombres || "-"}</td>
                        <td>{inscrip?.apellidos || "-"}</td>
                        <td>{inscrip?.cedula || "-"}</td>
                        <td>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </td>{" "}
                        {/* Fecha */}
                        <td>{p.curso}</td>
                        <td>${p.valorDepositado?.toFixed(2) || "0.00"}</td>
                        <td>
                          {p.pagoUrl ? (
                            <a
                              href={p.pagoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Comprobante
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {p.verificado ? "✅" : "❌"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "listaInscritos":
        return <p>📋 Pronto tendrás la Lista de Inscritos.</p>;

      default:
        return null;
    }
  };

  return (
    <div className="vp-container">
      <button
        ref={hamburgerRef}
        className="vp-hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`vp-hamburger-line ${menuOpen ? "open" : ""}`} />
        <span className={`vp-hamburger-line ${menuOpen ? "open" : ""}`} />
        <span className={`vp-hamburger-line ${menuOpen ? "open" : ""}`} />
      </button>

      <nav className={`vp-menu ${menuOpen ? "open" : ""}`} ref={menuRef}>
        <h3>📊 Menú Principal</h3>
        <button
          className={`vp-menu-btn ${
            activeSection === "resumen" ? "active" : ""
          }`}
          onClick={() => setActiveSection("resumen")}
        >
          📋 Resumen General
        </button>
        <button
          className={`vp-menu-btn ${
            activeSection === "validarPagos" ? "active" : ""
          }`}
          onClick={() => setActiveSection("validarPagos")}
        >
          ✅ Validar Pagos
        </button>
        <button
          className={`vp-menu-btn ${
            activeSection === "registrarEntregas" ? "active" : ""
          }`}
          onClick={() => setActiveSection("registrarEntregas")}
        >
          🎁 Registrar Entregas de Distintivos
        </button>
        <button
          className={`vp-menu-btn ${
            activeSection === "listaPagos" ? "active" : ""
          }`}
          onClick={() => setActiveSection("listaPagos")}
        >
          💳 Lista de Pagos
        </button>
        <button
          className={`vp-menu-btn ${
            activeSection === "listaInscritos" ? "active" : ""
          }`}
          onClick={() => setActiveSection("listaInscritos")}
        >
          📋 Lista de Inscritos
        </button>
      </nav>

      <main className="vp-content">{renderContent()}</main>
    </div>
  );
};

export default ValidacionPago;
