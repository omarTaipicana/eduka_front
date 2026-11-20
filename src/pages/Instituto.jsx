import React, { useEffect, useMemo, useRef, useState } from "react";
import useCrud from "../hooks/useCrud";
import axios from "axios";
import * as XLSX from "xlsx";
import getConfigToken from "../services/getConfigToken";
import "./styles/InstitutoCargas.css";
import IsLoading from "../components/shared/isLoading";
import "./styles/Instituto.css";
import useAuth from "../hooks/useAuth";

const Instituto = () => {
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const [, , , loggedUser, , , , , , , , , , user] = useAuth();
  const [filtroCurso, setFiltroCurso] = useState("");

  const rolePath = useMemo(() => {
    if (!user) return "";

    // SUPERADMIN → toma del select
    if (user.cI === superAdmin) {
      return filtroCurso || "";
    }

    // USUARIO NORMAL → toma del rol
    return user?.role?.replace("instituto_", "") || "";
  }, [user, filtroCurso, superAdmin]);

  const PATH_CERTIFICADOS = rolePath
    ? `/instituto/certificados/${rolePath}`
    : null;

  const PATH_CERTIFICADOS_DESCARGAR = rolePath
    ? `/instituto/certificados/${rolePath}/descargar`
    : null;

  const PATH_COURSES = "/courses";

  const [certificados, getCertificados] = useCrud();
  const [downloadProgress, setDownloadProgress] = useState(null);
  const downloadLock = useRef(false);
  const [courses, getCourses] = useCrud();
  // II-IV son opciones de certificados, no cursos con inscripción/pago propios.
  const cursosCertificacion = useMemo(() => {
    const lista = Array.isArray(courses) ? [...courses] : [];
    if (lista.some((c) => c.sigla === "piat-dip-i")) {
      for (const [sigla, nombre] of [
        ["piat-dip-ii", "PIAT - Diplomado II"],
        ["piat-dip-iii", "PIAT - Diplomado III"],
        ["piat-dip-iv", "PIAT - Diplomado IV"],
      ]) {
        if (!lista.some((c) => c.sigla === sigla)) lista.push({ id: sigla, sigla, nombre });
      }
    }
    return lista;
  }, [courses]);

  const [activeSection, setActiveSection] = useState("descargar");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const [selectedArchivos, setSelectedArchivos] = useState([]);

  const [archivoZip, setArchivoZip] = useState(null);
  const archivoInputRef = useRef(null);
  const [sendingDownload, setSendingDownload] = useState(false);
  const [sendingUpload, setSendingUpload] = useState(false);

  const [cursoCarga, setCursoCarga] = useState("auto");
  const [job, setJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [modal, setModal] = useState("");
  const [uploadPct, setUploadPct] = useState(0);
  const [pausarError, setPausarError] = useState(true);
  const pause = useRef(false);
  const busy = useRef(false);
  const api = `${import.meta.env.VITE_API_URL}/instituto/cargas`;
  const config = () => getConfigToken();
  const errorText = e => e.response?.data?.message || e.message || "Error de conexión";
  const refreshJobs = async () => {try {setJobs((await axios.get(api,config())).data);} catch(e){setModal(errorText(e));}};
  useEffect(()=>{if(activeSection === "subir" && user?.id) refreshJobs();},[activeSection,user?.id]);
  useEffect(()=>()=>{pause.current=true;},[]);
  const counts = {total:job?.items.length||0, ok:0, duplicados:0, ignorados:0, error:0, pendiente:0, procesando:0};
  for(const i of job?.items||[]) counts[i.status==="procesados"?"ok":i.status]++;
  const done=counts.ok+counts.duplicados+counts.ignorados+counts.error;
  const pct=counts.total?Math.round(100*done/counts.total):0;
  const descargarReporteExcel = () => {
    if (!job) return;
    try {
      const estados = {procesados:"Correo confirmado", duplicados:"Duplicado", ignorados:"Ignorado", error:"Error", pendiente:"Pendiente", procesando:"Procesando"};
      const resumen = [
        ["EDUKA - Reporte de certificados"],
        ["Lote", job.id], ["Curso", job.curso === "auto" ? "Detección automática" : job.curso],
        ["Fecha de exportación", new Date().toLocaleString("es-EC")],
        ["Estado del lote", job.finished ? "Finalizado" : "No finalizado"],
        ["Total", counts.total], ["Procesados", done], ["Avance (%)", pct],
        ["Correos confirmados", counts.ok], ["Duplicados", counts.duplicados],
        ["Ignorados", counts.ignorados], ["Errores", counts.error],
        ["Pendientes", counts.pendiente], ["Procesando", counts.procesando],
        ["Nota", "Correo confirmado indica aceptación SMTP, no entrega en bandeja."]
      ];
      const encabezados = ["Archivo", "Cédula", "Curso", "Grupo", "Estado", "Detalle"];
      const fila = i => [String(i.archivo || ""), String(i.detalle?.cedula || String(i.archivo || "").match(/\d{10}/)?.[0] || ""), String(i.sigla || ""), String(i.detalle?.grupo || String(i.archivo || "").match(/_g(\d+)/i)?.[1] || ""), estados[i.status] || String(i.status || ""), String(i.motivo || i.detalle?.motivo || "")];
      const libro = XLSX.utils.book_new();
      const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
      hojaResumen["!cols"] = [{wch:32},{wch:76}];
      XLSX.utils.book_append_sheet(libro, hojaResumen, "Resumen");
      const agregarDetalle = (nombre, items) => {
        const hoja = XLSX.utils.aoa_to_sheet([encabezados, ...items.map(fila)]);
        hoja["!cols"] = [55,15,23,10,24,80].map(wch=>({wch}));
        hoja["!autofilter"] = {ref: `A1:F${items.length+1}`};
        XLSX.utils.book_append_sheet(libro, hoja, nombre);
      };
      agregarDetalle("Detalle", job.items);
      agregarDetalle("Errores", job.items.filter(i=>i.status === "error"));
      XLSX.writeFile(libro, `EDUKA-certificados-${job.id}.xlsx`, {compression:true});
    } catch(e) { setModal("No fue posible exportar el reporte: " + errorText(e)); }
  };
  const cerrarCarga = () => {
    if (busy.current || !job?.finished) return;
    setJobs(prev => prev.filter(j => j.id !== job.id));
    setJob(null);
    setArchivoZip(null);
    setCursoCarga("auto");
    setUploadPct(0);
    setPausarError(true);
    setModal("");
    pause.current = false;
    if (archivoInputRef.current) archivoInputRef.current.value = "";
  };
  const run = async (initial, retry=false, finish=false) => {
    if(busy.current)return; busy.current=true; pause.current=false; setSendingUpload(true);
    let j=initial;
    try {
      if(retry){j=(await axios.post(`${api}/${j.id}/reintentar`,{},config())).data;setJob(j);}
      if(finish){j=(await axios.post(`${api}/${j.id}/paso`,{finalizar:true},config())).data;setJob(j);setModal("Lote finalizado. Puedes descargar el reporte Excel y luego cerrar la carga para iniciar otra.");}
      else while(!pause.current && j.items.some(i=>["pendiente","procesando"].includes(i.status))){
        const errors=j.items.filter(i=>i.status==="error").length;
        j=(await axios.post(`${api}/${j.id}/paso`,{},config())).data;setJob(j);
        if(pausarError && j.items.filter(i=>i.status==="error").length>errors){setModal("Proceso pausado por un error. Revisa el detalle y elige continuar o reintentar.");break;}
      }
    } catch(e){setModal(errorText(e)+". El lote permanece guardado; puedes recuperarlo y continuar.");}
    finally{busy.current=false;setSendingUpload(false);refreshJobs();if(PATH_CERTIFICADOS)getCertificados(PATH_CERTIFICADOS);}
  };
  useEffect(() => {
    loggedUser();
    getCourses(PATH_COURSES);
  }, []);

  useEffect(() => {
    if (PATH_CERTIFICADOS) {
      getCertificados(PATH_CERTIFICADOS);
    }
  }, [PATH_CERTIFICADOS]);

  // Cerrar menú si clic fuera (igual que Home)
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
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const listaArchivos = certificados?.curso === rolePath ? (certificados.archivos || []) : [];
  const visibles = selectedArchivos.filter(n => listaArchivos.some(a => a.nombreArchivo === n));
  const selectAll = listaArchivos.length > 0 && visibles.length === listaArchivos.length;
  useEffect(() => { setSelectedArchivos([]); setDownloadProgress(null); }, [rolePath]);
  const handleSelectAll = e => setSelectedArchivos(e.target.checked ? listaArchivos.map(a=>a.nombreArchivo) : []);
  const handleSelectOne = nombre => setSelectedArchivos(prev => prev.includes(nombre) ? prev.filter(n=>n!==nombre) : [...prev,nombre]);
  const handleDescargarSeleccionados = async () => {
    if (downloadLock.current || !PATH_CERTIFICADOS_DESCARGAR || !visibles.length) return;
    downloadLock.current=true; setSendingDownload(true); setDownloadProgress({loaded:0,total:0});
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}${PATH_CERTIFICADOS_DESCARGAR}`, {archivos:visibles}, {
        ...config(), responseType:"blob", onDownloadProgress:e=>setDownloadProgress({loaded:e.loaded,total:e.total||0})
      });
      const filename = /filename="?([^";]+)"?/i.exec(res.headers["content-disposition"]||"")?.[1] || `certificados_${rolePath}.zip`;
      const url=URL.createObjectURL(res.data); const link=document.createElement("a"); link.href=url; link.download=filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),30000);
      setDownloadProgress({loaded:res.data.size,total:res.data.size});
      setModal("ZIP recibido correctamente. Revisa las descargas del navegador.");
    } catch(e) {
      setDownloadProgress(null);
      let msg=errorText(e); try {if(e.response?.data instanceof Blob) msg=JSON.parse(await e.response.data.text()).message||msg;}catch{}
      setModal("No se pudo descargar: "+msg);
    } finally {downloadLock.current=false;setSendingDownload(false);}
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setArchivoZip(file || null);
  };

  const handleUpload = async e => {
    e.preventDefault(); if(!archivoZip||busy.current)return;
    busy.current=true;setSendingUpload(true);setUploadPct(0);
    try {const form=new FormData();form.append("zip",archivoZip);form.append("curso",cursoCarga);
      const j=(await axios.post(api,form,{...config(),onUploadProgress:e=>setUploadPct(e.total?Math.round(e.loaded/e.total*100):0)})).data;
      setJob(j);setArchivoZip(null); e.target.reset();busy.current=false; if(pausarError && j.items.some(i=>i.status==="error")){setSendingUpload(false);setModal("Hay archivos con curso inválido o no autorizado. Revisa los detalles antes de continuar.");refreshJobs();}else await run(j);
    }catch(e){setModal(errorText(e));busy.current=false;setSendingUpload(false);}
  };

  return (
    <div className="institutoPage">
      {modal && <div className="icOverlay"><div className="icModal" role="dialog" aria-modal="true"><h2>EDUKA · Certificados</h2><p>{modal}</p><button className="instPrimaryBtn" onClick={()=>setModal("")}>Aceptar</button></div></div>}

      <div className="institutoShell">
        {/* Botón hamburguesa mobile */}
        <button
          ref={hamburgerRef}
          className={`institutoHamburger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className="institutoHamburgerLine"></span>
          <span className="institutoHamburgerLine"></span>
          <span className="institutoHamburgerLine"></span>
        </button>

        {/* Overlay mobile */}
        <div
          className={`institutoOverlay ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!menuOpen}
        />

        {/* Menú lateral */}
        <nav
          className={`institutoMenu ${menuOpen ? "open" : ""}`}
          ref={menuRef}
          aria-hidden={!menuOpen && window.innerWidth <= 768}
        >
          <div className="institutoMenuHeader">
            <img
              src="/images/eduka_sf.png"
              alt="Eduka"
              className="institutoMenuLogo"
            />
            <p className="institutoMenuSubtitle">Panel Instituto</p>
          </div>

          <button
            className={`institutoMenuBtn ${
              activeSection === "descargar" ? "active" : ""
            }`}
            disabled={sendingUpload}
            onClick={() => handleSelect("descargar")}
          >
            📥 Descargar certificados
          </button>

          <button
            className={`institutoMenuBtn ${
              activeSection === "subir" ? "active" : ""
            }`}
            onClick={() => handleSelect("subir")}
          >
            📤 Subir certificados firmados
          </button>
        </nav>

        {/* Contenido */}
        <main className="institutoContent" tabIndex="-1">
          {/* ===== Descargar ===== */}
          {activeSection === "descargar" && (
            <section className="institutoCard">
              <div className="institutoCardHeader">
                <h2 className="institutoTitle">📥 Descargar certificados</h2>
              </div>

              {!certificados ? (
                <IsLoading />
              ) : listaArchivos.length > 0 ? (
                <>
                  {user.cI === superAdmin && (
                    <div className="input_group secInputGroup">
                      <select
                        value={filtroCurso}
                        disabled={sendingDownload}
                        onChange={(e) => {setSelectedArchivos([]); setFiltroCurso(e.target.value);}}
                        className="buscador_input secInput"
                      >
                        <option value="">Todos los cursos</option>
                        {cursosCertificacion.map((c) => (
                          <option key={c.id} value={c.sigla}>
                            {c.sigla}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <p className="institutoDescription">
                    Selecciona uno o varios certificados. El botón “Ver” abre el
                    PDF, y “Descargar” enviará los seleccionados al backend.
                  </p>

                  <span className="instSelectedInfo">
                    {visibles.length
                      ? `${visibles.length} seleccionado(s)`
                      : "Ninguno seleccionado"}{" "}
                    de {listaArchivos.length}
                  </span>

                  <div className="instActions">
                    <button className="instPrimaryBtn" onClick={handleDescargarSeleccionados} disabled={sendingDownload || !visibles.length}>
                      {sendingDownload ? "Descargando..." : "Descargar seleccionados"}
                    </button>
                  </div>
                  {downloadProgress && <div className="icPanel" role="status">
                    <strong>{downloadProgress.total ? `Descarga: ${Math.min(sendingDownload?99:100,Math.floor(100*downloadProgress.loaded/downloadProgress.total))}%` : downloadProgress.loaded ? "Recibiendo ZIP..." : "Preparando ZIP en el servidor..."}</strong>
                    <progress {...(downloadProgress.total ? {value:downloadProgress.loaded,max:downloadProgress.total} : {})}/>
                    <p>{(downloadProgress.loaded/1048576).toFixed(2)} MB recibidos{downloadProgress.total ? ` de ${(downloadProgress.total/1048576).toFixed(2)} MB` : ""}</p>
                  </div>}
                  <div className="instTableWrapper">
                    <table className="instTable">
                      <thead>
                        <tr>
                          <th className="instCheckCell">
                            <input
                              type="checkbox"
                              disabled={sendingDownload} checked={selectAll}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th>Cédula</th>
                          <th>Nombre del archivo</th>
                          <th>Ver</th>
                        </tr>
                      </thead>

                      <tbody>
                        {listaArchivos.map((item, idx) => (
                          <tr key={idx}>
                            <td className="instCheckCell">
                              <input
                                type="checkbox"
                                disabled={sendingDownload} checked={visibles.includes(
                                  item.nombreArchivo,
                                )}
                                onChange={() =>
                                  handleSelectOne(item.nombreArchivo)
                                }
                              />
                            </td>
                            <td>{item.cedula}</td>
                            <td className="instFileName">
                              {item.nombreArchivo}
                            </td>
                            <td>
                              <a
                                className="instBtnOutline"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </>
              ) : (
                <div>
                  <p className="institutoMuted">
                    No hay certificados disponibles.
                  </p>
                  {user?.cI === superAdmin && (
                    <div className="input_group secInputGroup">
                      <select
                        value={filtroCurso}
                        disabled={sendingDownload}
                        onChange={(e) => {setSelectedArchivos([]); setFiltroCurso(e.target.value);}}
                        className="buscador_input secInput"
                      >
                        <option value="">Todos los cursos</option>
                        {cursosCertificacion.map((c) => (
                          <option key={c.id} value={c.sigla}>
                            {c.sigla}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ===== Subir ===== */}
          {activeSection === "subir" && (
            <section className="institutoCard">
              <div className="institutoCardHeader">
                <h2 className="institutoTitle">
                  📤 Subir certificados firmados
                </h2>
              </div>

              <p className="institutoDescription">
                Sube un ZIP con los certificados firmados. Selecciona el curso o permite que EDUKA lo detecte por el nombre de cada PDF.
              </p>

              <form className="instUploadForm" onSubmit={handleUpload}>
                <label className="instFileLabel">Curso de certificación
                  <select className="icSelect" value={cursoCarga} onChange={e=>setCursoCarga(e.target.value)} disabled={sendingUpload}>
                    <option value="auto">Detectar automáticamente por nombre</option>
                    {(user?.cI===superAdmin?cursosCertificacion:[{sigla:user?.role?.replace("instituto_","")}]).filter(c=>c.sigla).map(c=><option key={c.sigla} value={c.sigla}>{c.sigla}</option>)}
                  </select>
                </label>
                <label className="instFileLabel">
                  <span>Archivo comprimido</span>
                  <input
                    type="file"
                    ref={archivoInputRef}
                    accept=".zip"
                    disabled={sendingUpload}
                    onChange={handleFileChange}
                    className="instFileInput"
                  />
                </label>

                {archivoZip && (
                  <p className="instFileNamePreview">
                    Archivo seleccionado: <strong>{archivoZip.name}</strong>
                  </p>
                )}

                <button
                  type="submit"
                  className="instPrimaryBtn"
                  disabled={sendingUpload || !archivoZip}
                >
                  {sendingUpload ? "Procesando..." : "Subir ZIP e iniciar"}
                </button>
              </form>
              {sendingUpload && !job && <p>Transferencia del ZIP: {uploadPct}%</p>}
              <div className="icPanel">
                <label><input type="checkbox" checked={pausarError} disabled={sendingUpload} onChange={e=>setPausarError(e.target.checked)}/> Pausar automáticamente si falla un certificado</label>
                {jobs.filter(j=>j.id!==job?.id).map(j=><div className="icActions" key={j.id}><span>Lote pendiente · {j.curso} · {j.items.length} PDF</span><button disabled={sendingUpload} onClick={()=>setJob(j)}>Recuperar lote</button></div>)}
                {job && <><h3>Avance del procesamiento · {pct}%</h3><progress value={done} max={counts.total||1}/><p>{done} de {counts.total} certificados procesados</p>
                  <div className="icStats">{[["Correos confirmados",counts.ok],["Duplicados",counts.duplicados],["Ignorados",counts.ignorados],["Errores",counts.error],["Pendientes",counts.pendiente+counts.procesando]].map(([label,n])=><div key={label}><strong>{n}</strong><span>{label}</span></div>)}</div>
                  <div className="icActions">
                    <button disabled={!sendingUpload} onClick={()=>{pause.current=true}}>Pausar</button>
                    <button disabled={sendingUpload||job.finished||!(counts.pendiente+counts.procesando)} onClick={()=>run(job)}>Continuar</button>
                    <button disabled={sendingUpload||job.finished||!job.items.some(i=>i.status==="error"&&i.sigla)} onClick={()=>run(job,true)}>Reintentar errores</button>
                    <button disabled={sendingUpload||job.finished||done!==counts.total} onClick={()=>run(job,false,true)}>Finalizar y enviar resumen</button>
                    <button type="button" onClick={descargarReporteExcel}>Descargar reporte Excel</button>
                    {job.finished && <button type="button" disabled={sendingUpload} onClick={cerrarCarga}>Finalizar carga</button>}
                  </div>
                  <div className="icTable"><table className="instTable"><thead><tr><th>Archivo</th><th>Curso</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{job.items.map(i=><tr key={i.index}><td>{i.archivo}</td><td>{i.sigla||"—"}</td><td>{i.status}</td><td>{i.motivo||"—"}</td></tr>)}</tbody></table></div>
                </>}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Instituto;
