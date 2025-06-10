import React from "react";

const Accv = () => {
  return (
    <div>
      <h1>"ANÁLISIS EN CONDUCTA CRIMINAL Y VICTIMOLOGÍA”</h1>

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <a
          href="https://eduka-educ.com/#/register_discente/accv"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#00509e",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Inscribirse
          </button>
        </a>
        <a
          href="https://eduka-educ.com/#/register_pago/accv"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Registrar pago
          </button>
        </a>
      </div>
    </div>
  );
};

export default Accv;
