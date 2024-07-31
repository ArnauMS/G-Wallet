// Router
import { Link } from "react-router-dom";
// Styles
import "./home.css";
// images
import HomeI from "../../assets/home.svg";
import Wave from "../../assets/wave.svg";
import Logo from "../../assets/logo.png";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Home = () => {
  const { t } = useTranslation();
  return (
    <I18nextProvider i18n={i18n}>
      <div className="home">
        <Link to={"/"} className="logo">
          <img src={Logo} alt="Logo from G-Wallet" />
        </Link>
        <div className="img">
          <img src={HomeI} alt="Home image" />
        </div>
        <div className="container">
          <h1> {t('home.titulo')} </h1>
          <h3> {t('home.subtitulo')} </h3>
          <Link to={"/login"} className="btn">
            {" "}
            {t('home.login')}{" "}
          </Link>
          <div className="divide">
            <div></div>
            <p> {t('home.o')} </p>
            <div></div>
          </div>
          <Link to={"/sign-up"} className="btn register">
            {" "}
            {t('home.registro')}{" "}
          </Link>
        </div>
        <div className="wave">
          <img src={Wave} alt="Wave Background image" />
        </div>
      </div>
    </I18nextProvider>
  );
};

export default Home;
