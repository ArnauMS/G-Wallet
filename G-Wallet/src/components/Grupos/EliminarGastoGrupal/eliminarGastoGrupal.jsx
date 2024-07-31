// React
import { useEffect, useState } from "react";
//import { Database } from "firebase/database";
import { firestore } from "../../../firebase/index";
//Firebase
import { collection, doc, getDoc, getDocs, deleteDoc, updateDoc, query, where } from "firebase/firestore";
// Dispatch
import { useParams, useNavigate } from "react-router-dom";
// Hooks
import useExpenses from "../../../hooks/useGroups";
// Styles
import "./eliminarGastoGrupal.css";
//Redux
import { updateTransaction } from "../../../redux/slices/transactionsSlice";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

function EliminarGastoGrupal() {
  const { t } = useTranslation();
  const [id, setID] = useState("");
  const [gastosID, setGastosID] = useState(null);
  const [gastos, setGastos] = useState(null);
  const { expenseID } = useParams();
  const { groupID } = useParams();
  const { groups } = useExpenses();
  const [grupo, setGrupo] = useState({});
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const getExpensesGroup = async () => {
    const gastosRef = collection(firestore, "Gastos_Grupales");
    const q = query(gastosRef, where("__name__", "in", gastosID));
    const snapshot = await getDocs(q);
    const newGastos = [];
    let total = 0;
    if (!snapshot.empty) {
      snapshot.docs.map((doc) => {
        const data = {
          id: doc.id,
          ...doc.data(),
        };
        newGastos.push(data);
        doc.data().cantidades.map((cantidad) => {
          total += cantidad;
        });
      });
    }
    setGastos(newGastos);
    setTotal(total);
  };

  useEffect(() => {
    setID(grupo.id);
    setGastosID(grupo.gastos);
  }, [grupo]);

  useEffect(() => {
    id != "" && gastosID && getExpensesGroup();
  }, [id]);

  useEffect(() => {
    const filteredGroup = groups.filter((group) => group.id === groupID);
    setGrupo(...filteredGroup);
  }, []);


  const deleteExpenseGroup = async(grupo) => {
    const groupRef = doc(firestore, "Grupos", grupo.id);
    const groupDoc = await getDoc(groupRef);
    const groupGastosID = groupDoc.data().gastos;
    const groupMatrix = groupGastosID.filter((expense) => expense !== expenseID);
    await updateDoc(groupRef, {gastos: groupMatrix}); 
    await deleteDoc(doc(firestore, "Gastos_Grupales", expenseID));
    const update = updateTransaction(groupID)
    setTimeout(() =>  {window.location = `/dashboard/groups/${groupID}`;}, 300);
  };  

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="erasePage">
        <div className="content">
          <p className="texto"> {t('eliminarGastoGrupal.titulo')} </p> 
          <button className="button" onClick={()=>deleteExpenseGroup(grupo)}>{t('eliminarGastoGrupal.si')}</button>
          <button className="button" onClick={handleGoBack} >{t('eliminarGastoGrupal.no')}</button>
        </div>
      </div>
    </I18nextProvider>
  );
}

export default EliminarGastoGrupal;