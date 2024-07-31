// React
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Styles
import "./header.css";
// Firebase
import { firestore } from "../../../../firebase/index";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
// Hooks
import useAuth from "../../../../hooks/useAuth";
// Components
import Gastos from "../Gastos/gastos";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const Header = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [gastos, setGastos] = useState(0);

  const getInformation = async () => {
    try {
      const docRef = doc(firestore, "Usuarios", user);
      const userInfo = await getDoc(docRef);
      if (userInfo.exists()) {

        const q = query(
          collection(firestore, "Categorias"),
          where("userid", "==", user),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          let limitTotal = 0;
          let limitTotal2 = 0;
          let numcategories = 12;
          for (const doc of querySnapshot.docs) {
            console.log("Limite Categoria:", parseFloat(doc.data().limite));
            limitTotal2 += parseFloat(doc.data().limite);
            numcategories -=1;
            console.log("Gastos:", doc.data().gastos);

            const q2 = query(
              collection(firestore, "Gastos_indv"),
              where("userid", "==", user),
              where("categoria", "==", doc.data().nombre)
            );
            const querySnapshot2 = await getDocs(q2);
            let totalWastedCategoria = 0
            querySnapshot2.docs.forEach(doc => {
              totalWastedCategoria += parseFloat(doc.data().cantidad)
              console.log(doc.data().cantidad);
                           
            });
            console.log("Total:", totalWastedCategoria)
            limitTotal += (parseFloat(totalWastedCategoria));
          }
            
            limitTotal2 = parseFloat(limitTotal2 + (250 * (numcategories)));
            console.log("Hola", limitTotal2);
            console.log(limitTotal);
                       
          setSaldo(parseFloat(limitTotal2 - limitTotal));
  
    
        } else {
          setSaldo(parseFloat(0));
        }
        setGastos(userInfo.data().gastos);
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
      <div className="header">
        <div className="container">
          <div className="up">
            <h1 className="title"> {t('header.titulo')} </h1>
            <h1 className="money"> {parseFloat(saldo).toFixed(2)} € </h1>
            <div className="buttons">
              <div className="btn">
                <Link
                  className="link"
                  to={"addExpense"}
                >
                  {t('header.boton')}
                </Link>
              </div>
            </div>
          </div>
          <div className="down">
            <div className="pendings">
              <p className="title">
              {t('header.subtitulo')} <span> {t('header.subtitulo2')} </span>
              </p>
              <div className="money"> {gastos.toFixed(2)} € </div>
            </div>
          </div>
        </div>
        <Gastos />
      </div>
    </I18nextProvider>
  );
};

export default Header;
