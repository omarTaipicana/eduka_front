import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Footer.css";

const Footer = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const currentPage = location.pathname.split("/")[1];

  return (
    <div>
      <section>
        <ul className="ul_footer">
          <li className="li_footer">
            <a href="tel:+593983029083" className="link_footer">
              <img
                className="img_footer"
                src="../../../smartphone.png"
                alt="Llamar"
              />
              <span className="span_footer">+593983029083</span>
            </a>
          </li>
          <li className="li_footer">
            <a
              href="mailto:eduka.corporacioneducativa@gmail.com"
              className="link_footer"
            >
              <img
                className="img_footer"
                src="../../../mensaje.png"
                alt="Correo"
              />
              <span className="span_footer">
                eduka.corporacioneducativa@gmail.com
              </span>
            </a>
          </li>
          <li className="li_footer">
            <a
              href="https://www.google.com/maps?q=Mitad+del+Mundo,+Quito,+Ecuador"
              target="_blank"
              rel="noopener noreferrer"
              className="link_footer"
            >
              <img
                className="img_footer"
                src="../../../location.png"
                alt="Ubicación"
              />
              <span className="span_footer">
                Mitad del Mundo - Quito, Ecuador
              </span>
            </a>
          </li>
          <li className="li_footer_icon">
            <a
              href="https://wa.me/593983029083"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../whatsapp2.png"
                alt="WhatsApp"
              />
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../tik-tok.png"
                alt="TikTok"
              />
            </a>
            <a
              href="https://web.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img_footer"
                src="../../../facebook.png"
                alt="Facebook"
              />
            </a>
          </li>
          <li className="li_footer">
            <span className="span_footer">Copyright</span>
            <img className="img_footer_c" src="../../../copyright.png" alt="" />
            <span className="span_footer">EDUKA</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Footer;
