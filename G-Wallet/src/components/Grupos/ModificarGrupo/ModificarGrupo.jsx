// React
import React, { useEffect, useState } from "react";
// Router
import { useParams, Navigate } from "react-router-dom";
// Databse
import { firestore } from "../../../firebase/index";
import { doc, getDoc } from "firebase/firestore";
// Redux
import { actualizarGrupo } from "../../../redux/slices/groupsSlice";
// Dispatch
import { useDispatch } from "react-redux";
// Hooks
import useGroups from "../../../hooks/useGroups";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const ModificarGroup = () => {
  const { t } = useTranslation();
  const { groupID } = useParams();
  const { groups, modified } = useGroups();
  const dispatch = useDispatch();
  const [grupo, setGrupo] = useState({
    nombre: "",
    participantes: [],
    participantesID: [],
    transacciones: [],
  });

  const [values, setValues] = useState({
    name: "",
    participants: [],
  });

  useEffect(() => {
    const filteredGroup = groups.filter((item) => item.id === groupID);
    const array = [];
    if (filteredGroup.length != 0) {
      filteredGroup[0].participantes.map(async (id) => {
        const docRef = doc(firestore, "Usuarios", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const participante = docSnap.data().nombre;
          array.push(participante);
          setGrupo({
            ...grupo,
            nombre: filteredGroup[0].nombre,
            participantes: [array],
            participantesID: filteredGroup[0].participantes,
            transacciones: filteredGroup[0].transacciones,
          });
        }
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (values.name == "") {
      dispatch(
        actualizarGrupo(
          groupID,
          grupo.nombre,
          values.participants,
          grupo.participantes[0],
          grupo.participantesID,
          grupo.transacciones
        )
      );
    } else {
      dispatch(
        actualizarGrupo(
          groupID,
          values.name,
          values.participants,
          grupo.participantes[0],
          grupo.participantesID,
          grupo.transacciones
        )
      );
    }
  };

  if (modified) {
    return <Navigate to={"/dashboard/groups/"} />
  }

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setValues({ ...values, [name]: value });
  };

  const handleCheckbox = (participante) => {
    if (values.participants.length == 0) {
      setValues({
        ...values,
        participants: [...values.participants.concat(participante)],
      });
    } else {
      const aux = values.participants.filter((item) => {
        if (item === participante) {
          return item;
        }
      });
      if (aux.length != 0) {
        setValues({
          ...values,
          participants: [
            ...values.participants.filter((item) => item !== participante),
          ],
        });
      } else {
        setValues({
          ...values,
          participants: [...values.participants.concat(participante)],
        });
      }
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="groupPage">
        <div className="content">
          <p className="texto"> {t('modificarGrupo.titulo')} </p>
          <form onSubmit={handleSubmit}>
            <p> {t('modificarGrupo.subtitulo1')} </p>
            <div className="input">
              <input
                type="text"
                placeholder={grupo.nombre}
                name="name"
                value={values.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <br /> <p> {t('modificarGrupo.subtitulo2')} </p> <br />
              {grupo.participantes.length != 0 ? (
                grupo.participantes[0].map((participante, index) => (
                  <div key={grupo.participantesID[index]}>
                    <label>
                      <input
                        type="checkbox"
                        onClick={() => handleCheckbox(participante)}
                      />{" "}
                      {participante}{" "}
                    </label>{" "}
                    <br />
                  </div>
                ))
              ) : (
                <p> {t('modificarGrupo.vacio')} </p>
              )}
            </div>
            <div className="input">
              <input type="submit" value={t('modificarGrupo.boton')} />
            </div>
          </form>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default ModificarGroup;
