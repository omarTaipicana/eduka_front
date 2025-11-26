import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Styles/Giscopnsc.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const Giscopnsc = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingPdf, setLoadingPdf] = useState(true); // Nuevo estado

  const containerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(740);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setPdfWidth(containerRef.current.offsetWidth - 35);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadingPdf(false); // PDF cargado
  }

  function goToPrevPage() {
    setPageNumber((prev) => (prev <= 1 ? 1 : prev - 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => (prev >= numPages ? numPages : prev + 1));
  }

  return (
    <div className="giscopnsc_wrapper">
      {loadingPdf && <IsLoading />}

      <h3 className="giscopnsc_title">
        Gestión Integral de la Seguridad Ciudadana y el Orden Público con
        enfoque en Negociación en Situación de Crisis
      </h3>

      <section className="giscopnsc_section">
        Objetivo: Capacitar a los servidores policiales en la gestión integral
        de la seguridad ciudadana y el orden público, dotándolos de
        conocimientos teóricos, herramientas técnicas y habilidades prácticas
        para diseñar, implementar y evaluar políticas y estrategias efectivas
        que contribuyan a la prevención, investigación del delito, la reducción
        de la violencia y la construcción de entornos seguros y pacíficos para
        la ciudadanía.
      </section>
      <section className="giscopnsc_section">
        CURSO CERRADO
      </section>
    </div>
  );
};

export default Giscopnsc;
