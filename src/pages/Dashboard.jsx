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
  const [inscripcionDashboard, getInscipcionDashboard,,,,,isLoading] = useCrud();
  const [pagoDashboard, getPagoDashboard,,,,,isLoading2] = useCrud();

  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [verificadoFiltro, setVerificadoFiltro] = useState("todos");
  const [cursoFiltro, setCursoFiltro] = useState("todos");
  const [fechaDesdePagos, setFechaDesdePagos] = useState("");
  const [fechaHastaPagos, setFechaHastaPagos] = useState("");

  const [fechaDesdeInscripciones, setFechaDesdeInscripciones] = useState("");
  const [fechaHastaInscripciones, setFechaHastaInscripciones] = useState("");

  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    getInscipcionDashboard(
      `/inscripcion_dashboard?desde=${fechaDesdeInscripciones}&hasta=${fechaHastaInscripciones}`
    );
  }, [fechaDesdeInscripciones, fechaHastaInscripciones]);

  useEffect(() => {
    getPagoDashboard(
      `/pagos_dashboard?desde=${fechaDesdePagos}&hasta=${fechaHastaPagos}&curso=${cursoFiltro}&verificado=${verificadoFiltro}`
    );
  }, [fechaHastaPagos, fechaDesdePagos, cursoFiltro, verificadoFiltro]);

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

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        // Totales directos desde pagoDashboard
        const totalInscritosF = inscripcionDashboard?.totalInscritos || 0;
        const totalDepositado = pagoDashboard?.totalPagos || 0;
        const totalCertificados = pagoDashboard?.totalPagosDinstint || 0;

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
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setFechaDesdeInscripciones(e.target.value);
                    setFechaDesdePagos(e.target.value);
                  }}
                />
              </div>

              <div>
                <label>Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setFechaHastaInscripciones(e.target.value);
                    setFechaHastaPagos(e.target.value);
                  }}
                />
              </div>
              <div>
                <button
                  onClick={() => {
                    setFechaDesde("");
                    setFechaHasta("");

                    setCursoFiltro("todos");
                    setVerificadoFiltro("todos");
                    setFechaDesdePagos("");
                    setFechaHastaPagos("");

                    setFechaDesdeInscripciones("");
                    setFechaHastaInscripciones("");
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
                  <p className="big-number">${totalDepositado.toFixed(2)}</p>
                </div>

                <div>
                  <h3>Total Certificados</h3>
                  <p className="big-number">{totalCertificados}</p>
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
                    setFechaDesde("");
                    setFechaHasta("");

                    setCursoFiltro("todos");
                    setVerificadoFiltro("todos");
                    setFechaDesdePagos("");
                    setFechaHastaPagos("");

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
              <p className="big-number">
                {inscripcionDashboard.totalInscritos}
              </p>
            </div>

            <div className="chart-box">
              <h4>Inscritos por grado</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inscripcionDashboard.inscritosPorGrado}>
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
                    data={inscripcionDashboard.inscritosPorFranjaHoraria}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#0053a0"
                    label
                  >
                    {inscripcionDashboard.inscritosPorFranjaHoraria.map(
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
                <BarChart data={inscripcionDashboard.inscritosPorSubsistema}>
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
                  data={inscripcionDashboard.inscritosPorDia}
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
        // Cursos únicos desde pagosPorCurso
        const cursosUnicos =
          pagoDashboard?.pagosPorCurso?.map((c) => c.curso) || [];
       
       // Filtro por verificación y curso
        const pagosPorCursoFiltrados =
          pagoDashboard?.pagosPorCurso?.filter((p) => {
            const cumpleCurso =
              cursoFiltro === "todos" || p.curso === cursoFiltro;
            // Para verificación, asumimos que ya está contado en pagosPorCurso
            const cumpleVerificado = true; // no hay verificado aquí, ajusta si traes ese dato
            return cumpleCurso && cumpleVerificado;
          }) || [];

        // Conteo Distintivo vs Moneda
        const conteoDistMoneda = pagoDashboard?.conteoDistMoneda || [];

        // Total recaudado por conceptos
        const totalMonedas = pagoDashboard?.totalMonedas || 0;
        const totalDistintivos = pagoDashboard?.totalDistintivos || 0;
        const totalConceptos = pagoDashboard?.totalConceptos || 0;
        const totalPagos = pagoDashboard?.totalPagos || 0;
        const pagosPorGrado = pagoDashboard?.pagosPorGrado || [];


        // Evolutivo diario de pagos
        const pagosPorFecha = pagoDashboard?.pagosPorFecha || [];

        // Pagos por grado: si tu backend no los envía, puedes derivarlos de pagosPorCursoFiltrados
        const pagosPorGradoMap = {};
        pagosPorCursoFiltrados.forEach((p) => {
          const grado = p.grado || "Sin grado"; // ajusta si el dato viene
          pagosPorGradoMap[grado] = (pagosPorGradoMap[grado] || 0) + 1;
        });
     

        return (
          <section className="pagos">
            <h2>💳 Pagos</h2>

            <div className="filtro-container">
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
                    setFechaDesde("");
                    setFechaHasta("");

                    setCursoFiltro("todos");
                    setVerificadoFiltro("todos");
                    setFechaDesdePagos("");
                    setFechaHastaPagos("");

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
              <div className="summary-card-2">
                <div>
                  <h3>Total depositado</h3>
                  <p className="big-number">${totalPagos.toFixed(2)}</p>
                </div>

                <div>
                  <h3>Total Certificados</h3>
                  <p className="big-number">
                    {pagoDashboard?.totalPagosDinstint || 0}
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
                  (Moneda: {totalMonedas}, Distintivo: {totalDistintivos})
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
