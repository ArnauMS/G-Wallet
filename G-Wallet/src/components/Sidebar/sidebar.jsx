// React
import { useState } from "react";
// Redux
import { useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
// Router
import { Link } from "react-router-dom";
// Styles
import "./sidebar.css";
// Images
import Logo from "../../assets/logo.png";
import Home from "../../assets/home_icon.svg";
import Groups from "../../assets/groups.svg";
import Individual from "../../assets/individual.svg";
import Perfil from "../../assets/perfil.svg";
import Logout from "../../assets/logout.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Sidebar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const LogoutFunction = () => {
    dispatch(logout());
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen((open) => !open);
  };

  return (
    <>
      <I18nextProvider i18n={i18n}>
        <div
          className={open ? "hamburguer open" : "hamburguer"}
          onClick={handleOpen}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className={open ? "sidebar" : "sidebar closed"}>
          <Link to={"/dashboard"} className="logo">
            <img src={Logo} alt="Logo from G-Wallet" />
            <h1> {t('sidebar.titulo')} </h1>
          </Link>
          <div className="opcions">
            <Link className="link" to={"/dashboard"} onClick={handleOpen}>
              <img src={Home} alt="Home" />
              <h1> {t('sidebar.inicio')} </h1>
            </Link>
            <Link className="link" to={"/dashboard/groups"} onClick={handleOpen}>
              <img src={Groups} alt="Groups" />
              <h1> {t('sidebar.grupos')} </h1>
            </Link>
            <Link
              className="link"
              to={"/dashboard/personal"}
              onClick={handleOpen}
            >
              <img src={Individual} alt="Individual" />
              <h1> {t('sidebar.personal')} </h1>
            </Link>
            <Link className="link" to={"/dashboard/profile"} onClick={handleOpen}>
              <img src={Perfil} alt="Perfil" />
              <h1> {t('sidebar.perfil')} </h1>
            </Link>
          </div>
          <div className="logout" onClick={LogoutFunction}>
            <img src={Logout} alt="Logout" />
            <h1> {t('sidebar.salir')} </h1>
          </div>
        </div>
      </I18nextProvider>
    </>
  );
};

export default Sidebar;
