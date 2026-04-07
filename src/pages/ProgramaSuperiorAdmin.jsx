import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./styles/ValidacionPago.css";
import useCrud from "../hooks/useCrud";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import getConfigToken from "../services/getConfigToken";
import IsLoading from "../components/shared/isLoading";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";

const BASEURL = import.meta.env.VITE_API_URL;

const PATH_PROGRAMAS = "/programa-superior";
const PATH_INSCRIPCIONES = "/programa-inscripciones";
const PATH_PAGOS = "/programa-pagos";
const PATH_VARIABLES = "/variables";

const DEFAULT_FORM_VALUES = {
  inscritoPor: "eduka",
  descuento: 0,
  totalAPagar: "",
  cedula: "",
  firstName: "",
  lastName: "",
  email: "",
  cellular: "",
  inscripcionId: "",
  valorPagado: "",
  entidad: "",
  idDeposito: "",
  observacion: "",
  comprobante: null,
};

const ProgramaSuperiorAdmin = () => {
  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const contentRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm();

  const [programas, getProgramas] = useCrud();
  const [
    inscripciones,
    getInscripciones,
    ,
    ,
    updateInscripcion,
    errorI,
    isLoadingI,
  ] = useCrud();
  const [pagos, getPagos, , , updatePago, error, isLoading] = useCrud();
  const [variables, getVariables] = useCrud();
  const [editPagoId, setEditPagoId] = useState(null);
  const [editInscripcionId, setEditInscripcionId] = useState(null);
  const dispatch = useDispatch();

  const [, , , loggedUser, , , , , , , , , , user] = useAuth();

  const [selectedPrograma, setSelectedPrograma] = useState("");
  const [selectedInscripcionId, setSelectedInscripcionId] = useState("");
  const [selectedTipoPrograma, setSelectedTipoPrograma] = useState("");
  const [isSubmittingInscripcion, setIsSubmittingInscripcion] = useState(false);
  const [isSubmittingPago, setIsSubmittingPago] = useState(false);
  const [isEmitiendoFactura, setIsEmitiendoFactura] = useState(false);
  const [facturandoPagoId, setFacturandoPagoId] = useState(null);

  const [filtroBusquedaPago, setFiltroBusquedaPago] = useState("");
  const [filtroVerificadoPago, setFiltroVerificadoPago] = useState("");
  const [filtroFechaInicioPago, setFiltroFechaInicioPago] = useState("");
  const [filtroFechaFinPago, setFiltroFechaFinPago] = useState("");
  const [ordenFechaDesc, setOrdenFechaDesc] = useState(true);

  const inscritoPorValue = watch("inscritoPor");

  const [filtroBusquedaInscrito, setFiltroBusquedaInscrito] = useState("");
  const [filtroFechaInicioInscrito, setFiltroFechaInicioInscrito] = useState("");
  const [filtroFechaFinInscrito, setFiltroFechaFinInscrito] = useState("");
  const [filtroInscritoPor, setFiltroInscritoPor] = useState("");
  const [filtroEstadoInscrito, setFiltroEstadoInscrito] = useState("");

  useEffect(() => {
    if (error) {
      const message = error.response?.data?.message || "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        }),
      );
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (errorI) {
      const message = errorI.response?.data?.message || "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        }),
      );
    }
  }, [errorI, dispatch]);

  useEffect(() => {
    cargarInscripcionesFiltradas();
  }, [
    filtroBusquedaInscrito,
    filtroFechaInicioInscrito,
    filtroFechaFinInscrito,
    filtroInscritoPor,
    filtroEstadoInscrito,
  ]);

  const cargarInscripcionesFiltradas = async () => {
    const params = new URLSearchParams();

    if (filtroBusquedaInscrito) params.append("busqueda", filtroBusquedaInscrito);
    if (filtroFechaInicioInscrito) params.append("fechaInicio", filtroFechaInicioInscrito);
    if (filtroFechaFinInscrito) params.append("fechaFin", filtroFechaFinInscrito);
    if (filtroInscritoPor) params.append("inscritoPor", filtroInscritoPor);
    if (filtroEstadoInscrito) params.append("estadoPago", filtroEstadoInscrito);

    await getInscripciones(`${PATH_INSCRIPCIONES}?${params.toString()}`);
  };

  const limpiarFiltrosInscritos = () => {
    setFiltroBusquedaInscrito("");
    setFiltroFechaInicioInscrito("");
    setFiltroFechaFinInscrito("");
    setFiltroInscritoPor("");
    setFiltroEstadoInscrito("");
  };

  const iniciarEdicionPago = (pago) => {
    setEditPagoId(pago.id);

    resetEdit({
      valorPagado: pago.valorPagado || "",
      entidad: pago.entidad || "",
      idDeposito: pago.idDeposito || "",
      observacion: pago.observacion || "",
      verificado: !!pago.verificado,
    });
  };

  const iniciarEdicionInscripcion = (inscrito) => {
    setEditInscripcionId(inscrito.id);

    resetEdit({
      descuento: inscrito.descuento || "",
      totalAPagar: inscrito.totalAPagar || "",
    });
  };

  const cancelarEdicionPago = () => {
    setEditPagoId(null);
    resetEdit({
      valorPagado: "",
      entidad: "",
      idDeposito: "",
      observacion: "",
      verificado: true,
    });
  };

  const cancelarEdicionInscripcion = () => {
    setEditInscripcionId(null);
    resetEdit({
      descuento: "",
      totalAPagar: "",
    });
  };

  const guardarEdicionPago = async (pagoId, data) => {
    try {
      await updatePago(PATH_PAGOS, pagoId, {
        valorPagado: Number(data.valorPagado || 0),
        entidad: data.entidad,
        idDeposito: data.idDeposito,
        observacion: data.observacion || "",
        verificado: !!data.verificado,
        usuarioEdicion: user?.email || "",
      });

      await getPagos(PATH_PAGOS);
      await getInscripciones(PATH_INSCRIPCIONES);
      cancelarEdicionPago();

      dispatch(
        showAlert({
          message: "✅ Pago actualizado correctamente",
          alertType: 3,
        }),
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      dispatch(
        showAlert({
          message: `⚠️ ${err.response?.data?.message || err.response?.data?.error || "Error actualizando pago"}`,
          alertType: 1,
        }),
      );
    }
  };

  const guardarEdicionInscripcion = async (inscripcionId, data) => {
    try {
      await updateInscripcion(PATH_INSCRIPCIONES, inscripcionId, {
        descuento: Number(data.descuento || 0),
        totalAPagar: Number(data.totalAPagar || 0),
      });

      await getPagos(PATH_PAGOS);
      await getInscripciones(PATH_INSCRIPCIONES);
      cancelarEdicionInscripcion();

      dispatch(
        showAlert({
          message: "✅ Inscripción actualizada correctamente",
          alertType: 3,
        }),
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      dispatch(
        showAlert({
          message: `⚠️ ${err.response?.data?.message || err.response?.data?.error || "Error actualizando pago"}`,
          alertType: 1,
        }),
      );
    }
  };

  /* =============================
     HELPERS
  ============================= */

  const normalizeId = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const refreshAll = async () => {
    await Promise.all([
      getProgramas(PATH_PROGRAMAS),
      getInscripciones(PATH_INSCRIPCIONES),
      getPagos(PATH_PAGOS),
      getVariables(PATH_VARIABLES),
    ]);
  };

  const calcularTotalPagado = (pagosData) => {
    if (!pagosData) return 0;

    if (Array.isArray(pagosData)) {
      return pagosData.reduce((acc, p) => acc + Number(p?.valorPagado || 0), 0);
    }

    return Number(pagosData?.valorPagado || 0);
  };

  const calcularTotalPagadoPorInscripcion = (inscripcionId) => {
    if (!Array.isArray(pagos)) return 0;

    return pagos
      .filter(
        (p) =>
          normalizeId(p?.programaInscripcioneId) === normalizeId(inscripcionId),
      )
      .reduce((acc, p) => acc + Number(p?.valorPagado || 0), 0);
  };

  const getProgramaPrecio = (programa) => {
    return (
      Number(programa?.precio) ||
      Number(programa?.precioTotal) ||
      Number(programa?.valorTotal) ||
      Number(programa?.precioEduka) ||
      0
    );
  };

  const getProgramaNombre = (programa) => {
    return programa || "Programa";
  };

  const resetFormularios = () => {
    reset(DEFAULT_FORM_VALUES);
    setSelectedPrograma("");
    setSelectedInscripcionId("");
  };

  const getFacturaUI = (p) => {
    if (!p?.contificoDocumentoId) {
      return { type: "emitir", label: "Emitir factura" };
    }

    if (p?.contificoAutorizacion) {
      return {
        type: "ver",
        label: "Ver factura",
        href: p?.contificoUrlRide || p?.contificoUrlXml,
      };
    }

    return { type: "pendiente", label: "Pendiente SRI" };
  };

  /* =============================
     MEMOS
  ============================= */

  const programasFiltradosPorTipo = useMemo(() => {
    if (!Array.isArray(programas)) return [];

    if (!selectedTipoPrograma) return [];

    return programas.filter(
      (p) =>
        String(p?.tipo || "").trim() === String(selectedTipoPrograma).trim(),
    );
  }, [programas, selectedTipoPrograma]);

  const inscripcionesUnicas = useMemo(() => {
    if (!Array.isArray(inscripciones)) return [];

    const map = new Map();

    inscripciones.forEach((item) => {
      const id = normalizeId(item?.id);
      if (id && !map.has(id)) {
        map.set(id, item);
      }
    });

    return Array.from(map.values());
  }, [inscripciones]);

  const entidadesUnicas = useMemo(() => {
    if (!Array.isArray(pagos)) return [];

    const set = new Set();

    pagos.forEach((p) => {
      const entidad = String(p?.entidad || "").trim();
      if (entidad) set.add(entidad);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [pagos]);

  const selectedInscripcionPago = useMemo(() => {
    if (!selectedInscripcionId || !Array.isArray(inscripcionesUnicas))
      return null;

    return (
      inscripcionesUnicas.find(
        (i) => normalizeId(i?.id) === normalizeId(selectedInscripcionId),
      ) || null
    );
  }, [selectedInscripcionId, inscripcionesUnicas]);

  const pagosFiltrados = useMemo(() => {
    if (!Array.isArray(pagos)) return [];

    let data = [...pagos];

    if (filtroBusquedaPago.trim()) {
      const q = filtroBusquedaPago.trim().toLowerCase();

      data = data.filter((p) => {
        const nombres = `${p?.inscripcion?.user?.firstName || ""} ${p?.inscripcion?.user?.lastName || ""
          }`.toLowerCase();

        const cedula = String(p?.inscripcion?.user?.cI || "").toLowerCase();
        const email = String(p?.inscripcion?.user?.email || "").toLowerCase();
        const programa = String(
          p?.inscripcion?.programasSuperiore?.nombre || "",
        ).toLowerCase();
        const entidad = String(p?.entidad || "").toLowerCase();
        const idDeposito = String(p?.idDeposito || "").toLowerCase();

        return (
          nombres.includes(q) ||
          cedula.includes(q) ||
          email.includes(q) ||
          programa.includes(q) ||
          entidad.includes(q) ||
          idDeposito.includes(q)
        );
      });
    }

    if (filtroVerificadoPago === "true") {
      data = data.filter((p) => !!p?.verificado);
    }

    if (filtroVerificadoPago === "false") {
      data = data.filter((p) => !p?.verificado);
    }

    if (filtroFechaInicioPago) {
      const inicio = new Date(`${filtroFechaInicioPago}T00:00:00`);
      data = data.filter((p) => new Date(p.createdAt) >= inicio);
    }

    if (filtroFechaFinPago) {
      const fin = new Date(`${filtroFechaFinPago}T23:59:59`);
      data = data.filter((p) => new Date(p.createdAt) <= fin);
    }

    data.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return ordenFechaDesc ? db - da : da - db;
    });

    return data;
  }, [
    pagos,
    filtroBusquedaPago,
    filtroVerificadoPago,
    filtroFechaInicioPago,
    filtroFechaFinPago,
    ordenFechaDesc,
  ]);

  /* =============================
     CARGA INICIAL
  ============================= */

  useEffect(() => {
    refreshAll();
    loggedUser();
  }, []);

  /* =============================
     CERRAR MENÚ AL HACER CLICK FUERA
  ============================= */

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

  /* =============================
     AUTOCARGAR PRECIO
  ============================= */

  useEffect(() => {
    if (!selectedPrograma || !Array.isArray(programas)) return;

    const programa = programas.find(
      (p) => normalizeId(p?.id) === normalizeId(selectedPrograma),
    );

    if (!programa) return;

    const precioEduka =
      Number(programa?.precioEduka) ||
      Number(programa?.precio_eduka) ||
      Number(programa?.precio) ||
      Number(programa?.precioTotal) ||
      0;

    const precioAsociado =
      Number(programa?.precioAsociado) ||
      Number(programa?.precio_asociado) ||
      Number(programa?.precioAsociadoTotal) ||
      precioEduka;

    const total =
      inscritoPorValue === "asociado" ? precioAsociado : precioEduka;

    setValue("totalAPagar", total > 0 ? total : "");
  }, [selectedPrograma, inscritoPorValue, programas, setValue]);

  /* =============================
     CREAR INSCRIPCIÓN
  ============================= */

  const submitInscripcion = async (data) => {
    try {
      if (isSubmittingInscripcion) return;
      setIsSubmittingInscripcion(true);

      if (!selectedPrograma) {
        alert("Debes seleccionar un programa");
        return;
      }

      if (!user?.id) {
        alert("No se pudo identificar el usuario administrador");
        return;
      }

      const totalAPagar = Number(data.totalAPagar || 0);
      const descuento = Number(data.descuento || 0);

      if (totalAPagar <= 0) {
        alert("El total a pagar debe ser mayor a 0");
        return;
      }

      const respUser = await axios.post(
        `${BASEURL}/programa-inscripciones/validate-user`,
        {
          cedula: data.cedula?.trim(),
          email: data.email?.trim(),
          nombres: data.firstName?.trim(),
          apellidos: data.lastName?.trim(),
          celular: data.cellular?.trim(),
        },
        getConfigToken(),
      );

      const userId = respUser?.data?.user?.id;

      if (!userId) {
        alert("No se pudo obtener el usuario");
        return;
      }

      await axios.post(
        `${BASEURL}${PATH_INSCRIPCIONES}`,
        {
          userId,
          programasSuperioreId: selectedPrograma,
          registradoPor: user.id,
          inscritoPor: data.inscritoPor,
          descuento,
          totalAPagar,
        },
        getConfigToken(),
      );

      await refreshAll();
      resetFormularios();
      dispatch(
        showAlert({
          message: "✅ Inscripción creada correctamente",
          alertType: 3,
        }),
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al crear inscripción",
      );
    } finally {
      setIsSubmittingInscripcion(false);
    }
  };

  /* =============================
     REGISTRAR PAGO CON VALIDACIÓN DIRECTA
  ============================= */

  const submitPago = async (data) => {
    try {
      if (isSubmittingPago) return;
      setIsSubmittingPago(true);

      const inscripcionId = normalizeId(data.inscripcionId);
      const valorPagado = Number(data.valorPagado || 0);
      const entidad = String(data.entidad || "").trim();
      const idDeposito = String(data.idDeposito || "").trim();
      const observacion = String(data.observacion || "").trim();

      if (!inscripcionId) {
        alert("Debes seleccionar una inscripción");
        return;
      }

      if (valorPagado <= 0) {
        alert("El valor pagado debe ser mayor a 0");
        return;
      }

      if (!entidad) {
        alert("Debes ingresar la entidad");
        return;
      }

      if (!idDeposito) {
        alert("Debes ingresar el ID de depósito");
        return;
      }

      if (!user?.email) {
        alert("No se pudo identificar el usuario administrador");
        return;
      }

      const formData = new FormData();
      formData.append("programaInscripcioneId", inscripcionId);
      formData.append("valorPagado", valorPagado);
      formData.append("entidad", entidad);
      formData.append("idDeposito", idDeposito);
      formData.append("observacion", observacion);
      formData.append("verificado", true);
      formData.append("usuarioEdicion", user.email);

      if (data.comprobante && data.comprobante[0]) {
        formData.append("imagePago", data.comprobante[0]);
      }

      await axios.post(`${BASEURL}${PATH_PAGOS}`, formData, {
        ...getConfigToken(),
        headers: {
          ...getConfigToken()?.headers,
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshAll();

      reset({
        ...DEFAULT_FORM_VALUES,
        inscripcionId: "",
      });

      setSelectedInscripcionId("");
      dispatch(
        showAlert({
          message: "✅ Pago registrado y validado correctamente",
          alertType: 3,
        }),
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error registrando pago",
      );
    } finally {
      setIsSubmittingPago(false);
    }
  };

  /* =============================
     FACTURAR PAGO
  ============================= */

  const emitirFacturaManual = async (pagoId) => {
    try {
      if (isEmitiendoFactura) return;
      setIsEmitiendoFactura(true);
      setFacturandoPagoId(pagoId);

      const { data } = await axios.post(
        `${BASEURL}/contifico/factura/emitir-manual-programa`,
        { pagoId },
        getConfigToken(),
      );

      await getPagos(PATH_PAGOS);

      dispatch(
        showAlert({
          message: `✅ ${data?.message || "Factura emitida correctamente"}`,
          alertType: 3,
        }),
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al emitir factura",
      );
    } finally {
      setIsEmitiendoFactura(false);
      setFacturandoPagoId(null);
    }
  };

  const limpiarFiltrosPagos = () => {
    setFiltroBusquedaPago("");
    setFiltroVerificadoPago("");
    setFiltroFechaInicioPago("");
    setFiltroFechaFinPago("");
  };

  /* =============================
     RESUMEN
  ============================= */

  const renderResumen = () => {
    const totalInscritos = Array.isArray(inscripcionesUnicas)
      ? inscripcionesUnicas.length
      : 0;

    const totalPagosMonto = Array.isArray(pagos)
      ? pagos.reduce((acc, p) => acc + Number(p?.valorPagado || 0), 0)
      : 0;

    return (
      <section className="secCard">
        <div className="secCardHeader">
          <h2 className="secTitle">📊 Resumen Programas</h2>
        </div>

        <div className="vpResumenGrid">
          <div className="vpStatCard">
            <div className="vpStatLabel">Programas</div>
            <div className="vpStatMain">
              {Array.isArray(programas) ? programas.length : 0}
            </div>
          </div>

          <div className="vpStatCard">
            <div className="vpStatLabel">Inscritos</div>
            <div className="vpStatMain">{totalInscritos}</div>
          </div>

          <div className="vpStatCard">
            <div className="vpStatLabel">Pagos registrados</div>
            <div className="vpStatMain">
              {Array.isArray(pagos) ? pagos.length : 0}
            </div>
          </div>

          <div className="vpStatCard">
            <div className="vpStatLabel">Monto total</div>
            <div className="vpStatMain">${totalPagosMonto.toFixed(2)}</div>
          </div>
        </div>
      </section>
    );
  };

  /* =============================
     INSCRIBIR
  ============================= */

  const renderInscribir = () => {
    return (
      <section className="secCard">
        {(isLoading ||
          isLoadingI ||
          isSubmittingInscripcion ||
          isSubmittingPago ||
          isEmitiendoFactura) && <IsLoading />}
        <div className="secCardHeader">
          <h2 className="secTitle">👤 Inscribir Participante</h2>
        </div>

        <form onSubmit={handleSubmit(submitInscripcion)} className="secFilters">
          <div className="secInputGroup">
            <label className="vpLbl">Tipo</label>
            <select
              className="secInput"
              value={selectedTipoPrograma}
              onChange={(e) => setSelectedTipoPrograma(e.target.value)}
              required
            >
              <option value="">Seleccione</option>
              <option value="tecnologia">Tecnología</option>
              <option value="maestria">Maestría</option>
              <option value="licenciatura">Licenciatura</option>
              <option value="combo">MBA - Licenciatura</option>
              <option value="abogacia">Abogacía</option>
            </select>
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Programa</label>
            <select
              className="secInput"
              value={selectedPrograma}
              onChange={(e) => setSelectedPrograma(e.target.value)}
              required
              disabled={!selectedTipoPrograma}
            >
              <option value="">Seleccione</option>
              {programasFiltradosPorTipo.map((p) => (
                <option key={normalizeId(p.id)} value={normalizeId(p.id)}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Inscrito por</label>
            <select
              className="secInput"
              {...register("inscritoPor")}
              defaultValue="eduka"
              required
            >
              <option value="eduka">Eduka</option>
              <option value="asociado">Asociado</option>
            </select>
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Total a pagar</label>
            <input
              type="number"
              step="0.01"
              className="secInput"
              {...register("totalAPagar")}
              required
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Comisión</label>
            <input
              type="number"
              step="0.01"
              className="secInput"
              {...register("descuento")}
              defaultValue={0}
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Cédula</label>
            <input className="secInput" {...register("cedula")} required />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Nombres</label>
            <input className="secInput" {...register("firstName")} required />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Apellidos</label>
            <input className="secInput" {...register("lastName")} required />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Email</label>
            <input
              className="secInput"
              type="email"
              {...register("email")}
              required
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Celular</label>
            <input className="secInput" {...register("cellular")} required />
          </div>

          <button
            className="secBtnPrimary"
            type="submit"
            disabled={isSubmittingInscripcion}
          >
            {isSubmittingInscripcion ? "Registrando..." : "Registrar"}
          </button>
        </form>
      </section>
    );
  };

  /* =============================
     REGISTRAR PAGO
  ============================= */

  const renderPagos = () => {
    const totalPagadoActual = calcularTotalPagadoPorInscripcion(
      selectedInscripcionPago?.id,
    );

    const totalPrograma = Number(selectedInscripcionPago?.totalAPagar || 0);
    const comision = Number(selectedInscripcionPago?.descuento || 0);
    const total = totalPrograma + comision;
    const saldoActual = total - totalPagadoActual;

    return (
      <section className="secCard">
        <div className="secCardHeader">
          <h2 className="secTitle">💰 Registrar Pago</h2>
        </div>

        <form onSubmit={handleSubmit(submitPago)} className="secFilters">
          <div className="secInputGroup">
            <label className="vpLbl">Inscripción</label>
            <select
              className="secInput"
              value={selectedInscripcionId}
              {...register("inscripcionId")}
              onChange={(e) => {
                const value = normalizeId(e.target.value);
                setSelectedInscripcionId(value);
                setValue("inscripcionId", value, { shouldValidate: true });
              }}
              required
            >
              <option value="">Seleccione</option>
              {inscripcionesUnicas.map((i) => (
                <option key={normalizeId(i.id)} value={normalizeId(i.id)}>
                  {i.user?.firstName} {i.user?.lastName} -{" "}
                  {getProgramaNombre(i.programa)}
                </option>
              ))}
            </select>
          </div>

          {selectedInscripcionPago && (
            <>
              <div className="secInputGroup">
                <label className="vpLbl">Programa</label>
                <input
                  className="secInput"
                  value={getProgramaNombre(
                    selectedInscripcionPago.programasSuperiore?.nombre,
                  )}
                  readOnly
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Total a pagar</label>
                <input
                  className="secInput"
                  value={Number(
                    selectedInscripcionPago.totalAPagar || 0,
                  ).toFixed(2)}
                  readOnly
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Pagado actual</label>
                <input
                  className="secInput"
                  value={totalPagadoActual.toFixed(2)}
                  readOnly
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">Saldo actual</label>
                <input
                  className="secInput"
                  value={saldoActual.toFixed(2)}
                  readOnly
                />
              </div>
            </>
          )}

          <div className="secInputGroup">
            <label className="vpLbl">Entidad</label>

            <select
              {...register("entidad")}
              className="secInput vpMiniSelect"
              required
            >
              <option value="">Entidad</option>
              {[
                ...new Set(variables.map((v) => v.entidad).filter(Boolean)),
              ].map((entidad, i) => (
                <option key={i} value={entidad}>
                  {entidad}
                </option>
              ))}
            </select>

            <datalist id="listaEntidadesPrograma">
              {entidadesUnicas.map((entidad) => (
                <option key={entidad} value={entidad} />
              ))}
            </datalist>
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">ID de depósito</label>
            <input
              type="text"
              className="secInput"
              {...register("idDeposito")}
              required
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Valor pagado</label>
            <input
              type="number"
              step="0.01"
              className="secInput"
              {...register("valorPagado")}
              required
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Observación</label>
            <input
              type="text"
              className="secInput"
              {...register("observacion")}
              placeholder="Opcional"
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Comprobante</label>
            <input
              type="file"
              className="secInput"
              accept="image/*,.pdf"
              {...register("comprobante")}
              required
            />
          </div>

          <button
            className="secBtnPrimary"
            type="submit"
            disabled={isSubmittingPago}
          >
            {isSubmittingPago ? "Registrando..." : "Registrar y validar pago"}
          </button>
        </form>
      </section>
    );
  };

  /* =============================
     LISTA INSCRITOS
  ============================= */

  const renderLista = () => {
    return (
      <section className="secCard">
        <div className="secCardHeader">
          <h2 className="secTitle">📋 Lista Inscritos</h2>
        </div>
        <div className="secFilters vpFiltersRow">
          <div className="secInputGroup">
            <label className="vpLbl">Buscar</label>
            <input
              className="secInput"
              type="text"
              placeholder="Nombre, cédula, email, programa..."
              value={filtroBusquedaInscrito}
              onChange={(e) => setFiltroBusquedaInscrito(e.target.value)}
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Inscrito por</label>
            <select
              className="secInput"
              value={filtroInscritoPor}
              onChange={(e) => setFiltroInscritoPor(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="eduka">Eduka</option>
              <option value="asociado">Asociado</option>
            </select>
          </div>

          {/* <div className="secInputGroup">
            <label className="vpLbl">Estado</label>
            <select
              className="secInput"
              value={filtroEstadoInscrito}
              onChange={(e) => setFiltroEstadoInscrito(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="en_pagos">En pagos</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div> */}

          <div className="secInputGroup">
            <label className="vpLbl">Fecha inicio</label>
            <input
              className="secInput"
              type="date"
              value={filtroFechaInicioInscrito}
              onChange={(e) => setFiltroFechaInicioInscrito(e.target.value)}
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Fecha fin</label>
            <input
              className="secInput"
              type="date"
              value={filtroFechaFinInscrito}
              onChange={(e) => setFiltroFechaFinInscrito(e.target.value)}
            />
          </div>

          <button
            className="secBtnDanger"
            onClick={limpiarFiltrosInscritos}
            type="button"
          >
            ❌ Eliminar filtros
          </button>
        </div>

        <div className="secCount">Total: {inscripcionesUnicas.length}</div>

        <div className="secTableWrap">
          <table className="secTable">
            <thead>
              <tr>
                <th>Programa</th>
                <th>Inscrito Por</th>
                <th>Participante</th>
                <th>Cédula</th>
                <th>Email</th>
                <th>Total Programa</th>
                <th>Comisión</th>
                <th>Total</th>
                <th>Total Pagado</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {inscripcionesUnicas.map((i) => {
                const totalPrograma = Number(
                  i?.totalAPagar || getProgramaPrecio(i?.programa) || 0,
                );

                const comision = Number(
                  i?.descuento || getProgramaPrecio(i?.programa) || 0,
                );

                const total = totalPrograma + comision;

                const totalPagado = calcularTotalPagadoPorInscripcion(i?.id);
                const saldo = total - totalPagado;

                const estado =
                  saldo <= 0
                    ? "Pagado"
                    : totalPagado > 0
                      ? "En pagos"
                      : "Pendiente";

                return (
                  <tr key={normalizeId(i.id)}>
                    <td className="vpTdWrap">
                      {getProgramaNombre(i?.programasSuperiore?.nombre)}
                    </td>

                    <td className="vpTdWrap">
                      {getProgramaNombre(i?.inscritoPor)}
                    </td>

                    <td className="vpTdWrap">
                      {i.user?.firstName} {i.user?.lastName}
                    </td>

                    <td>{i.user?.cI || i.user?.cedula || "-"}</td>
                    <td>{i.user?.email || "-"}</td>

                    <td>
                      {editInscripcionId === i.id ? (
                        <input
                          type="number"
                          step="0.01"
                          className="vpMiniInput"
                          {...registerEdit("totalAPagar")}
                        />
                      ) : (
                        `$${Number(i?.totalAPagar || 0).toFixed(2)}`
                      )}
                    </td>

                    <td>
                      {editInscripcionId === i.id ? (
                        <input
                          type="number"
                          step="0.01"
                          className="vpMiniInput"
                          {...registerEdit("descuento")}
                        />
                      ) : (
                        `$${Number(i?.descuento || 0).toFixed(2)}`
                      )}
                    </td>

                    <td>${total.toFixed(2)}</td>
                    <td>${totalPagado.toFixed(2)}</td>

                    <td style={{ color: saldo > 0 ? "#c0392b" : "#2e7d32" }}>
                      ${saldo.toFixed(2)}
                    </td>

                    <td>
                      {estado === "Pagado" && "✅ Pagado"}
                      {estado === "En pagos" && "🟡 En pagos"}
                      {estado === "Pendiente" && "❌ Pendiente"}
                    </td>

                    <td className="td-btn">
                      <button
                        className="secBtnPrimary vpBtnSmall"
                        type="button"
                        onClick={() => {
                          const id = normalizeId(i.id);
                          setActiveSection("pagos");
                          setSelectedInscripcionId(id);
                          setValue("inscripcionId", id, {
                            shouldValidate: true,
                          });

                          if (contentRef.current) {
                            contentRef.current.scrollTo?.({
                              top: 0,
                              behavior: "smooth",
                            });
                          }
                        }}
                      >
                        Registrar pago
                      </button>

                      {editInscripcionId === i.id ? (
                        <>
                          <button
                            type="button"
                            className="vp-btn-save"
                            onClick={handleSubmitEdit((data) =>
                              guardarEdicionInscripcion(i.id, data),
                            )}
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            className="vp-btn-cancel"
                            onClick={cancelarEdicionInscripcion}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="vp-btn-edit"
                          onClick={() => iniciarEdicionInscripcion(i)}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  /* =============================
     LISTA PAGOS / FACTURACIÓN
  ============================= */

  const renderListaPagos = () => {
    return (
      <section className="secCard">
        <div className="secCardHeader">
          <h2 className="secTitle">💳 Lista de Pagos</h2>
        </div>

        <div className="secFilters vpFiltersRow">
          <div className="secInputGroup">
            <label className="vpLbl">Buscar</label>
            <input
              className="secInput"
              type="text"
              placeholder="Nombre, cédula, email, programa, entidad, depósito..."
              value={filtroBusquedaPago}
              onChange={(e) => setFiltroBusquedaPago(e.target.value)}
            />
          </div>

          {/* <div className="secInputGroup">
            <label className="vpLbl">Verificado</label>
            <select
              className="secInput"
              value={filtroVerificadoPago}
              onChange={(e) => setFiltroVerificadoPago(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Verificados</option>
              <option value="false">No verificados</option>
            </select>
          </div> */}

          <div className="secInputGroup">
            <label className="vpLbl">Fecha inicio</label>
            <input
              className="secInput"
              type="date"
              value={filtroFechaInicioPago}
              onChange={(e) => setFiltroFechaInicioPago(e.target.value)}
            />
          </div>

          <div className="secInputGroup">
            <label className="vpLbl">Fecha fin</label>
            <input
              className="secInput"
              type="date"
              value={filtroFechaFinPago}
              onChange={(e) => setFiltroFechaFinPago(e.target.value)}
            />
          </div>

          <button
            className="secBtnDanger"
            onClick={limpiarFiltrosPagos}
            type="button"
          >
            ❌ Eliminar filtros
          </button>
        </div>

        <div className="secCount">Total: {pagosFiltrados.length}</div>

        <div className="secTableWrap">
          <table className="secTable">
            <thead>
              <tr>
                <th
                  className="vpThSortable"
                  onClick={() => setOrdenFechaDesc((prev) => !prev)}
                  title="Ordenar por fecha"
                >
                  Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                </th>
                <th>Programa</th>
                <th>Participante</th>
                <th>Cédula</th>
                <th>Entidad</th>
                <th>ID Depósito</th>
                <th>Valor</th>
                <th>Comprobante</th>
                <th>Verificado</th>
                <th>Observación</th>
                <th>Factura</th>
                <th>Editor</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {pagosFiltrados.length > 0 ? (
                pagosFiltrados.map((p) => {
                  const factura = getFacturaUI(p);

                  return (
                    <tr key={normalizeId(p.id)}>
                      <td>
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="vpTdWrap">
                        {p?.inscripcion?.programasSuperiore?.nombre || "-"}
                      </td>

                      <td className="vpTdWrap">
                        {p?.inscripcion?.user?.firstName || ""}{" "}
                        {p?.inscripcion?.user?.lastName || ""}
                      </td>

                      <td>{p?.inscripcion?.user?.cI || "-"}</td>

                      <td className="vpTdWrap">
                        {editPagoId === p.id ? (
                          <select
                            {...registerEdit("entidad")}
                            className="secInput vpMiniSelect"
                            required
                          >
                            <option value="">Entidad</option>
                            {[
                              ...new Set(
                                variables.map((v) => v.entidad).filter(Boolean),
                              ),
                            ].map((entidad, i) => (
                              <option key={i} value={entidad}>
                                {entidad}
                              </option>
                            ))}
                          </select>
                        ) : (
                          p?.entidad || "-"
                        )}
                      </td>

                      <td>
                        {editPagoId === p.id ? (
                          <input
                            type="text"
                            className="vpMiniInput"
                            {...registerEdit("idDeposito")}
                          />
                        ) : (
                          p?.idDeposito || "-"
                        )}
                      </td>

                      <td>
                        {editPagoId === p.id ? (
                          <input
                            type="number"
                            step="0.01"
                            className="vpMiniInput"
                            {...registerEdit("valorPagado")}
                          />
                        ) : (
                          `$${Number(p?.valorPagado || 0).toFixed(2)}`
                        )}
                      </td>

                      <td>
                        {p?.pagoUrl ? (
                          <a
                            className="vpLink"
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
                        {p?.verificado ? "✅" : "❌"}
                      </td>

                      <td className="vpTdWrap">
                        {editPagoId === p.id ? (
                          <input
                            type="text"
                            className="vpMiniInput"
                            {...registerEdit("observacion")}
                          />
                        ) : (
                          p?.observacion || "-"
                        )}
                      </td>

                      <td>
                        {factura.type === "emitir" && (
                          <button
                            className="secBtnPrimary vpBtnSmall"
                            type="button"
                            disabled={
                              !p?.verificado ||
                              isEmitiendoFactura ||
                              editPagoId === p.id
                            }
                            title={
                              !p?.verificado
                                ? "El pago debe estar verificado"
                                : "Emitir factura"
                            }
                            onClick={() => emitirFacturaManual(p.id)}
                          >
                            {facturandoPagoId === p.id
                              ? "Facturando..."
                              : "Facturar"}{" "}
                          </button>
                        )}

                        {factura.type === "pendiente" && (
                          <span style={{ fontSize: 12 }}>🟡 Pendiente</span>
                        )}

                        {factura.type === "ver" &&
                          (factura.href ? (
                            <a
                              className="vpLink"
                              href={factura.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver factura
                            </a>
                          ) : (
                            <span style={{ fontSize: 12 }}>🟢 Autorizada</span>
                          ))}
                      </td>

                      <td className="vpTdWrap">{p?.usuarioEdicion || "-"}</td>

                      <td className="vpTdWrap2">
                        {editPagoId === p.id ? (
                          <>
                            <button
                              type="button"
                              className="vp-btn-save"
                              onClick={handleSubmitEdit((data) =>
                                guardarEdicionPago(p.id, data),
                              )}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="vp-btn-cancel"
                              onClick={cancelarEdicionPago}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="vp-btn-edit"
                            onClick={() => iniciarEdicionPago(p)}
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11">No hay pagos para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  /* =============================
     RENDER
  ============================= */

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return renderResumen();
      case "inscribir":
        return renderInscribir();
      case "pagos":
        return renderPagos();
      case "lista":
        return renderLista();
      case "listaPagos":
        return renderListaPagos();
      default:
        return null;
    }
  };

  return (
    <div className="secPage">
      <div
        className={`secOverlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div className="secShell vpShell">
        <button
          ref={hamburgerRef}
          className={`secHamburger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          type="button"
        >
          <span className="secHamburgerLine"></span>
          <span className="secHamburgerLine"></span>
          <span className="secHamburgerLine"></span>
        </button>

        <nav className={`secMenu ${menuOpen ? "open" : ""}`} ref={menuRef}>
          <div className="secMenuHeader">
            <img
              src="/images/eduka_sf.png"
              alt="Eduka"
              className="secMenuLogo"
            />
            <p className="secMenuSubtitle">Programas Superiores</p>
          </div>

          <button
            className={`secMenuBtn ${activeSection === "resumen" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("resumen");
              setMenuOpen(false);
            }}
            type="button"
          >
            📊 Resumen
          </button>

          <button
            className={`secMenuBtn ${activeSection === "inscribir" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("inscribir");
              setMenuOpen(false);
            }}
            type="button"
          >
            👤 Inscribir
          </button>

          <button
            className={`secMenuBtn ${activeSection === "pagos" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("pagos");
              setMenuOpen(false);
            }}
            type="button"
          >
            💰 Registrar pago
          </button>

          <button
            className={`secMenuBtn ${activeSection === "lista" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("lista");
              setMenuOpen(false);
            }}
            type="button"
          >
            📋 Lista inscritos
          </button>

          <button
            className={`secMenuBtn ${activeSection === "listaPagos" ? "active" : ""}`}
            onClick={() => {
              setActiveSection("listaPagos");
              setMenuOpen(false);
            }}
            type="button"
          >
            💳 Lista pagos
          </button>
        </nav>

        <main ref={contentRef} className="secContent vpContent">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProgramaSuperiorAdmin;
