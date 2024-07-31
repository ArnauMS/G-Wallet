// React
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Firestore
import { getDoc, getDocs, doc, collection, addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { firestore } from "../../../../firebase/index";
// Hooks
import useAuth from "../../../../hooks/useAuth";
// Images
import Information from "../../../../assets/information.svg";
import Dollar from "../../../../assets/dollar.svg";
// Styles
import "./transacciones.css";
// Utils
import { makeRandomId } from "../../../../utils/randomID";
import { splitExpenses, getExpense, updateTransaction, updateChat } from "../../../../redux/slices/transactionsSlice";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const Transacciones = ({ grupo }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [conversionRates, setConversionRates] = useState({eur:1});


  const navigate = useNavigate();

  async function getCurrency(){
    let currencyValue = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/"+currency.toLowerCase()+".json")
    let moneyConversion = await currencyValue.json()
    setConversionRates(moneyConversion)
  }

  useEffect(() => {
    grupo.transacciones && getTransaccion();
  }, [grupo]);

  useEffect(()=>{
    getCurrency()
  },[currency])

  const getTransaccion = async () => {
    const docRef = doc(firestore, "Transacciones", grupo.transacciones);
    const docSnap = await getDoc(docRef);
    setTransacciones(docSnap.data().transacciones);
    const gastosRef = collection(firestore, "Usuarios");
    const snapshot = await getDocs(gastosRef);
    const usersNames = [];
    if (!snapshot.empty) {
      snapshot.docs.map((doc) => {
        const data = {
          id: doc.id,
          nombre: doc.data().nombre,
        };
        usersNames.push(data);
      });

      setUsuarios(usersNames);
    }
  };

  function getUserName(id) {
    const user = usuarios.find((user) => user.id === id);
    return user ? user.nombre : null;
  }

  const handleClick = async (userIdRecibe, userIdDebe, total) => { {
    console.log("Hola")

    console.log(total);
        
    const nameUserIdRecibe = getUserName(userIdRecibe);
    const nameUserIdDebe = getUserName(userIdDebe);

    const currentDate = new Date();
    const expense = {
      concept: "Reembolso de " + nameUserIdDebe + " a " + nameUserIdRecibe,
      participantes: [userIdDebe, userIdRecibe],
      cantidades: [total*2, 0],
      visitado: [total*100, total*100],
      reembolso: true,
      fecha: currentDate
    };

    const gastos = collection(firestore, "Gastos_Grupales");
    const docGastos = await addDoc(gastos, expense);

    const docIdGastos = docGastos.id;

    const groupDocRef = doc(firestore, "Grupos", grupo.id);
    await updateDoc(groupDocRef, {
      gastos: arrayUnion(docIdGastos),
    });

    const update = await updateTransaction(grupo.id);
    const update2 = await updateChat(grupo.id, userIdRecibe, userIdDebe, total);
    window.location = window.location.href+'?eraseCache=true'

   };
  }
   

  return (
    <I18nextProvider i18n={i18n}>
      <div className={transacciones ? "transacciones" : "transacciones empty"}>
        {transacciones && <h1> {t("transacciones.titulo")} </h1>}
        <select value={currency} onChange={(e)=>{setCurrency(e.target.value)}} className="inputCurrency2">
          <option value={"EUR"}>EUR</option>
          <option value={"USD"}>USD</option>
          <option value={"GBP"}>GBP</option>
          <option value={"JPY"}>JPY</option>
          <option value={"CHF"}>CHF</option>
        </select>
        {transacciones &&
          transacciones.map((transaccion) => {
            const currencySymbols = {
              EUR: "€",
              USD: "$",
              GBP: "£",
              JPY: "¥",
              CHF: "₣",
            };
            return (
              <div key={makeRandomId(10)} className="transaccion">
                <div className="text">
                  <p className="concept">
                    <span>
                      {usuarios.map((usuario) => {
                        if (usuario.id == transaccion.usuarioDebe) {
                            return <span style={{ fontWeight: 'bold', color: 'red' }}>{usuario.nombre}</span>;
                        }
                      })}
                      &nbsp;
                      {t("transacciones.texto")}
                      &nbsp;
                      {usuarios.map((usuario) => {
                        if (usuario.id == transaccion.usuarioRecibe) {
                          return <span style={{ fontWeight: 'bold', color: 'green' }}>{usuario.nombre}</span>;
                        }
                      })}
                      :
                    </span>
                  </p>
                  <p className="price">
                    <span> Total: </span> {(transaccion.cantidad*conversionRates[currency.toLowerCase()]).toFixed(2)} {currencySymbols[currency]}
                  </p>
                </div>
                {transaccion.usuarioDebe == user ? (
                  <img
                  className="logo"
                  src={Dollar}
                  alt="Pagar el gasto"
                  onClick={() => handleClick(transaccion.usuarioRecibe, transaccion.usuarioDebe, transaccion.cantidad)}
                 />
                ) : (
                  <></>
                )}
              </div>
            );
          })}
        {!transacciones && <p className="empty">{t("transacciones.vacio")}</p>}
      </div>
    </I18nextProvider>
  );
};

export default Transacciones;
