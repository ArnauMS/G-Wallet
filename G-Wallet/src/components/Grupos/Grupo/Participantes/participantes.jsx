// React
import React, { useEffect, useState } from "react";
// Firebase
import { firestore } from "../../../../firebase/index";
import { collection, getDocs, query, where } from "firebase/firestore";
// Style
import "./participantes.css";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const Participantes = ({ grupo }) => {
  const { t } = useTranslation();
  const [participantes, setParticipantes] = useState(null);
  const [participantesData, setParticipantesData] = useState(null);

  const getParticipantes = async () => {
    const participantesRef = collection(firestore, "Usuarios");
    const q = query(participantesRef, where("__name__", "in", participantes));
    const participantesData = await getDocs(q);
    const data = [];
    participantesData.forEach((doc) => {
      data.push(doc.data().nombre);
    });
    setParticipantesData(data);
  };

  useEffect(() => {
    setParticipantes(grupo.participantes);
  }, [grupo]);

  useEffect(() => {
    participantes && getParticipantes();
  }, [participantes]);

  return (
    <I18nextProvider i18n={i18n}>
      <div className="participantes">
        <h1> {t("participantes.titulo")} </h1>
        <ul className="participantes-ul">
          {participantesData &&
            participantesData.map((usuario, index) => {
              return (
                <li key={index}>
                  <p>{usuario}</p>
                </li>
              );
            })}
        </ul>
      </div>
    </I18nextProvider>
  );
};

export default Participantes;
