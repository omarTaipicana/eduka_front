import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Login.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import IsLoading from "../../components/shared/isLoading";
import useCrud from "../../hooks/useCrud";

const Login = () => {
  const token = localStorage.getItem("token");
  const PATH_SENPLADES = "/senplades";
  const PATH_VARIABLES = "/variables";
  const [prevUser, setPrevUser] = useState(null);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [isInfoComplete, setIsInfoComplete] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userEdit, setUserEdit] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [formReady, setFormReady] = useState(false);
  const [firstChargeVar, setFirstChargeVar] = useState(false);
  const [senplades, getSenplades, , , , ,] = useCrud();
  const [cantonesOption, setCantonesOption] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedGenero, setSelectedGenero] = useState("");
  const [variables, getVariables, , , , ,] = useCrud();

  const [
    registerUser,
    updateUser,
    loginUser,
    loggedUser,
    verifyUser,
    userRegister,
    isLoading,
    error,
    verified,
    sendEmail,
    userResetPassword,
    changePassword,
    userUpdate,
    userLogged,
    setUserLogged,
  ] = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    value,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (token) {
      loggedUser();
    }
  }, [token]);

  const senpladesVal = senplades ? senplades : [];

  const obtenerCantonesPorProvincia = (provincia) => {
    return senpladesVal.filter((item) => item.provincia === provincia);
  };

  const handleProvinciaChange = (selected) => {
    setSelectedProvincia(selected);
    const cantonesByProvinca = obtenerCantonesPorProvincia(selected);
    setCantonesOption(cantonesByProvinca);
  };

  const handleLogout = () => {
    if (userLogged) {
      const capitalizeWord = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

      const firstName = capitalizeWord(userLogged?.firstName);
      const lastName = capitalizeWord(userLogged?.lastName);

      dispatch(
        showAlert({
          message: `⚠️ Hasta pronto ${firstName} ${lastName}, te esperamos.`,
          alertType: 4,
        })
      );
    }
    localStorage.removeItem("token");
    setUserLogged();
    reset({
      email: "",
      password: "",
    });
    navigate("/");
  };

  useEffect(() => {
    if (error) {
      dispatch(
        showAlert({
          message: `⚠️ ${error.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error]);

  useEffect(() => {
    if (userLogged && prevUser === null && isNewLogin) {
      const capitalizeWord = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

      const firstName = capitalizeWord(userLogged?.firstName);
      const lastName = capitalizeWord(userLogged?.lastName);

      dispatch(
        showAlert({
          message: `⚠️ Bienvenido ${firstName} ${lastName} a EDUKA, tu Plataforma Educativa`,
          alertType: 2,
        })
      );
      setPrevUser(userLogged);
      setIsNewLogin(false);
      navigate("/home");
    }
  }, [userLogged, prevUser, isNewLogin, dispatch]);

  useEffect(() => {
    if (userUpdate) {
      const capitalizeWord = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

      const firstName = capitalizeWord(userLogged?.firstName);
      const lastName = capitalizeWord(userLogged?.lastName);

      loggedUser();
      dispatch(
        showAlert({
          message: `⚠️ Estimado ${firstName} ${lastName}, se actualizo tu información correctamente`,
          alertType: 2,
        })
      );
    }
  }, [userUpdate]);

  useEffect(() => {
    if (userLogged && senplades) {
      setSelectedProvincia(userLogged.province || "");
      setCantonesOption(obtenerCantonesPorProvincia(userLogged.province));
      setSelectedCanton(userLogged.city || "");
      setSelectedGenero(userLogged.genre || "");

      setFormReady(true);
    }
  }, [userLogged, senplades]);

  useEffect(() => {
    if (formReady) {
      reset({
        email: userLogged.email,
        dateBirth: userLogged.dateBirth,
        cI: userLogged.cI,
        cellular: userLogged.cellular,
        province: selectedProvincia,
        city: selectedCanton,
        genre: selectedGenero,
      });

      setFormReady(false);
      setFirstChargeVar(true);
    }
  }, [formReady, userEdit]);

  const submit = (data) => {
    loginUser(data);
    setIsNewLogin(true);
  };

  const submitUpdate = (data) => {
    if (
      data?.dateBirth &&
      data?.cI &&
      data?.cellular &&
      data?.province &&
      data?.city &&
      data?.genre
    ) {
      setIsInfoComplete(true);
    } else {
      setIsNewLogin(false);
      setIsInfoComplete(false);
    }
    updateUser(data, userLogged.id);
    setUserEdit(false);
  };

  useEffect(() => {
    if (userLogged) {
      getSenplades(PATH_SENPLADES);
      getVariables(PATH_VARIABLES);
    }

    if (
      userLogged?.dateBirth &&
      userLogged?.cI &&
      userLogged?.cellular &&
      userLogged?.province &&
      userLogged?.city &&
      userLogged?.genre
    ) {
      setIsInfoComplete(true);
    } else {
      setIsInfoComplete(false);
    }
  }, [firstChargeVar]);

  return (
    <div className="contenedor">
      {isLoading && <IsLoading />}

      <section className="content_background">
        {userLogged ? (
          <section className="user__info__content">
            <h2 className="title__user__info">{`Hola ${userLogged.firstName} ${userLogged.lastName}`}</h2>
            <form
              onSubmit={handleSubmit(submitUpdate)}
              className="form__user__info"
            >
              <article className="form__user__seccion">
                <label className="label__user__info">
                  <span className="span__user__info">Email: </span>
                  <input
                    readOnly
                    style={{
                      border: "none",
                    }}
                    required
                    {...register("email")}
                    className="input__form__info"
                    type="text"
                  />
                </label>
                <label className="label__user__info">
                  <span className="span__user__info">
                    Fecha de Nacimiento:{" "}
                  </span>
                  <input
                    readOnly={!userEdit}
                    style={{
                      border: userEdit ? "2px solid #ccc" : "none",
                    }}
                    required
                    {...register("dateBirth", {
                      setValueAs: (value) => (value === "" ? null : value),
                    })}
                    className="input__form__info"
                    type="date"
                  />
                </label>
                <label className="label__user__info">
                  <span className="span__user__info">Número de Cédula: </span>
                  <input
                    readOnly={!userEdit}
                    style={{
                      border: userEdit ? "2px solid #ccc" : "none",
                    }}
                    required
                    {...register("cI")}
                    className="input__form__info"
                    type="text"
                  />
                </label>
                <label className="label__user__info">
                  <span className="span__user__info">Número de Celular: </span>
                  <input
                    readOnly={!userEdit}
                    style={{
                      border: userEdit ? "2px solid #ccc" : "none",
                    }}
                    required
                    {...register("cellular")}
                    className="input__form__info"
                    type="text"
                  />
                </label>
              </article>

              <article className="form__user__seccion">
                <label className="label__user__info">
                  <span className="span__user__info">Provincia:</span>
                  {!userEdit ? (
                    <input
                      className="input__form__info"
                      readOnly={!userEdit}
                      {...register("province")}
                      style={{
                        border: "none",
                      }}
                    />
                  ) : (
                    <select
                      style={{
                        border: "2px solid #ccc",
                      }}
                      {...register("province")}
                      className="input__form__info"
                      value={selectedProvincia}
                      onChange={(e) => handleProvinciaChange(e.target.value)}
                    >
                      <option value="">Seleccione la Provincia</option>
                      {[...new Set(senplades?.map((e) => e.provincia))].map(
                        (provincia) => (
                          <option key={provincia} value={provincia}>
                            {provincia}
                          </option>
                        )
                      )}
                    </select>
                  )}
                </label>

                <label className="label__user__info">
                  <span className="span__user__info">Ciudad:</span>
                  {!userEdit ? (
                    <input
                      className="input__form__info"
                      readOnly={!userEdit}
                      {...register("city")}
                      style={{
                        border: "none",
                      }}
                    />
                  ) : (
                    <select
                      style={{
                        border: "2px solid #ccc",
                      }}
                      {...register("city")}
                      className="input__form__info"
                      value={selectedCanton}
                      onChange={(e) => setSelectedCanton(e.target.value)}
                    >
                      <option value="">Seleccione la Ciudad</option>
                      {[...new Set(cantonesOption?.map((e) => e.canton))].map(
                        (canton) => (
                          <option key={canton} value={canton}>
                            {canton}
                          </option>
                        )
                      )}
                    </select>
                  )}
                </label>

                <label className="label__user__info">
                  <span className="span__user__info">Género:</span>
                  {!userEdit ? (
                    <input
                      className="input__form__info"
                      readOnly={!userEdit}
                      {...register("genre")}
                      style={{
                        border: "none",
                      }}
                    />
                  ) : (
                    <select
                      style={{
                        border: "2px solid #ccc",
                      }}
                      {...register("genre")}
                      className="input__form__info"
                      value={selectedGenero}
                      onChange={(e) => setSelectedGenero(e.target.value)}
                    >
                      <option value="">Seleccione su Género</option>
                      {variables
                        ?.filter((e) => e.genero)
                        .map((genero) => (
                          <option key={genero.id} value={genero.genero}>
                            {genero.genero}
                          </option>
                        ))}
                    </select>
                  )}
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (!userEdit) {
                      setUserEdit(true);
                    } else {
                      handleSubmit(submitUpdate)();
                    }
                  }}
                  className="btn__logout__user"
                >
                  {userEdit
                    ? "Actualizar"
                    : isInfoComplete
                    ? "Editar perfil"
                    : "Completar Perfil"}
                </button>
              </article>
            </form>

            <button
              type="button"
              onClick={handleLogout}
              className="btn__logout__user__cerrar__sesion"
            >
              Cerrar la sesión
            </button>
          </section>
        ) : (
          <div>
            <section className="iser__login__content">
              <h2 className="login__title">Iniciar Sesión</h2>
              <form className="form__login" onSubmit={handleSubmit(submit)}>
                <label className="label__form__login">
                  <span className="span__form__login">Email: </span>
                  <input
                    required
                    {...register("email")}
                    className="input__form__login"
                    type="text"
                  />
                </label>

                <label className="label__form__login">
                  <span className="span__form__login">Contraseña: </span>
                  <div className="input__form__login__password">
                    <input
                      className="input__form__login__password"
                      required
                      {...register("password")}
                      type={hidePassword ? "password" : "text"}
                    />{" "}
                    <div>
                      <img
                        className="img__show"
                        onClick={() => setHidePassword(!hidePassword)}
                        src={`../../../${hidePassword ? "show" : "hide"}.png`}
                        alt=""
                      />
                    </div>
                  </div>
                </label>
                <Link to="/reset_password">Olvido su contraseña</Link>

                <button className="btn__form__login">INICIAR</button>
              </form>
            </section>
          </div>
        )}
      </section>
    </div>
  );
};

export default Login;
