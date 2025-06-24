import React, { useEffect, useState } from "react";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";
import "./styles/RegistroPagos.css";

export const RegistroPagos = () => {
  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";

  const dispatch = useDispatch();
  const { code } = useParams();

  const [response, getInscripcion] = useCrud();
  const [courses, getCourse] = useCrud();
  const [usuario, setUsuario] = useState(null);
  const [cursoActual, setCursoActual] = useState(null);
  const [total, setTotal] = useState(26);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      certificado: true,
      moneda: false,
      distintivo: false,
    },
  });

  const watchExtras = watch(["moneda", "distintivo"]);

  useEffect(() => {
    getInscripcion(PATH_INSCRIPCIONES);
    getCourse(PATH_COURSES);
  }, []);

  useEffect(() => {
    let precio = 26;
    if (watchExtras[0]) precio += 10;
    if (watchExtras[1]) precio += 5;
    setTotal(precio);
  }, [watchExtras]);

  const buscarCedula = (data) => {
    const encontrado = response?.find(
      (r) => r.cedula === data.cedula && r.curso === code
    );
    if (!encontrado) {
      dispatch(
        showAlert({
          message: "⚠️ No se encontró una inscripción con esa cédula.",
          alertType: 1,
        })
      );
      return;
    }
    setUsuario(encontrado);
    const curso = courses?.find((c) => c.id === encontrado.courseId);
    setCursoActual(curso);
  };

  const confirmar = (data) => {
    dispatch(
      showAlert({
        message: `✅ Información confirmada por ${usuario.nombres} ${usuario.apellidos}`,
        alertType: 2,
      })
    );
    reset();
    setUsuario(null);
    setCursoActual(null);
    setTotal(26);
  };

  return (
    <div
      className="registro_container"
      style={{ backgroundImage: `url(/images/fondo_${code}.jpg)` }}
    >
      <div className="registro_wrapper medio_alto">
        <div className="registro_left animate_slide_left">
          {!usuario ? (
            <form className="formulario_registro" onSubmit={handleSubmit(buscarCedula)}>
              <div className="form_column">
                <div className="felicitacion_mensaje">
                  <h2>🎉 ¡Felicitaciones por culminar tu curso!</h2>
                  <p>Ahora puedes solicitar tu certificado y otros reconocimientos disponibles.</p>
                </div>
                <label>
                  Ingrese su cédula:
                  <input required {...register("cedula")} />
                </label>
                <div className="form_button">
                  <button type="submit">🔍 Buscar</button>
                </div>
              </div>
            </form>
          ) : (
            <form className="formulario_registro doble_columna" onSubmit={handleSubmit(confirmar)}>
              <div className="form_column datos_usuario">
                {cursoActual && <h2>🎓 {cursoActual.nombre}</h2>}
                <p><strong>Nombres:</strong> {usuario.nombres}</p>
                <p><strong>Apellidos:</strong> {usuario.apellidos}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Celular:</strong> {usuario.celular}</p>
                <p><strong>Cédula:</strong> {usuario.cedula}</p>
              </div>

              <div className="form_column inputs_pago">
                <label>
                  Suba su comprobante (PDF o imagen):
                  <input type="file" required {...register("archivo")} />
                </label>

                <label>
                  Certificado ($26) [obligatorio]
                  <input type="checkbox" checked disabled {...register("certificado")} />
                </label>
                <label>
                  Moneda conmemorativa (+$10)
                  <input type="checkbox" {...register("moneda")} />
                </label>
                <label>
                  Distintivo (+$5)
                  <input type="checkbox" {...register("distintivo")} />
                </label>

                <p><strong>Total a pagar:</strong> ${total}</p>

                <label>
                  Valor depositado:
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("valorDepositado", {
                      required: "Debes ingresar el valor depositado.",
                    })}
                  />
                </label>
                {errors.valorDepositado && (
                  <p className="form_error">{errors.valorDepositado.message}</p>
                )}

                <div className="form_check_container">
                  <label className="form_check_label">
                    Confirmo que la información mostrada es correcta y autorizo su uso para la emisión del certificado.
                    <input
                      type="checkbox"
                      {...register("confirmacion", {
                        validate: (value) =>
                          value === true || "Debes aceptar para continuar.",
                      })}
                    />
                  </label>
                  {errors.confirmacion && (
                    <p className="form_error">{errors.confirmacion.message}</p>
                  )}
                </div>

                <div className="form_button">
                  <button type="submit">✅ Confirmar</button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="registro_right animate_slide_right">
          <div className="curso_fondo_pago">
            <div
              className="curso_imagen"
              style={{ backgroundImage: `url(/images/pago.png)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
