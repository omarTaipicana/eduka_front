import React, { useState, useRef, useEffect } from "react";
import "./styles/ValidacionPago.css";
import useCrud from "../hooks/useCrud";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";

const PATH_PAGOS = "/pagos";
const PATH_INSCRIPCIONES = "/inscripcion";
const PATH_CERTIFICADOS = "/certificados";


const ValidacionPago = () => {
  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [inscripciones, getInscripciones] = useCrud();
  const [isLoading2, setIsLoading2] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [pagoIdDelete, setPagoIdDelete] = useState(null);

  const [showRestaurar, setShowRestaurar] = useState(false);
  const [pagoIdRestaurar, setPagoIdRestaurar] = useState(null);

  const [papelera, setPapelera] = useState(false);

  const [
    pago,
    getPago,
    postPago,
    deletePagPro,
    updatePago,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    PagoPdf,
    newPago,
  ] = useCrud();
  const [certificados, getCertificados] = useCrud();


  const [editPagoId, setEditPagoId] = useState(null);
  const [editValorDepositado, setEditValorDepositado] = useState("");
  const [observacion, setObservacion] = useState("");
  const [editVerificado, setEditVerificado] = useState(false);
  const [editMoneda, setEditMoneda] = useState(false);
  const [editDistintivo, setEditDistintivo] = useState(false);

  const [editingEntregaId, setEditingEntregaId] = useState(null); // estado para saber qué pago estás editando
  const [entregadoEdit, setEntregadoEdit] = useState(false);

  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroVerificado, setFiltroVerificado] = useState("todos");
  const [filtroMoneda, setFiltroMoneda] = useState("todos");
  const [filtroDistintivo, setFiltroDistintivo] = useState("todos");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroEntregado, setFiltroEntregado] = useState("todos");

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [filtroCertificado, setFiltroCertificado] = useState("todos");


  const [ordenFechaDesc, setOrdenFechaDesc] = useState(true);

  useEffect(() => {
    getPago(PATH_PAGOS);
    getInscripciones(PATH_INSCRIPCIONES);
    getCertificados(PATH_CERTIFICADOS);

    loggedUser();
  }, []);
  const resumenTotales = React.useMemo(() => {
    if (!pago) return null;

    const pagosConfirmados = pago.filter((p) => p.confirmacion);

    const totalPagos = pagosConfirmados.length;

    const totalValidados = pagosConfirmados.filter((p) => p.verificado).length;
    const entregadosValidados = pagosConfirmados.filter(
      (p) => p.verificado && p.entregado
    ).length;

    const totalMoneda = pagosConfirmados.filter((p) => p.moneda).length;
    const entregadosMoneda = pagosConfirmados.filter(
      (p) => p.moneda && p.entregado
    ).length;

    const totalDistintivo = pagosConfirmados.filter((p) => p.distintivo).length;
    const entregadosDistintivo = pagosConfirmados.filter(
      (p) => p.distintivo && p.entregado
    ).length;

    const entregadosTotales = pagosConfirmados.filter(
      (p) => p.entregado
    ).length;

    return {
      totalPagos,
      entregadosTotales,
      totalValidados,
      entregadosValidados,
      totalMoneda,
      entregadosMoneda,
      totalDistintivo,
      entregadosDistintivo,
    };
  }, [pago]);

  const iniciarEdicion = (pago) => {
    setEditPagoId(pago.id);
    setEditValorDepositado(pago.valorDepositado || "");
    setObservacion(pago.observacion || "");
    setEditVerificado(pago.verificado || false);
    setEditMoneda(pago.moneda || false);
    setEditDistintivo(pago.distintivo || false);
  };

  const cancelarEdicion = () => {
    setEditPagoId(null);
    setEditValorDepositado("");
    setObservacion("");
    setEditVerificado(false);
    setEditMoneda(false);
    setEditDistintivo(false);
  };

  const guardarEdicion = async (pagoId) => {
    setIsLoading2(true); // ⏳ Inicia loading

    try {
      await updatePago(PATH_PAGOS, pagoId, {
        valorDepositado: parseFloat(editValorDepositado),
        verificado: editVerificado,
        moneda: editMoneda,
        distintivo: editDistintivo,
        observacion: observacion,
        usuarioEdicion: user.email,
      });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setIsLoading2(false); // ✅ Termina loading
    }
  };

  const deletePagoPr = async (pagoIdDelete) => {
    setIsLoading2(true); // ⏳ Mostrar loading al iniciar

    try {
      await updatePago(PATH_PAGOS, pagoIdDelete, {
        confirmacion: false,
      });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
      setShowDelete(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setIsLoading2(false); // ✅ Ocultar loading siempre, incluso si hay error
    }
  };

  const restaurarPagoPr = async (pagoIdRestaurar) => {
    setIsLoading2(true); // ⏳ Mostrar loading al iniciar

    try {
      await updatePago(PATH_PAGOS, pagoIdRestaurar, {
        confirmacion: true,
      });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
      setShowRestaurar(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
      setIsLoading2(false); // ✅ Ocultar loading siempre, incluso si hay error
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
      .filter((p) => (p.moneda || p.distintivo) && p.confirmacion === true)
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
      if (p.confirmacion === false) return false;

      const inscrip = inscripciones.find((i) => i.id === p.inscripcionId);
      if (!inscrip) return false;

      // ⬇️ NUEVO: buscar certificado asociado a la inscripción
      const certificado = certificados.find(c => c.cedula === inscrip.cedula && c.curso === inscrip.curso);
      if (filtroCertificado === "con" && !certificado?.url) return false;
      if (filtroCertificado === "sin" && certificado?.url) return false;

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
        const matchesNombres = inscrip.nombres?.toLowerCase().includes(textoFiltro);
        const matchesApellidos = inscrip.apellidos?.toLowerCase().includes(textoFiltro);
        if (!matchesGrado && !matchesNombres && !matchesApellidos) return false;
      }

      return true;
    });

    return ordenarPorFecha(filtrados);
  };


  const pagosFiltradosDelete = () => {
    if (!pago || !inscripciones) return [];

    const filtrados = pago.filter((p) => {
      if (p.confirmacion === true) return false;

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
        if (!resumenTotales) return <p>Cargando resumen...</p>;
        return (
          <div className="vp-resumen-container">
            <h2>📋 Resumen General</h2>

            <div className="vp-resumen-item">
              <div className="vp-resumen-label">
                Total Pagos vs Total Validados
              </div>
              <div className="vp-resumen-values">
                <span className="vp-total">{resumenTotales.totalPagos}</span>
                <span className="vp-separator">/</span>
                <span className="vp-validated">
                  {resumenTotales.totalValidados}
                </span>
              </div>
            </div>

            <div className="vp-resumen-item">
              <div className="vp-resumen-label">
                Total Monedas vs Entregadas
              </div>
              <div className="vp-resumen-values">
                <span className="vp-total">{resumenTotales.totalMoneda}</span>
                <span className="vp-separator">/</span>
                <span className="vp-validated">
                  {resumenTotales.entregadosMoneda}
                </span>
              </div>
            </div>

            <div className="vp-resumen-item">
              <div className="vp-resumen-label">
                Total Distintivos vs Entregados
              </div>
              <div className="vp-resumen-values">
                <span className="vp-total">
                  {resumenTotales.totalDistintivo}
                </span>
                <span className="vp-separator">/</span>
                <span className="vp-validated">
                  {resumenTotales.entregadosDistintivo}
                </span>
              </div>
            </div>
          </div>
        );

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
              <img
                className="papelera_btn"
                src={`../../../${papelera ? "atras" : "papelera"}.png`}
                alt="Eliminar"
                onClick={() => {
                  setPapelera(!papelera);
                }}
              />
            </div>

            {papelera ? (
              <div
                style={{
                  marginBottom: "10px",
                  color: "#0053a0",
                  fontWeight: 600,
                }}
              >
                <p
                  style={{
                    marginBottom: "10px",
                    color: "#f91118ff",
                    fontWeight: 600,
                  }}
                >
                  Mostrando {pagosFiltradosDelete().length} registros eliminados
                </p>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "10px",
                  color: "#0053a0",
                  fontWeight: 600,
                }}
              >
                <p
                  style={{
                    marginBottom: "10px",
                    color: "#0053a0",
                    fontWeight: 600,
                  }}
                >
                  Mostrando {pagosFiltrados().length} resultados /{" "}
                  <span style={{ color: "#198754", fontWeight: "bold" }}>
                    {pagosFiltrados().filter((p) => p.verificado).length} pagos
                    validados
                  </span>
                </p>
              </div>
            )}

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
                      <th>Observacion</th>
                      <th>Editor</th>

                      <th colSpan={papelera ? 1 : 2}>
                        {papelera ? "Restaurar" : "Acción"}
                      </th>
                    </tr>
                  </thead>
                  {papelera ? (
                    <tbody>
                      {pagosFiltradosDelete().map((p) => {
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
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editDistintivo}
                                  onChange={(e) =>
                                    setEditDistintivo(e.target.checked)
                                  }
                                />
                              ) : p.distintivo ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editMoneda}
                                  onChange={(e) =>
                                    setEditMoneda(e.target.checked)
                                  }
                                />
                              ) : p.moneda ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
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
                              {" "}
                              {isEditing ? (
                                <input
                                  value={observacion}
                                  type="text"
                                  onChange={(e) =>
                                    setObservacion(e.target.value)
                                  }
                                />
                              ) : p.observacion ? (
                                p.observacion
                              ) : (
                                "👍"
                              )}
                            </td>
                            <td>{p.usuarioEdicion ? p.usuarioEdicion : "Sin editar"}</td>
                            <td>
                              <img
                                className="restaurar_btn"
                                src="../../../restaurar.png"
                                alt="Eliminar"
                                onClick={() => {
                                  setShowRestaurar(true);
                                  setPagoIdRestaurar(p.id);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  ) : (
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
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editDistintivo}
                                  onChange={(e) =>
                                    setEditDistintivo(e.target.checked)
                                  }
                                />
                              ) : p.distintivo ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editMoneda}
                                  onChange={(e) =>
                                    setEditMoneda(e.target.checked)
                                  }
                                />
                              ) : p.moneda ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
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
                              {" "}
                              {isEditing ? (
                                <input
                                  value={observacion}
                                  type="text"
                                  onChange={(e) =>
                                    setObservacion(e.target.value)
                                  }
                                />
                              ) : p.observacion ? (
                                p.observacion
                              ) : (
                                "👍"
                              )}
                            </td>
                            <td>{p.usuarioEdicion ? p.usuarioEdicion : "Sin editar"}</td>

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

                            <td>
                              <img
                                className="user_icon_btn"
                                src="../../../delete_3.png"
                                alt="Eliminar"
                                onClick={() => {
                                  setShowDelete(true);
                                  setPagoIdDelete(p.id);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
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

                    const startEditing = () => {
                      setEditingEntregaId(p.id);
                      setEntregadoEdit(p.entregado);
                    };

                    const guardarEntrega = async () => {
                      try {
                        await updatePago(PATH_PAGOS, editingEntregaId, {
                          entregado: entregadoEdit,
                        });
                        await getPago(PATH_PAGOS);
                        setEditingEntregaId(null);
                      } catch (error) {
                        alert("Error al actualizar entrega.");
                      }
                    };

                    const cancelarEdicion = () => {
                      setEditingEntregaId(null);
                    };

                    return (
                      <tr key={p.id}>
                        <td>{`${inscrip.grado} - ${inscrip.nombres} ${inscrip.apellidos}`}</td>
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
                          {editingEntregaId === p.id ? (
                            <input
                              type="checkbox"
                              checked={entregadoEdit}
                              onChange={(e) =>
                                setEntregadoEdit(e.target.checked)
                              }
                            />
                          ) : p.entregado ? (
                            "✅"
                          ) : (
                            "❌"
                          )}
                        </td>
                        <td>
                          {editingEntregaId === p.id ? (
                            <>
                              <button
                                onClick={guardarEntrega}
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
                              onClick={startEditing}
                              className="vp-btn-edit"
                            >
                              Registrar Entrega
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
                <label>Certificado:</label>
                <select
                  value={filtroCertificado}
                  onChange={(e) => setFiltroCertificado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="con">Con Certificado</option>
                  <option value="sin">Sin Certificado</option>
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
                  setFiltroCertificado("todos")
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
                    <th>Certificado</th>
                    <th>Verificado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados().map((p) => {
                    const inscrip = inscripciones.find(
                      (i) => i.id === p.inscripcionId
                    );
                    const certificado = certificados.find(c => c.cedula === inscrip?.cedula && c.curso === inscrip.curso);

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
                        </td>
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
                        <td>
                          {certificado?.url ? (
                            <a
                              href={certificado.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Certificado
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
    <div>
      {isLoading && <IsLoading />}

      <div className="vp-container">
        <button
          ref={hamburgerRef}
          className="dashboard-hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div
            className={`dashboard-hamburger-inner ${menuOpen ? "open" : ""}`}
          >
            <span className="dashboard-hamburger-line" />
            <span className="dashboard-hamburger-line" />
            <span className="dashboard-hamburger-line" />
          </div>
        </button>

        <nav className={`vp-menu ${menuOpen ? "open" : ""}`} ref={menuRef}>
          <h3>📊 Menú Principal</h3>
          <button
            className={`vp-menu-btn ${activeSection === "resumen" ? "active" : ""
              }`}
            onClick={() => setActiveSection("resumen")}
          >
            📋 Resumen General
          </button>
          <button
            className={`vp-menu-btn ${activeSection === "validarPagos" ? "active" : ""
              }`}
            onClick={() => setActiveSection("validarPagos")}
          >
            ✅ Validar Pagos
          </button>
          <button
            className={`vp-menu-btn ${activeSection === "registrarEntregas" ? "active" : ""
              }`}
            onClick={() => setActiveSection("registrarEntregas")}
          >
            🎁 Registrar Entregas de Distintivos
          </button>
          <button
            className={`vp-menu-btn ${activeSection === "listaPagos" ? "active" : ""
              }`}
            onClick={() => setActiveSection("listaPagos")}
          >
            💳 Lista de Pagos
          </button>
          <button
            className={`vp-menu-btn ${activeSection === "listaInscritos" ? "active" : ""
              }`}
            onClick={() => setActiveSection("listaInscritos")}
          >
            📋 Lista de Inscritos
          </button>
        </nav>

        <main className="vp-content">{renderContent()}</main>
        {showDelete && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>¿Deseas eliminar el registro?</span>
              <section className="btn_content">
                <button
                  className="btn yes"
                  onClick={() => deletePagoPr(pagoIdDelete)}
                >
                  Sí
                </button>
                <button
                  className="btn no"
                  onClick={() => {
                    setShowDelete(false);
                    setPagoIdDelete();
                  }}
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}

        {showRestaurar && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>¿Deseas restaurar registro?</span>
              <section className="btn_content">
                <button
                  className="btn yes"
                  onClick={() => restaurarPagoPr(pagoIdRestaurar)}
                >
                  Sí
                </button>
                <button
                  className="btn no"
                  onClick={() => {
                    setShowRestaurar(false);
                    setPagoIdRestaurar();
                  }}
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidacionPago;
