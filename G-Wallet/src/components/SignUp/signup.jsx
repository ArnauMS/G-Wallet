// React
import { useState, useEffect } from "react";
// Redux
import { useDispatch } from "react-redux";
import { signUp, registerGoogle } from "../../redux/slices/authSlice";
// Router
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
// Hooks
import useAuth from "../../hooks/useAuth";
// Components
import Loading from "../Loading/loading";
// Styles
import "./signUp.css";
// Images
import Logo from "../../assets/logo.png";
import Auth from "../../assets/auth2.svg";
import Google from "../../assets/google.svg";
import EyeShow from "../../assets/show_pass.svg";
import EyeHide from "../../assets/hide_pass.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Signup = () => {
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
  // Recuperar la variable error de nuestro estado global de auth
  const { user, isLoading, error } = useAuth();

  // Variables email y password de nuestro estado del componente
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Función para registrar el usuario en caso de enviar el formulario
  const handleSignup = (e) => {
    e.preventDefault(); // Evita enviar y recargar los datos al hacer submit
    dispatch(signUp(values.email, values.password, values.name));
  };

  // Función para cambiar los valores de email y password cuando el valor del input sea modificado
  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setValues({ ...values, [name]: value });
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

  const handleGoogle = (e) => {
    e.preventDefault();
    dispatch(registerGoogle());
  };

  if (isLoading) {
    return <Loading />;
  }

  if (user) {
    navigate("/dashboard");
  }

  return (
    <I18nextProvider i18n={i18n}>
      <div className="signUpPage">
        <div className="left">
          <Link to={"/"} className="logo">
            <img src={Logo} alt="Logo image from G-Wallet" />
            <h1> {t("signup.titulo")} </h1>
          </Link>
          <div className="auth">
            <img src={Auth} alt="Image about auth account" />
          </div>
        </div>
        <div className="right">
          <div className="title"> {t("signup.crearCuenta")} </div>
          <div className="googleButton" onClick={handleGoogle}>
            <img src={Google} alt="Google icon to sign up" />
            <p> {t("signup.google")} </p>
          </div>
          <div className="divide">
            <div></div>
            <p> {t("signup.o")} </p>
            <div></div>
          </div>
          <div className="content">
            <form onSubmit={handleSignup}>
              <div className="input">
                <input
                  type="text"
                  placeholder={t("signup.placeholderNombre")}
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                />
              </div>
              <div className="input">
                <input
                  type="text"
                  placeholder={t("signup.placeholderEmail")}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                />
              </div>
              <div className="input">
                <input
                  type={show}
                  placeholder={t("signup.placeholderContra")}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                />
                <Eye />
              </div>
              {error && <p className="error"> Upss...{error} </p>}
              <div className="input">
                <input type="submit" value={t("signup.submit")} />
              </div>
            </form>
            <div className="info">
              <p>
                {t("signup.registrado")}{" "}
                <Link to={"/login"}>{t("signup.login")}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default Signup;
