import React, { useEffect } from "react";
import "./Styles/PiatDipI.css";

const diplomados = [
  { titulo: "Inteligencia Policial y Captación de Fuentes de Información", imagen: "/images/piat/diplomado-1.png" },
  { titulo: "Análisis Delictivo, Perfilación Criminal y Georreferenciación Táctica", imagen: "/images/piat/diplomado-2.png" },
  { titulo: "Operaciones Tácticas, Actuaciones en Flagrancia y Cadena de Custodia", imagen: "/images/piat/diplomado-3.png" },
  { titulo: "Sustentación Procesal, Litigación Penal y Seguridad Jurídica Policial", imagen: "/images/piat/diplomado-4.png" },
];

export default function PiatDipI() {
  useEffect(() => {
    // La navegación desde la landing debe comenzar en el encabezado del diplomado.
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => {
      cancelAnimationFrame(raf);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  return (
    <div className="piat-page">
      <section className="piat-hero">
        <img className="piat-cover" src="/images/piat/portada.png" alt="Programa de diplomados de formación policial" />
        <div className="piat-hero-body">
          <span className="piat-eyebrow">PROGRAMA DE FORMACIÓN · DIPLOMADO I</span>
          <h1>Inteligencia Policial y Captación de Fuentes de Información</h1>
          <p>Inicia tu formación con el primer diplomado. La inscripción en EDUKA corresponde únicamente al Diplomado I; la continuidad hacia los siguientes diplomados se gestiona desde Moodle según sus requisitos de finalización.</p>
          <div className="piat-actions">
            <a className="piat-button piat-button-primary" href="/#/register_discente/piat-dip-i"><span aria-hidden="true">✦</span> Inscribirme al Diplomado I <span aria-hidden="true">→</span></a>
            <a className="piat-button piat-button-outline" href="/#/register_pago/piat-dip-i"><span aria-hidden="true">▣</span> Registrar mi pago <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
      <section className="piat-content">
        <div className="piat-section-title"><span>RUTA FORMATIVA</span><h2>Conoce los cuatro diplomados</h2><p>Tu inscripción se realiza en el primero. Los siguientes se habilitan desde Moodle conforme avances.</p></div>
        <div className="piat-flow" aria-label="Recorrido de los cuatro diplomados">
          {diplomados.map((d, i) => (
            <React.Fragment key={i}>
              <article className={`piat-card ${i === 0 ? "piat-card-current" : ""}`}>
                <div className="piat-image-frame">
                  <img src={d.imagen} alt={`Diplomado ${i + 1}: ${d.titulo}`} loading="lazy" />
                </div>
                <div className="piat-card-body"><span>Diplomado {['I','II','III','IV'][i]}</span><h3>{d.titulo}</h3><p>{i === 0 ? 'Inscripción disponible en EDUKA' : 'Continuidad administrada en Moodle'}</p></div>
              </article>
              {i < diplomados.length - 1 && <span className="piat-flow-arrow" aria-hidden="true">➜</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="piat-note"><strong>Importante:</strong> EDUKA registra tu inscripción en el Diplomado I. La matrícula en los diplomados II, III y IV no se realiza desde esta página, sino mediante las condiciones configuradas en Moodle.</div>
      </section>
    </div>
  );
}
