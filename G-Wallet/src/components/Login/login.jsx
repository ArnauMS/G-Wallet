// React
import { useState, useEffect } from "react";
// Redux
import { useDispatch } from "react-redux";
import { login, loginGoogle } from "../../redux/slices/authSlice";
// Router
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
// Hooks
import useAuth from "../../hooks/useAuth";
// Components
import Loading from "../Loading/loading";
// Styles
import "./login.css";
// Images
import Logo from "../../assets/logo.png";
import Auth from "../../assets/auth.svg";
import Google from "../../assets/google.svg";
import EyeShow from "../../assets/show_pass.svg";
import EyeHide from "../../assets/hide_pass.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Login = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (location.state == "invite") {
        navigate(-1);
      } else {
        navigate("/dashboard");
      }
    }
  });

  // Poder usar dispacth para enviar acciones a nuestro estado global
  const dispatch = useDispatch();

  // Recuperar la variable error de nuestro estado gloab de auth
  const { user, isLoading, error } = useAuth();

  // Variables email y password de nuestro estado del componente
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  // Función para iniciar sesión en caso de enviar el formulario
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login(values.email, values.password));
  };

  // Función para cambiar los valores de email y password cuando el valor del input sea modificado
  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setValues({ ...values, [name]: value });
  };

  //Función para iniciar sesión a traves de Google al pulsar el boton correspondiente
  const handleGoogle = (e) => {
    e.preventDefault();
    dispatch(loginGoogle());
  };

  // Variable para controlar la visualización de la contraseña
  const [show, setShow] = useState("password");

  // Función para cambiar la visualización de la contraseña
  const handlePassword = () => {
    if (show == "password") {
      setShow("string");
    } else {
      setShow("password");
    }
  };

  // Creamos el componente del hijo con un renderizado condicional
  const Eye = () => {
    return (
      <>
        <div className="eye" onClick={handlePassword}>
          {show == "string" ? (
            <img
              src={EyeHide}
              className="hide"
              alt="Icon for hide the password"
            />
          ) : (
            <img src={EyeShow} alt="Icon for hide the password" />
          )}
        </div>
      </>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (user) {
    navigate("/dashboard");
  }

  return (
    <I18nextProvider i18n={i18n}>
      <div className="loginPage">
        <div className="left">
          <Link to={"/"} className="logo">
            <img src={Logo} alt="Logo image from G-Wallet" />
            <h1> {t("login.titulo")} </h1>
          </Link>
          <div className="auth">
            <img src={Auth} alt="Image about auth account" />
          </div>
        </div>
        <div className="right">
          <div className="title"> {t("login.bienvenido")} </div>
          <div className="googleButton" onClick={handleGoogle}>
            <img src={Google} alt="Google icon to sign up" />
            <p> {t("login.google")} </p>
          </div>
          <div className="divide">
            <div></div>
            <p> {t("login.o")} </p>
            <div></div>
          </div>
          <div className="content">
            <form onSubmit={handleLogin}>
              <div className="input">
                <input
                  type="text"
                  placeholder={t("login.email")}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                />
              </div>
              <div className="input">
                <input
                  type={show}
                  placeholder={t("login.contra")}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                />
                <Eye />
              </div>
              {error && <p className="error"> Upss...{error} </p>}
              <div className="input">
                <input type="submit" value={t("login.submit")} />
              </div>
            </form>
            <div className="info">
              <p>
                {t("login.noRegistrado")}{" "}
                <Link to={"/sign-up"}>{t("login.crearCuenta")}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default Login;
