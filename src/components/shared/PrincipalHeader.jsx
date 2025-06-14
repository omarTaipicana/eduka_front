import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";

const PrincipalHeader = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      loggedUser();
    }
  }, [token]);

  const handleLogout = () => {
    if (user) {
      const capitalizeWord = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

      const firstName = capitalizeWord(user?.firstName);
      const lastName = capitalizeWord(user?.lastName);

      dispatch(
        showAlert({
          message: `⚠️ Hasta pronto ${firstName} ${lastName}, te esperamos.`,
          alertType: 4,
        })
      );
    }
    localStorage.removeItem("token");
    setUserLogged();
    navigate("/");
  };

  // Toggle menú hamburguesa
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cerrar menú al click en enlace
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header_nav">
      <section className="principal__header__section">
        <Link to="/" onClick={closeMenu}>
          <img
            src="/images/eduka_sf.png"
            alt="Logo Eduka"
            className="logo_navbar"
          />
        </Link>

        {/* Botón hamburguesa */}
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menú de enlaces */}
        <nav className={`nav_links ${menuOpen ? "open" : ""}`}>
          <Link to="/home" onClick={closeMenu}>Home</Link>
          {!token && <Link to="/register" onClick={closeMenu}>Register</Link>}
          {!token && <Link to="/login" onClick={closeMenu}>Login</Link>}
          {token && (
            <>
              <Link to="/login" onClick={closeMenu}>
                <img
                  className="user__icon"
                  src="../../../user.png"
                  alt="User Icon"
                />
              </Link>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="logout__button">
                Salir
              </button>
            </>
          )}
        </nav>
      </section>
    </header>
  );
};

export default PrincipalHeader;
