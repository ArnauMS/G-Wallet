// React
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Router
import { useParams } from "react-router-dom";
// Hooks
import useGroups from "../../../hooks/useGroups";
// Components
import Participantes from "./Participantes/participantes";
import Gastos from "./Gastos/gastos";
import Transacciones from "./Transacciones/transacciones";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";
// Style
import "./group.css";

const Group = () => {
  const { t } = useTranslation();
  const { groupID } = useParams();
  const { groups } = useGroups();
  const [grupo, setGrupo] = useState({});

  useEffect(() => {
    const filteredGroup = groups.filter((group) => group.id === groupID);
    setGrupo(...filteredGroup);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <div className="contenido-grupo">
        <h1 className="titulo-grupo"> {grupo.nombre} </h1>
        <div className="contenido-participantes">
          <Participantes grupo={grupo} />
        </div>
        <div className="contenido-gastos">
          <Gastos grupo={grupo} />
        </div>
        <div className="contenido-transacciones">
          <Transacciones grupo={grupo} />
        </div>
        <div className="ajustes-grupo">
          <Link to={"modifyGroup"}>
            <span className="btn">{t("group.ajustes")}</span>
          </Link>
          <Link to={"addGroupalExpense"}>
            <span className="btn">{t("group.añadirGasto")}</span>
          </Link>
          <Link to={"groupChat"}>
            <span className="btn">Chat</span>
          </Link>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default Group;
