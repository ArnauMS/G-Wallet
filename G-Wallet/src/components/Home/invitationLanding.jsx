// Router
import { Link, useSearchParams, useNavigate } from "react-router-dom";
// Styles
import "./home.css";
// images
import HomeI from "../../assets/home.svg";
import Wave from "../../assets/wave.svg";
import Logo from "../../assets/logo.png";

import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/index.js";

import useAuth from "../../hooks/useAuth";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const InvitationLanding = () => {
  const { t } = useTranslation();
  let [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  let sendResponse = (resp) => {
    httpsCallable(
      functions,
      "manageInvite"
    )({
      status: resp,
      group: searchParams.get("group"),
      token: searchParams.get("token"),
      user: user,
    });
    navigate("/dashboard");
  };
  return (
    <I18nextProvider i18n={i18n}>
      <div className="home">
        <Link to={"/dashboard"} className="logo">
          <img src={Logo} alt="Logo from G-Wallet" />
        </Link>
        <div className="img">
          <img src={HomeI} alt="Home image" />
        </div>
        <div className="container">
          <h1> {t("invitationLanding.titulo")} </h1>
          <h3> {t("invitationLanding.subtitulo")} </h3>
          <button onClick={() => sendResponse(1)} className="btn">
            {" "}
            {t("invitationLanding.aceptar")}{" "}
          </button>
          <button onClick={() => sendResponse(0)} className="btn deny">
            {" "}
            {t("invitationLanding.rechazar")}{" "}
          </button>
        </div>
        <div className="wave">
          <img src={Wave} alt="Wave Background image" />
        </div>
      </div>
    </I18nextProvider>
  );
};

export default InvitationLanding;
