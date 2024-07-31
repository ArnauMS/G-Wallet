// React
import { useEffect, useState } from "react";
// Firestore
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../../../firebase/index";
// Redux
import { useDispatch } from "react-redux";
import { getExpensesSuccess } from "../../../../redux/slices/expensesSlice";
// Styles
import "./gastos.css";
import { Link } from "react-router-dom";
// Images
import Information from "../../../../assets/information.svg";
import Trash from "../../../../assets/Trash.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const Gastos = ({ grupo }) => {
  const { t } = useTranslation();
  const [id, setID] = useState(null);
  const [gastosID, setGastosID] = useState(null);
  const [gastos, setGastos] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [total, setTotal] = useState(0);
  const [conversionRates, setConversionRates] = useState({eur:1});
  const dispatch = useDispatch();

  const getExpensesGroup = async () => {
    
    if (gastosID && gastosID.length > 0) {
      

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
    dispatch(getExpensesSuccess(newGastos));
  }
  };

  async function getCurrency(){
    let currencyValue = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/"+currency.toLowerCase()+".json")
    let moneyConversion = await currencyValue.json()
    setConversionRates(moneyConversion)
  }

  useEffect(() => {
    grupo.id && setID(grupo.id);
    grupo.gastos && grupo.gastos.length != 0 && setGastosID(grupo.gastos);
  }, [grupo]);

  useEffect(() => {
    id && gastosID.length != 0 && getExpensesGroup();
  }, [gastosID]);

  useEffect(()=>{
    getCurrency()
  },[currency])
  useEffect(() => {
    getExpensesGroup();
  }, [gastos]);
  

  return (
    <I18nextProvider i18n={i18n}>
      <div className={gastos ? "gastos-grupo" : "gastos-grupo empty"}>
        {gastos && <h1> {t("gastosGrupal.titulo")} </h1>}
        <select value={currency} onChange={(e)=>{setCurrency(e.target.value)}} className="inputCurrency2">
          <option value={"EUR"}>EUR</option>
          <option value={"USD"}>USD</option>
          <option value={"GBP"}>GBP</option>
          <option value={"JPY"}>JPY</option>
          <option value={"CHF"}>CHF</option>
        </select>
        <div className="container">
          {gastos &&
            gastos.map((gasto) => {
              const currencySymbols = {
                EUR: "€",
                USD: "$",
                GBP: "£",
                JPY: "¥",
                CHF: "₣",
              };
              return (
                <div key={gasto.id} className="gasto">
                  <div className="text">
                    <p
                      className="concept"
                      style={
                        gasto.concept.startsWith("Reembolso") 
                          ? { color: "green" }
                          : {}
                      }
                    >
                      {gasto.concept}
                    </p>
                    <p className="price">
                      {(() => {
                        let sum = gasto.cantidades.reduce(
                          (a, b) => parseFloat(a) + parseFloat(b),
                          0
                        );
                        sum *= conversionRates[currency.toLowerCase()]
                        if (gasto.concept.startsWith("Reembolso")) {
                          sum = sum / 2;
                          return `Se ha pagado una transacción de ${sum.toFixed(
                            2
                          )} ${currencySymbols[currency]}`;
                        } else {
                          return `${sum.toFixed(2)} ${currencySymbols[currency]}`;
                        }
                      })()}
                    </p>
                  </div>

                  <Link to={`${gasto.id}/removeGroupExpense`}>
                    <img
                      className="trash"
                      src={Trash}
                      alt="Eliminar Gasto Grupal"
                    />
                  </Link>
                  <Link to={`${gasto.id}`} state={{selectedCurrency: currency}}>
                    <img
                      className="information"
                      src={Information}
                      alt="Información del gasto"
                    />
                  </Link>
                </div>
              );
            })}
            
        </div>
        {!gastos && <p className="empty">{t("gastosGrupal.vacio")}</p>}
      </div>
    </I18nextProvider>
  );
};

export default Gastos;
