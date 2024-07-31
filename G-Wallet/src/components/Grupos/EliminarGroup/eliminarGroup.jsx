// React
import { useEffect, useState } from "react";
//Firebase
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
//import { Database } from "firebase/database";
import { firestore } from "../../../firebase/index";
// Dispatch
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
// Hooks
import useAuth from "../../../hooks/useAuth";
import useExpenses from "../../../hooks/useGroups";
// Styles
import "./eliminarGroup.css";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const EliminarGroup = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { groupID } = useParams();
    const { groups } = useExpenses();
    const [grupo, setGrupo] = useState({});

    useEffect(() => {
        const filteredGroup = groups.filter((group) => group.id === groupID);
        setGrupo(...filteredGroup);
    }, []);

    const deleteGroup = async(grupo) => {
        const groupData = doc(firestore, 'Grupos', grupo.id);
        const userRef = doc(firestore, "Usuarios", user);
        const userDoc = await getDoc(userRef);
        const userGroupsIds = userDoc.data().grupos;
        const nuevaMatriz = userGroupsIds.filter((group) => group !== grupo.id);
        const listExpenses = (await getDoc(groupData)).data().gastos;
        const transactionID = (await getDoc(groupData)).data().transacciones;
        await deleteDoc(doc(firestore, 'Grupos', grupo.id));
        await updateDoc(userRef, {grupos: nuevaMatriz});
        await deleteDoc(doc(firestore, "Transacciones", transactionID));
        if (listExpenses.length > 0) {
          for (const gastoID of listExpenses) {
            await deleteDoc(doc(firestore, "Gastos_Grupales", gastoID));
            console.log(gastoID);
          }
        }
        window.history.back();
    };
    
    const handleGoBack = () => {
      window.history.back();
    };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="erasePage">
        <div className="content">
          <p className="texto"> {t('eliminarGroup.titulo')} </p>
          <button className="button" onClick={()=>deleteGroup(grupo)}>{t('eliminarGroup.si')}</button>
          <button className="button" onClick={handleGoBack} > {t('eliminarGroup.no')}</button>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default EliminarGroup;