// React
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Dispatch
import { useDispatch } from "react-redux";
import { getExpenses } from "../../redux/slices/individualSlice";
// Hooks
import useAuth from "../../hooks/useAuth";
import useIndividual from "../../hooks/useIndividual";
// Style
import "./individual.css";
// Components
import Loading from "../Loading/loading";
import VerGastosIndividuales from "./verGastosIndividuales/verGastosIndividuales";
//redux
import {
  updateExpenses,
  deleteExpenses,
} from "../../redux/slices/expensesSlice";
// Images
import Information from "../../assets/information.svg";
import Trash from "../../assets/Trash.svg";
import Pencil from "../../assets/pencil.svg";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../i18n";

const Individual = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { expenses, isLoading, error } = useIndividual();
  const [shownExpenses, setShownExpenses] = useState(null);
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalMod, setShowModalMod] = useState(false);
  const [gastoAEliminarId, setGastoAEliminarId] = useState(null);
  const [formValues, setFormValues] = useState({
    nombre: "",
    cantidad: "",
    fecha: "",
  });

  // NEW: State for selected currency and currency symbol mapping
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [conversionRates, setConversionRates] = useState({ eur: 1 });
  const [fromDate, setFromDate] = useState(new Date('1975-01-01'));
  const [toDate, setToDate] = useState(new Date().toLocaleString() + '');
  
  const currencySymbols = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CHF: "₣",
  };

  useEffect(() => {
    dispatch(getExpenses(user));
    setShownExpenses(expenses);
  }, [showModalMod, showModal]);

  useEffect(() => {
    async function updateConversionRates() {
    if (selectedCurrency !== 'EUR') {
    const response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/${selectedCurrency.toLowerCase()}.json`);
    const conversionData = await response.json();
    console.log(conversionData);
    setConversionRates(conversionData);
    } else {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/${selectedCurrency.toLowerCase()}.json`);
    const conversionData = await response.json();
    // console.log(conversionData);
    setConversionRates(conversionData);

    }
    }
    
    updateConversionRates();
    
   }, [selectedCurrency]);
   


  if (isLoading) return <Loading />;
  const categories = Object.keys(expenses);
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };
  const handleEliminarGasto = async (gastoid) => {
    dispatch(deleteExpenses(user, gastoid));
    setSelectedCategory(null);
  };

  const handleNombreChange = (e) => {
    setFormValues({ ...formValues, nombre: e.target.value });
  };

  const handleCantidadChange = (e) => {
    setFormValues({ ...formValues, cantidad: e.target.value });
  };

  const handleFechaChange = (e) => {
    setFormValues({ ...formValues, fecha: e.target.value });
  };

  // NEW: Handle currency selection change
  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const handleAceptarClick = (gastoid) => {
    dispatch(
      updateExpenses(
        user,
        formValues.nombre,
        formValues.cantidad,
        formValues.fecha,
        gastoid
      )
    );
    setShowModalMod(false);
  };

  const handleCancelarClick = () => {
    // Cerrar el modal
    setShowModalMod(false);
  };

  const handleShowModal = (gastoid) => {
    setGastoAEliminarId(gastoid);
    setShowModal(true);
  };

  const handleShowModalMod = (gasto) => {
    setShowModalMod(true);
  };

  function updateShownExpenses() {
    let newShownExpenses = {};
    for (let key in expenses) {
      let categoryArr = [];
      for (let i = 0; i < expenses[key].length; i++) {
        const date = expenses[key][i].fecha;

        if (date >= fromDate && date <= toDate) {
          categoryArr.push(expenses[key][i]);
        }
      }
      if (categoryArr.length != 0) {
        newShownExpenses[key] = categoryArr;
      }
    }
    setShownExpenses(newShownExpenses);
    setShownExpenses(newShownExpenses);
    setShownExpenses(newShownExpenses);
  }

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    updateShownExpenses();
  }

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    updateShownExpenses();
  }

  return (
    <I18nextProvider i18n={i18n}>
      <>
        <div className="individual">
          <h1 className="titulo"> {t("individual.titulo")} </h1>
          <VerGastosIndividuales 
            shownExpenses={shownExpenses}
          />
          <hr />
          <div className="datesIndv">
            <h3>{t("individual.verGastos")}</h3>
            <div>
              <label htmlFor="from">{t("individual.desde")} </label>
              <input id="from" type="date" name="fromDate" value={fromDate} max={toDate} onChange={handleFromDateChange}/>
            </div>
            <div>
              <label htmlFor="to">{t("individual.hasta")} </label>
              <input id="to" type="date" name="toDate" min={fromDate} onChange={handleToDateChange}/>
            </div>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <div
                key={category}
                className={`category ${
                  selectedCategory === category ? "selected" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {t(`categorias.${category}`)}
              </div>
            ))}

          <div className="category-divisa">
            <label htmlFor="currency-select">{t('individual.Divisa')} </label>
            <select
              id="currency-select"
              value={selectedCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CHF">CHF</option>
            </select>
          </div>

          </div>

          
          {selectedCategory &&
            shownExpenses[selectedCategory] &&
            shownExpenses[selectedCategory].length > 0 && (
              <div className="table-individual">
                {shownExpenses[selectedCategory].map((gasto) => {
                  return (
                    <div className="gasto" key={gasto.id}>
                      <div className="left">
                        <h1 className="title">
                          {gasto.nombre}{" "}
                          <span className="category"> {gasto.categoria} </span>{" "}
                        </h1>
                        <h2 className="date"> {gasto.fecha} </h2>
                      </div>
                      <div className="right">
                        <div className="image">
                          <h1 className="amount"> 
                          {" "}
                          {(parseFloat(gasto.cantidad) * conversionRates[selectedCurrency.toLowerCase()]).toFixed(2)} {currencySymbols[selectedCurrency]}{" "}
                          </h1>
                          

                          <img
                            className="trash"
                            src={Trash}
                            alt="Eliminar gasto"
                            onClick={() => handleShowModal(gasto.id)}
                          />
                          {showModal && (
                            <div className="modal">
                              <div className="modal-content">
                                <p>{t("individual.eliminarGasto")}</p>
                                <div className="buttons">
                                  <button
                                    onClick={() => {
                                      handleEliminarGasto(gastoAEliminarId);
                                      setShowModal(false);
                                    }}
                                  >
                                    {t("individual.si")}
                                  </button>
                                  <button onClick={() => setShowModal(false)}>
                                    {t("individual.no")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          <img
                            className="trash"
                            src={Pencil}
                            alt="modificar gasto"
                            onClick={() => handleShowModalMod(gasto)}
                          />
                          {showModalMod && (
                            <div className="modalmod">
                              <div className="modalmod-content">
                                <p>{t("individual.modificarGasto")} </p>
                                <form>
                                  <div className="inputmod-container">
                                    <label htmlFor="nombre">
                                      {t("individual.nombre")}
                                    </label>
                                    <input
                                      defaultValue={gasto.nombre}
                                      type="text"
                                      id="nombre"
                                      name="nombre"
                                      onChange={handleNombreChange}
                                    />
                                  </div>

                                  <div className="inputmod-container">
                                    <label htmlFor="cantidad">
                                      {t("individual.cantidad")}
                                    </label>
                                    <input
                                      defaultValue={gasto.cantidad}
                                      type="number"
                                      id="cantidad"
                                      name="cantidad"
                                      onChange={handleCantidadChange}
                                    />
                                  </div>

                                  <div className="inputmod-container">
                                    <label htmlFor="fecha">
                                      {t("individual.fecha")}
                                    </label>
                                    <input
                                      defaultValue={gasto.fecha}
                                      type="date"
                                      id="fecha"
                                      name="fecha"
                                      onChange={handleFechaChange}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleAceptarClick(gasto.id)}
                                  >
                                    {t("individual.aceptar")}
                                  </button>
                                  <button onClick={handleCancelarClick}>
                                    {t("individual.cancelar")}
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {selectedCategory &&
                  shownExpenses[selectedCategory] &&
                  shownExpenses[selectedCategory].length === 0 && (
                    <p className="empty">{t("individual.categoriaVacia")}</p>
                  )}
              </div>
            )}
          {!selectedCategory && (
            <p className="empty">{t("individual.clicCategoria")}</p>
          )}
          <Link to={"addIndividualExpense"}>
            <div className="create"> {t("individual.crearGastoBoton")} </div>
          </Link>

          <Link to={"modifyCategoryLimit"}>
            <div className="modificarLimiteCategoria">
              {" "}
              {t("individual.modificarLimiteBoton")}{" "}
            </div>
          </Link>
        </div>
      </>
    </I18nextProvider>
  );
};
export default Individual;
