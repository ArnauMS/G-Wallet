// React
import { useEffect, useState } from "react";
// Router
import { useParams, useLocation } from "react-router-dom";
// Firebase
import { firestore } from "../../../firebase/index";
import { collection, getDocs, query, where } from "firebase/firestore";
// Hooks
import useExpensesAndCategories from "../../../hooks/useExpensesAndCategories";
// Styles
import "./gasto.css";
import Information from "../../../assets/information.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const Gasto = () => {
  const { t } = useTranslation();
  const { expenseID } = useParams();
  const { expenses } = useExpensesAndCategories();
  const [expense, setExpense] = useState(null);
  const [participantes, setParticipantes] = useState(null);
  const [participantesData, setParticipantesData] = useState(null);
  let { state } = useLocation();
  const currency = state.selectedCurrency
  const [conversionRates, setConversionRates] = useState({[currency.toLowerCase()]:1});

  async function getCurrency(){
    let currencyValue = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/"+currency.toLowerCase()+".json")
    let moneyConversion = await currencyValue.json()
    setConversionRates(moneyConversion)
  }

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
    const filteredExpense = expenses.filter(
      (expense) => expense.id == expenseID
    );
    setExpense(...filteredExpense);
  }, [expenses]);

  useEffect(() => {
    expense && setParticipantes(expense.participantes);
  }, [expense]);

  useEffect(() => {
    participantes && getParticipantes();
  }, [participantes]);

  const formatExpenseDate = (expense) => {
    let date;
    if (expense && expense.fecha) {
      date = new Date(
        expense.fecha.seconds * 1000 + expense.fecha.nanoseconds / 1000000
      );
    } else {
      date = new Date();
    }
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${day}/${month}/${year} ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };
  const formattedDate = formatExpenseDate(expense);
  const currencySymbols = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CHF: "₣",
  };
  getCurrency();
  return (
    <I18nextProvider i18n={i18n}>
      <div className="gasto-informacion">
        <h1 className="name">{expense && expense.concept}</h1>
        <div className="pagos">
          {expense && expense.concept.startsWith("Reembolso") ? (
            <>
              <h1 className="titulo">
                {t("gasto.Fecha")}{" "}
                <span style={{ fontWeight: "normal" }}>{formattedDate}</span>{" "}
                {t("gasto.totalTransaccion")}{" "}
                <span style={{ fontWeight: "normal" }}>
                  {expense &&
                    (
                      expense.cantidades.reduce((acc, curr) => acc + curr, 0) / 2 * conversionRates[currency.toLowerCase()]
                    ).toFixed(2)}{" "}
                  {currencySymbols[currency]}
                </span>
              </h1>

              <div className="container">
                {participantesData &&
                  participantesData.map((item, index) => {
                    if (expense.cantidades[index] > 0) {
                      return (
                        <div key={index} className="pago">
                          <div className="left">
                            <p className="persona">
                              {
                                <span
                                  style={{ fontWeight: "bold", color: "red" }}
                                >
                                  {participantesData.find(
                                    (name, i) => expense.cantidades[i] === 0
                                  )}
                                </span>
                              }{" "}
                              {t("gasto.devuelto")}{" "}
                              {
                                <span style={{ fontWeight: "bold" }}>
                                  {(expense.cantidades[index] / 2 *conversionRates[currency.toLowerCase()]).toFixed(2)} {currencySymbols[currency]}
                                </span>
                              }{" "}
                              {t("gasto.a")}{" "}
                              {
                                <span
                                  style={{ fontWeight: "bold", color: "green" }}
                                >
                                  {item}
                                </span>
                              }
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "5px",
                              padding: "10px",
                            }}
                          >
                            <img
                              className="information"
                              src={Information}
                              alt="Información del gasto"
                              width="16"
                              height="16"
                            />
                            <p style={{ marginLeft: "19px" }}>
                              {t("gasto.infoReembolso1")}
                              <br />
                              {t("gasto.infoReembolso2")}
                              <br />
                              {t("gasto.infoReembolso3")}
                              <br />
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })}
              </div>
            </>
          ) : (
            <>
              <h1 className="titulo">
                {t("gasto.Fecha")}{" "}
                <span style={{ fontWeight: "normal" }}>{formattedDate}</span>{" "}
                {t("gasto.totalTransaccion")}{" "}
                <span style={{ fontWeight: "normal" }}>
                  {expense &&
                    (expense.cantidades
                      .reduce((acc, curr) => acc + curr, 0) *conversionRates[currency.toLowerCase()])
                      .toFixed(2)}{" "}
                  {currencySymbols[currency]}
                </span>
              </h1>
              <div className="infoGastoGrupal">
                <div className="leftGasto" style={{ float: "left" }}>
                  <table
                    className="tabla"
                    style={{ borderCollapse: "collapse", textAlign: "left" }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          Participante
                        </th>
                        <th
                          style={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          Pago
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantesData &&
                        participantesData.map((item, index) => (
                          <tr key={index}>
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f2f2" : "white",
                              }}
                            >
                              {item}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                                backgroundColor:
                                  index % 2 === 0 ? "#f2f2f2" : "white",
                              }}
                            >
                              {(expense.cantidades[index]*conversionRates[currency.toLowerCase()]).toFixed(2)} {currencySymbols[currency]}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="grafico">
                  <h4 style={{ textAlign: "center", marginBottom: "10px" }}>
                    Total por pagar
                  </h4>
                  {participantesData &&
                    participantesData.map((item, index) => {
                      const cantidad = expense.cantidades[index];
                      const visitado = expense.visitado[index] / 100;
                      const diferencia = ((cantidad - visitado)).toFixed(2);
                      return (
                        <div key={index} className="barra">
                          <p
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "12px",
                              color:
                                diferencia == 0
                                  ? "gray"
                                  : diferencia > 0
                                  ? "green"
                                  : "red",
                              marginBottom: "5px",
                              marginTop: "5px",
                            }}
                          >
                            {item}{" "}
                            {diferencia < 0
                              ? ` - ( Falta por pagar ${Math.abs(
                                  diferencia *conversionRates[currency.toLowerCase()]
                                ).toFixed(2)} ${currencySymbols[currency]})`
                              : diferencia > 0
                              ? ` - ( Ha pagado de más ${Math.abs(
                                  diferencia * conversionRates[currency.toLowerCase()]
                                ).toFixed(2)} ${currencySymbols[currency]} )`
                              : " - ( El pago está completo )"}
                          </p>
                          <div
                            className="fondo"
                            style={{
                              width: "100%",
                              height: "20px",
                              border: "1px solid black",
                              borderTopLeftRadius: "5px",
                              borderTopRightRadius: "5px",
                              borderBottomLeftRadius: "5px",
                              borderBottomRightRadius: "5px",
                            }}
                          >
                            <div
                              className={`relleno ${
                                diferencia >= 0 ? "verde" : "rojo"
                              }`}
                              style={{
                                height: "100%",
                                width: `${Math.abs(diferencia)}%`,
                                marginLeft:
                                  diferencia >= 0
                                    ? "50%"
                                    : `${50 - Math.abs(diferencia)}%`,
                                borderTopRightRadius:
                                  diferencia >= 0 ? "5px" : undefined,
                                borderBottomRightRadius:
                                  diferencia >= 0 ? "5px" : undefined,
                                borderTopLeftRadius:
                                  diferencia < 0 ? "5px" : undefined,
                                borderBottomLeftRadius:
                                  diferencia < 0 ? "5px" : undefined,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </I18nextProvider>
  );
};

export default Gasto;
