import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./styles/Dashboard.css";
import useCrud from "../hooks/useCrud";
import CustomLabel from "../components/Home/CustomLabel";

const Dashboard = () => {
  const [inscripciones, getInscripciones] = useCrud();
  const PATH = "/inscripcion";
  const PATH_PAGOS = "/pagos";
  const [pagos, getPago] = useCrud();
  const pago = pagos.filter((p) => p.confirmacion === true);

  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const [verificadoFiltro, setVerificadoFiltro] = useState("todos");
  const [cursoFiltro, setCursoFiltro] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [fechaDesdePagos, setFechaDesdePagos] = useState("");
  const [fechaHastaPagos, setFechaHastaPagos] = useState("");
  const [fechaDesdeInscripciones, setFechaDesdeInscripciones] = useState("");
  const [fechaHastaInscripciones, setFechaHastaInscripciones] = useState("");

  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    getInscripciones(PATH);
    getPago(PATH_PAGOS);
  }, []);

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

  // Helper función para obtener fecha local YYYY-MM-DD en UTC-5 (Ecuador)
  const fechaLocalISO = (fechaISO) => {
    const fechaObj = new Date(fechaISO);
    // Ajuste para UTC -5:
    // Opcionalmente podrías ajustar con fechaObj.setHours(fechaObj.getHours() - 5)
    // Pero Date() interpreta la fecha en local, por eso usamos getFullYear y demás:
    const year = fechaObj.getFullYear();
    const month = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const day = fechaObj.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const totalInscritos = inscripciones?.length || 0;

  // Total depositado para resumen general
  const totalDepositado = pago?.reduce(
    (acc, p) => acc + (p.valorDepositado || 0),
    0
  );

  const contarPorGrado = (data) => {
    const conteo = {};
    data?.forEach((i) => {
      conteo[i.grado] = (conteo[i.grado] || 0) + 1;
    });
    return Object.entries(conteo).map(([grado, cantidad]) => ({
      grado,
      cantidad,
    }));
  };

  const contarPorSubsistema = (data) => {
    const conteo = {};
    data?.forEach((i) => {
      conteo[i.subsistema] = (conteo[i.subsistema] || 0) + 1;
    });
    return Object.entries(conteo).map(([subsistema, cantidad]) => ({
      subsistema,
      cantidad,
    }));
  };

  const contarPorFranjaHoraria = (data) => {
    const franjas = [
      { label: "00H-03H", from: 0, to: 3 },
      { label: "04H-07H", from: 4, to: 7 },
      { label: "08H-11H", from: 8, to: 11 },
      { label: "12H-15H", from: 12, to: 15 },
      { label: "16H-19H", from: 16, to: 19 },
      { label: "20H-23H", from: 20, to: 23 },
    ];
    const conteo = franjas.map((franja) => ({ ...franja, cantidad: 0 }));
    data?.forEach((i) => {
      const hour = new Date(i.createdAt).getHours();
      conteo.forEach((franja) => {
        if (hour >= franja.from && hour <= franja.to) {
          franja.cantidad++;
        }
      });
    });
    return conteo.map(({ label, cantidad }) => ({ label, value: cantidad }));
  };

  const contarPorFecha = (data) => {
    const conteo = {};
    data?.forEach((i) => {
      const fechaClave = fechaLocalISO(i.createdAt);
      conteo[fechaClave] = (conteo[fechaClave] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([fecha, cantidad]) => ({ fecha, cantidad }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  // En tu componente, justo después de declarar fechaDesde y fechaHasta:

  const inscritosFiltradosPorFecha =
    inscripciones?.filter((i) => {
      const fechaInscripcion = fechaLocalISO(i.createdAt);
      return (
        (!fechaDesde || fechaInscripcion >= fechaDesde) &&
        (!fechaHasta || fechaInscripcion <= fechaHasta)
      );
    }) || [];

  const pagosFiltradosPorFecha =
    pago?.filter((p) => {
      const fechaPago = fechaLocalISO(p.createdAt);
      return (
        (!fechaDesde || fechaPago >= fechaDesde) &&
        (!fechaHasta || fechaPago <= fechaHasta)
      );
    }) || [];

  const totalInscritosF = inscritosFiltradosPorFecha.length;

  const inscritosFiltrados =
    inscripciones?.filter((i) => {
      const fecha = new Date(i.createdAt);
      const desde = fechaDesdeInscripciones
        ? new Date(fechaDesdeInscripciones)
        : null;
      const hasta = fechaHastaInscripciones
        ? new Date(fechaHastaInscripciones)
        : null;
      return (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    }) || [];

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return (
          <section className="resumen">
            <h2>📋 Resumen General</h2>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <label>Desde:</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>

              <div>
                <label>Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>
              <div>
                <button
                  onClick={() => {
                    setFechaDesde("");
                    setFechaHasta("");
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0053a0",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    height: "fit-content",
                  }}
                  type="button"
                >
                  Eliminar filtros
                </button>
              </div>
            </div>

            <div className="summary-card">
              <h3>Total de inscritos</h3>
              <p className="big-number">{totalInscritosF}</p>
            </div>

            <div className="summary-card">
              <div className="summary-card-2">
                <div>
                  <h3>Total depositado</h3>
                  <p className="big-number">
                    $
                    {pagosFiltradosPorFecha
                      .reduce((acc, p) => acc + (p.valorDepositado || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>

                <div>
                  <h3>Total Certificados</h3>
                  <p className="big-number">
                    {
                      new Set(
                        pagosFiltradosPorFecha.map((p) => p.inscripcionId)
                      ).size
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      case "inscripciones":
        return (
          <section className="inscripciones">
            <h2>🧾 Inscripciones</h2>

            <div className="filtro-container">
              <div>
                <label>Desde:</label>
                <input
                  type="date"
                  value={fechaDesdeInscripciones}
                  onChange={(e) => setFechaDesdeInscripciones(e.target.value)}
                />
              </div>

              <div>
                <label>Hasta:</label>
                <input
                  type="date"
                  value={fechaHastaInscripciones}
                  onChange={(e) => setFechaHastaInscripciones(e.target.value)}
                />
              </div>

              <div>
                <button
                  className="btn-reset-filtros"
                  onClick={() => {
                    setFechaDesdeInscripciones("");
                    setFechaHastaInscripciones("");
                  }}
                  type="button"
                >
                  Eliminar filtros
                </button>
              </div>
            </div>

            <div className="summary-card">
              <h3>Total de inscritos</h3>
              <p className="big-number">{inscritosFiltrados.length}</p>
            </div>

            <div className="chart-box">
              <h4>Inscritos por grado</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contarPorGrado(inscritosFiltrados)}>
                  <XAxis dataKey="grado" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="cantidad"
                    fill="#0077cc"
                    label={{ position: "insideTop", fill: "#fff" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Franja horaria de inscripción</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contarPorFranjaHoraria(inscritosFiltrados)}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#0053a0"
                    label
                  >
                    {contarPorFranjaHoraria(inscritosFiltrados).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#0077cc",
                              "#00a8e8",
                              "#00d4ff",
                              "#1de9b6",
                              "#ffd166",
                              "#ff7c43",
                            ][index % 6]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Inscritos por subsistema</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contarPorSubsistema(inscritosFiltrados)}>
                  <XAxis dataKey="subsistema" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="cantidad"
                    fill="#0077cc"
                    label={{ position: "insideTop", fill: "#fff" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Evolutivo diario de inscripciones</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={contarPorFecha(inscritosFiltrados)}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cantidad"
                    stroke="#8884d8"
                    strokeWidth={2}
                    label={<CustomLabel />}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        );

      case "pagos":
        const cursosUnicos = [...new Set(pago?.map((p) => p.curso))];

        const fechaLocalISO = (fechaUTC) => {
          const fecha = new Date(fechaUTC);
          fecha.setHours(fecha.getHours() - 5);
          return fecha.toISOString().split("T")[0];
        };

        const pagosFiltrados =
          pago?.filter((p) => {
            const cumpleVerificado =
              verificadoFiltro === "todos" ||
              (verificadoFiltro === "verificados" && p.verificado) ||
              (verificadoFiltro === "no_verificados" && !p.verificado);

            const cumpleCurso =
              cursoFiltro === "todos" || p.curso === cursoFiltro;

            const fechaPago = fechaLocalISO(p.createdAt);
            const cumpleFechaDesde =
              !fechaDesdePagos || fechaPago >= fechaDesdePagos;
            const cumpleFechaHasta =
              !fechaHastaPagos || fechaPago <= fechaHastaPagos;

            return (
              cumpleVerificado &&
              cumpleCurso &&
              cumpleFechaDesde &&
              cumpleFechaHasta
            );
          }) || [];

        const countMonedas = pagosFiltrados.filter((p) => p.moneda).length;
        const countDistintivos = pagosFiltrados.filter(
          (p) => p.distintivo
        ).length;
        const totalMonedas = countMonedas * 15;
        const totalDistintivos = countDistintivos * 10;
        const totalConceptos = totalMonedas + totalDistintivos;

        const totalPagos = pagosFiltrados.reduce(
          (acc, p) => acc + (p.valorDepositado || 0),
          0
        );

        const conteoDistMoneda = [
          { name: "Distintivo", value: countDistintivos },
          { name: "Moneda", value: countMonedas },
        ];

        const pagosPorFechaMap = {};
        pagosFiltrados.forEach((p) => {
          const fecha = fechaLocalISO(p.createdAt);
          pagosPorFechaMap[fecha] =
            (pagosPorFechaMap[fecha] || 0) + (p.valorDepositado || 0);
        });
        const pagosPorFecha = Object.entries(pagosPorFechaMap)
          .map(([fecha, total]) => ({ fecha, total }))
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        const gradoPagosCount = {};
        pagosFiltrados.forEach((p) => {
          const inscrip = inscripciones?.find((i) => i.id === p.inscripcionId);
          if (inscrip) {
            gradoPagosCount[inscrip.grado] =
              (gradoPagosCount[inscrip.grado] || 0) + 1;
          }
        });
        const pagosPorGrado = Object.entries(gradoPagosCount).map(
          ([grado, cantidad]) => ({ grado, cantidad })
        );

        return (
          <section className="pagos">
            <h2>💳 Pagos</h2>

            <div className="filtro-container">
              <div>
                <label>Filtrar por verificación:</label>
                <select
                  value={verificadoFiltro}
                  onChange={(e) => setVerificadoFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="verificados">Verificados</option>
                  <option value="no_verificados">No Verificados</option>
                </select>
              </div>

              <div>
                <label>Filtrar por curso:</label>
                <select
                  value={cursoFiltro}
                  onChange={(e) => setCursoFiltro(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  {cursosUnicos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Desde:</label>
                <input
                  type="date"
                  value={fechaDesdePagos}
                  onChange={(e) => setFechaDesdePagos(e.target.value)}
                />
              </div>

              <div>
                <label>Hasta:</label>
                <input
                  type="date"
                  value={fechaHastaPagos}
                  onChange={(e) => setFechaHastaPagos(e.target.value)}
                />
              </div>

              <div>
                <button
                  className="btn-reset-filtros"
                  onClick={() => {
                    setVerificadoFiltro("todos");
                    setCursoFiltro("todos");
                    setFechaDesdePagos("");
                    setFechaHastaPagos("");
                  }}
                  type="button"
                >
                  Eliminar filtros
                </button>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-2">
                <div>
                  <h3>Total depositado</h3>
                  <p className="big-number">${totalPagos.toFixed(2)}</p>
                </div>

                <div>
                  <h3>Total Certificados</h3>
                  <p className="big-number">
                    {pagosFiltrados
                      ? new Set(pagosFiltrados.map((p) => p.inscripcionId)).size
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="chart-box">
              <h4>Pagos con Distintivo vs Moneda</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={conteoDistMoneda}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#0053a0"
                    label
                  >
                    {conteoDistMoneda.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#0077cc", "#00a8e8"][index % 2]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                <h4>Total Recaudado por conceptos</h4>
                <p
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                    color: "#0077cc",
                    margin: 0,
                  }}
                >
                  ${totalConceptos.toFixed(2)}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#555" }}>
                  (Moneda: {countMonedas} × $15 = ${totalMonedas}, Distintivo:{" "}
                  {countDistintivos} × $10 = ${totalDistintivos})
                </p>
              </div>
            </div>

            <div className="chart-box">
              <h4>Evolutivo diario de pagos</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={pagosPorFecha}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    strokeWidth={2}
                    label={({ x, y, value }) => (
                      <text
                        x={x}
                        y={y - 10}
                        fill="#666"
                        fontSize={12}
                        textAnchor="middle"
                      >
                        ${value.toFixed(2)}
                      </text>
                    )}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Pagos por grado</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pagosPorGrado}>
                  <XAxis dataKey="grado" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="cantidad"
                    fill="#0077cc"
                    label={{ position: "insideTop", fill: "#fff" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        );

      case "calificaciones":
        return (
          <section className="calificaciones">
            <h2>📝 Calificaciones</h2>
            <p>Próximamente podrás ver calificaciones.</p>
          </section>
        );
      case "progreso":
        return (
          <section className="progreso">
            <h2>📈 Progreso</h2>
            <p>Próximamente podrás ver tu progreso académico.</p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <button
        ref={hamburgerRef}
        className="dashboard-hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span
          className={`dashboard-hamburger-line ${menuOpen ? "open" : ""}`}
        />
        <span
          className={`dashboard-hamburger-line ${menuOpen ? "open" : ""}`}
        />
        <span
          className={`dashboard-hamburger-line ${menuOpen ? "open" : ""}`}
        />
      </button>

      <nav className={`dashboard-menu ${menuOpen ? "open" : ""}`} ref={menuRef}>
        <h3>📊 Dashboard</h3>
        <button
          className={`menu-btn ${activeSection === "resumen" ? "active" : ""}`}
          onClick={() => setActiveSection("resumen")}
        >
          📋 Resumen General
        </button>
        <button
          className={`menu-btn ${
            activeSection === "inscripciones" ? "active" : ""
          }`}
          onClick={() => setActiveSection("inscripciones")}
        >
          🧾 Inscripciones
        </button>
        <button
          className={`menu-btn ${activeSection === "pagos" ? "active" : ""}`}
          onClick={() => setActiveSection("pagos")}
        >
          💳 Pagos
        </button>
        <button
          className={`menu-btn ${
            activeSection === "calificaciones" ? "active" : ""
          }`}
          onClick={() => setActiveSection("calificaciones")}
        >
          📝 Calificaciones
        </button>
        <button
          className={`menu-btn ${activeSection === "progreso" ? "active" : ""}`}
          onClick={() => setActiveSection("progreso")}
        >
          📈 Progreso
        </button>
      </nav>

      <main className="dashboard-content">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
