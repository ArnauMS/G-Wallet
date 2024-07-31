// React
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
// Dispatch
import { useDispatch } from "react-redux";
import { getGroups } from "../../redux/slices/groupsSlice";
// Hooks
import useAuth from "../../hooks/useAuth";
import useGroups from "../../hooks/useGroups";
// Style
import "./groups.css";
// Components
import Loading from "../Loading/loading";
// Images
import Information from "../../assets/information.svg";
import Trash from "../../assets/Trash.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Groups = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { groups, isLoading, lastModified } = useGroups();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getGroups(user));
  }, [lastModified]);

  if (isLoading) return <Loading />;

  return (
    <>
      <I18nextProvider i18n={i18n}>
        <div className="grupos">
          <h1 className="titulo"> {t('groups.titulo')} </h1>
          <div className="table-groups">
            {groups.length > 0 &&
              groups.map((grupo) => {
                return (
                  <div className="grupo" key={grupo.id}>
                    <div className="left">
                      <h1 className="title"> {grupo.nombre} </h1>
                      {grupo.admin && <h2 className="admin">{t('groups.adminGrupo')}</h2>}
                    </div>
                    <div className="right">
                      <div className="imageTrash">
                        <Link to={`${grupo.id}/removeGroup`}>
                          <img src={Trash} alt="Eliminar grupo" />
                        </Link>
                      </div>
                      <div className="image">
                        <Link to={`${grupo.id}`}>
                          <img src={Information} alt="Informacion del grupo" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            {groups.length === 0 && (
              <p className="empty">
                {t('groups.vacio')}
              </p>
            )}
          </div>
          <Link to={"createGroup"}>
            <div className="create"> {t('groups.boton')} </div>
          </Link>
        </div>
      </I18nextProvider>
    </>
  );
};

export default Groups;
