import React, { useEffect, useState } from "react";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";
import "./styles/RegistroAlumnos.css";
import IsLoading from "../shared/isLoading";

const RegistroAlumnos = () => {
  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_COURSES = "/courses";
  const PATH_VARIABLES = "/variables";

  const dispatch = useDispatch();
  const { code } = useParams();

  const [idCourse, setIdCourse] = useState();
  const [course, getCourse, , , , , isLoading, , , ,] = useCrud();
  const [variables, getVariables] = useCrud();
  const [
    response,
    getInscripcion,
    postInscripcion,
    ,
    ,
    ,
    isLoading2,
    newInscripcion,
  ] = useCrud();
  const [usuarioExistente, setUsuarioExistente] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getInscripcion(PATH_INSCRIPCIONES);
    getCourse(PATH_COURSES);
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    if (newInscripcion) {
      dispatch(
        showAlert({
          message: `⚠️ Estimad@ ${newInscripcion.nombres} ${newInscripcion.apellidos}, se realizo tu inscripción correctamente`,
          alertType: 2,
        })
      );
    }
  }, [newInscripcion]);

  useEffect(() => {
    if (course.length && code) {
      const foundCourse = course.find((c) => c.sigla === code);
      if (foundCourse) setIdCourse(foundCourse.id);
    }
  }, [course, code]);

  const validarCedula = (cedula) => {
    // Eliminar todos los caracteres que no sean dígitos
    cedula = cedula.replace(/\D/g, ""); // \D = todo lo que NO sea dígito

    // Verificar que tenga exactamente 10 dígitos
    if (!/^\d{10}$/.test(cedula)) return false;

    const digitos = cedula.split("").map(Number);
    const digitoVerificador = digitos.pop();
    let suma = 0;

    for (let i = 0; i < digitos.length; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    return decenaSuperior - suma === digitoVerificador;
  };

  const capitalizeWords = (str) => {
    return str
      .trim() // elimina espacios al inicio y fin
      .split(/\s+/) // separa por uno o más espacios
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const submit = (data) => {
    // Ajustar nombres y apellidos
    const nombreFormateado = capitalizeWords(data.nombres);
    const apellidoFormateado = capitalizeWords(data.apellidos);

    // Ajustar email a minúsculas y quitar espacios al inicio/final
    const emailFormateado = data.email.trim().toLowerCase();
    const confirmEmailFormateado = data.confirmEmail.trim().toLowerCase();

    // Validaciones con datos formateados
    
    const cedulaLimpia = data.cedula.trim().replace(/\D/g, ""); 
    const isValidCedula = validarCedula(cedulaLimpia);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormateado);
    const celularLimpio = data.celular.replace(/\D/g, ""); // Elimina todo lo que no sea dígito
    const isValidCellular = /^09\d{8}$/.test(celularLimpio);

    if (!isValidCedula)
      return dispatch(
        showAlert({
          message: "⚠️ La cédula ingresada es incorrecta.",
          alertType: 1,
        })
      );
    if (!isValidEmail)
      return dispatch(
        showAlert({ message: "⚠️ El email es incorrecto.", alertType: 1 })
      );
    if (emailFormateado !== confirmEmailFormateado)
      return dispatch(
        showAlert({ message: "⚠️ Los correos no coinciden.", alertType: 1 })
      );
    if (!isValidCellular)
      return dispatch(
        showAlert({
          message:
            "⚠️ Celular inválido. Debe empezar con 09 y tener 10 dígitos.",
          alertType: 1,
        })
      );

    const yaRegistradoPorCedula = response?.find(
      (r) => r.cedula === data.cedula && r.courseId === idCourse
    );
    if (yaRegistradoPorCedula) {
      setUsuarioExistente(yaRegistradoPorCedula);
      return dispatch(
        showAlert({
          message: "⚠️ Ya estás inscrito en este curso.",
          alertType: 1,
        })
      );
    }

    const yaRegistradoPorEmail = response?.find(
      (r) => r.email === emailFormateado && r.courseId === idCourse
    );
    if (yaRegistradoPorEmail) {
      return dispatch(
        showAlert({
          message:
            "⚠️ Este correo ya fue usado para registrarse en este curso.",
          alertType: 1,
        })
      );
    }

    const body = {
      ...data,
      cedula: cedulaLimpia,
      nombres: nombreFormateado,
      apellidos: apellidoFormateado,
      email: emailFormateado,
      confirmEmail: confirmEmailFormateado,
      curso: code,
      courseId: idCourse,
    };

    postInscripcion(PATH_INSCRIPCIONES, body);
    reset();
  };

  const cursoActivo = course.find((c) => c.sigla === code);

  if (cursoActivo) {
    return (
      <div
        className="registro_container"
        style={{ backgroundImage: `url(/images/fondo_${code}.jpg)` }}
      >
        {isLoading2 && <IsLoading />}

        <div className="registro_wrapper">
          <div className="registro_left animate_slide_left">
            <form
              className="formulario_registro"
              onSubmit={handleSubmit(submit)}
            >
              <div className="form_column">
                <label>
                  Grado:
                  <select required {...register("grado")}>
                    <option value="">Seleccione una opción</option>
                    {[
                      ...new Set(variables.map((v) => v.grado).filter(Boolean)),
                    ].map((grado, i) => (
                      <option key={i} value={grado}>
                        {grado}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Nombres:
                  <input
                    placeholder="Nombres completos (tildes y ñ si aplica)"
                    required
                    {...register("nombres")}
                  />
                </label>
                <label>
                  Apellidos:
                  <input
                    placeholder="Apellidos completos (tildes y ñ si aplica)"
                    required
                    {...register("apellidos")}
                  />
                </label>

                <label>
                  Cédula:
                  <input required {...register("cedula")} />
                </label>

                <label>
                  Email:
                  <input type="email" required {...register("email")} />
                </label>
                <label>
                  Confirmar Email:
                  <input type="email" required {...register("confirmEmail")} />
                </label>
              </div>
              <div className="form_column">
                <label>
                  Celular:
                  <input required {...register("celular")} />
                </label>

                <label>
                  Eje Policial:
                  <select required {...register("subsistema")}>
                    <option value="">Seleccione una opción</option>
                    {[
                      ...new Set(
                        variables.map((v) => v.subsistema).filter(Boolean)
                      ),
                    ].map((subsistema, i) => (
                      <option key={i} value={subsistema}>
                        {subsistema}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form_check_container">
                  <label className="form_check_label">
                    Acepto recibir correos electrónicos con información sobre
                    los cursos y otros contenidos relacionados. Entiendo que mis
                    datos serán tratados de acuerdo con la política de
                    privacidad y que puedo dejar de recibirlos en cualquier
                    momento.
                    <input
                      type="checkbox"
                      {...register("aceptacion", {
                        validate: (value) =>
                          value === true ||
                          "Debes aceptar la política para continuar.",
                      })}
                    />
                  </label>
                  {errors.aceptacion && (
                    <p className="form_error">{errors.aceptacion.message}</p>
                  )}
                </div>

                <div className="form_button_inscripcion">
                  <button className="btn_inscripcion" type="submit">
                    🚀 Inscribirme
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="registro_right animate_slide_right">
            {cursoActivo && (
              <div className="curso_fondo">
                <div className="curso_overlay">
                  <h2>{cursoActivo.nombre}</h2>
                  <p>{cursoActivo.objetivo}</p>
                </div>
                <div
                  className="curso_imagen"
                  style={{
                    backgroundImage: `url(/images/${code}.jpg)`,
                  }}
                />
              </div>
            )}
          </div>

          {usuarioExistente && (
            <div className="usuario_existente">
              <h3>Ya estás registrado en este curso:</h3>
              <p>
                <strong>Nombre:</strong> {usuarioExistente.nombres}
              </p>
              <p>
                <strong>Email:</strong> {usuarioExistente.email}
              </p>
              <p>
                <strong>Celular:</strong> {usuarioExistente.celular}
              </p>
              <button onClick={() => setUsuarioExistente(null)}>Cerrar</button>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="registro_container curso_no_encontrado">
      {isLoading && <IsLoading />}

      <div className="mensaje_curso_caja">
        <h2>❌ Curso no disponible</h2>
        <p>
          El curso con el código <strong>{code}</strong> no se encuentra
          disponible o no existe en nuestra base de datos.
        </p>
        <p>Por favor verifica el enlace o contacta con el administrador.</p>
      </div>
    </div>
  );
};
export default RegistroAlumnos;
