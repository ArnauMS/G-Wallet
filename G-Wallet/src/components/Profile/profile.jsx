// React
import React, { useState, useEffect } from "react";
// Hooks
import useAuth from "../../hooks/useAuth";
// Style
import "./profile.css";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";
// Firebase
import { firestore } from "../../firebase/index";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [modalVisibleHelp, setModalVisibleHelp] = useState(false);
  const [modalVisiblePrivacy, setModalVisiblePrivacy] = useState(false);
  const [modalVisibleTerms, setModalVisibleTerms] = useState(false);
  const [modalVisibleContact, setModalVisibleContact] = useState(false);
  const [newUser, setUserInfo] = useState({});

  const changeLanguage = (e) => {
    const idioma = e.target.value;
    i18n.changeLanguage(idioma);
  };

  const handleButtonClickHelp = () => {
    setModalVisibleHelp(true);
  };

  const handleButtonClickPrivacy = () => {
    setModalVisiblePrivacy(true);
  };

  const handleButtonClickTerms = () => {
    setModalVisibleTerms(true);
  };

  const handleButtonClickContact = () => {
    setModalVisibleContact(true);
  };

  const getInformation = async () => {
    try {
      const docRef = doc(firestore, "Usuarios", user);
      const userInfo = await getDoc(docRef);
      let data = {};
      if (userInfo.exists()) {
        data = {
          name: userInfo.data().nombre,
          email: userInfo.data().email,
        };
        setUserInfo(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    user && getInformation();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <div className="profile-container">
        <div className="profile-details">
          <h2 className="profile-title">{t("profile.titulo")}</h2>
          <p className="profile-label">
            {t("profile.nombre")} <span> {newUser.name} </span>
          </p>
          <p className="profile-label">
            {t("profile.email")} <span> {newUser.email} </span>
          </p>
          <div className="profile-language">
            <p className="profile-label">{t("profile.idioma")}</p>
            <select onChange={changeLanguage} defaultValue={i18n.language}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        <div className="profile-links">
          <button onClick={handleButtonClickHelp} className="profile-link">
            {t("profile.ayuda")}
          </button>
          <button onClick={handleButtonClickPrivacy} className="profile-link">
            {t("profile.politica")}
          </button>
          <button onClick={handleButtonClickTerms} className="profile-link">
            {t("profile.condiciones")}
          </button>
          <button onClick={handleButtonClickContact} className="profile-link">
            {t("profile.contactar")}
          </button>
        </div>

        {modalVisibleHelp && (
          <div className="modal">
            <div className="modal-content">
              <h2>{t("profile.titulo-help")}</h2>
              <p>{t("profile.contenido-help")}</p>
              <button onClick={() => setModalVisibleHelp(false)}>
                {t("profile.cerrar")}
              </button>
            </div>
          </div>
        )}

        {modalVisiblePrivacy && (
          <div className="modal">
            <div className="modal-content">
              <h2>{t("profile.titulo-privacy")}</h2>
              <p>{t("profile.contenido-privacy")}</p>
              <button onClick={() => setModalVisiblePrivacy(false)}>
                {t("profile.cerrar")}
              </button>
            </div>
          </div>
        )}

        {modalVisibleTerms && (
          <div className="modal">
            <div className="modal-content">
              <h2>{t("profile.titulo-terms")}</h2>
              <p>{t("profile.contenido-terms")}</p>
              <button onClick={() => setModalVisibleTerms(false)}>
                {t("profile.cerrar")}
              </button>
            </div>
          </div>
        )}

        {modalVisibleContact && (
          <div className="modal">
            <div className="modal-content">
              <h2>{t("profile.titulo-contact")}</h2>
              <p>{t("profile.contenido-contact")}</p>
              <button onClick={() => setModalVisibleContact(false)}>
                {t("profile.cerrar")}
              </button>
            </div>
          </div>
        )}
      </div>
    </I18nextProvider>
  );
};

export default Profile;
