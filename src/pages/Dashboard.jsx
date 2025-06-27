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

  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  useEffect(() => {
    getInscripciones(PATH);
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

  const totalInscritos = inscripciones?.length || 0;

  const contarPorGrado = () => {
    const conteo = {};
    inscripciones?.forEach((i) => {
      conteo[i.grado] = (conteo[i.grado] || 0) + 1;
    });
    return Object.entries(conteo).map(([grado, cantidad]) => ({
      grado,
      cantidad,
    }));
  };

  const contarPorSubsistema = () => {
    const conteo = {};
    inscripciones?.forEach((i) => {
      conteo[i.subsistema] = (conteo[i.subsistema] || 0) + 1;
    });
    return Object.entries(conteo).map(([subsistema, cantidad]) => ({
      subsistema,
      cantidad,
    }));
  };

  const contarPorFranjaHoraria = () => {
    const franjas = [
      { label: "00H-03H", from: 0, to: 3 },
      { label: "04H-07H", from: 4, to: 7 },
      { label: "08H-11H", from: 8, to: 11 },
      { label: "12H-15H", from: 12, to: 15 },
      { label: "16H-19H", from: 16, to: 19 },
      { label: "20H-23H", from: 20, to: 23 },
    ];
    const conteo = franjas.map((franja) => ({ ...franja, cantidad: 0 }));
    inscripciones?.forEach((i) => {
      const hour = new Date(i.createdAt).getHours();
      conteo.forEach((franja) => {
        if (hour >= franja.from && hour <= franja.to) {
          franja.cantidad++;
        }
      });
    });
    return conteo.map(({ label, cantidad }) => ({ label, value: cantidad }));
  };

  const contarPorFecha = () => {
    const conteo = {};
    inscripciones?.forEach((i) => {
      const fecha = new Date(i.createdAt).toLocaleDateString();
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });
    return Object.entries(conteo).map(([fecha, cantidad]) => ({
      fecha,
      cantidad,
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return (
          <section className="resumen">
            <h2>📋 Resumen General</h2>
            <div className="summary-card">
              <h3>Total de inscritos</h3>
              <p className="big-number">{totalInscritos}</p>
            </div>
          </section>
        );
      case "inscripciones":
        return (
          <section className="inscripciones">
            <h2>🧾 Inscripciones</h2>
            <p className="summary-inscritos">
              Total: <strong>{totalInscritos}</strong> inscritos
            </p>

            <div className="chart-box">
              <h4>Inscritos por grado</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contarPorGrado()}>
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
                    data={contarPorFranjaHoraria()}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#0053a0"
                    label
                  >
                    {contarPorFranjaHoraria().map((entry, index) => (
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
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Inscritos por subsistema</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contarPorSubsistema()}>
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
                <LineChart data={contarPorFecha()}>
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
        return (
          <section className="pagos">
            <h2>💳 Pagos</h2>
            <p>Próximamente podrás ver información sobre pagos.</p>
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
