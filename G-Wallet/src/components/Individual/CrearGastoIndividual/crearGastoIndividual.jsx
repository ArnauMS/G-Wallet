// React
import { useState, useEffect } from "react";
// Hooks
import useAuth from "../../../hooks/useAuth";
// Database
import { firestore } from "../../../firebase/index.js";
import { collection, where, getDocs, query, doc, getDoc  } from "firebase/firestore";

// Styles
import "./crearGastoIndividual.css";
//redux
import { useDispatch } from "react-redux";
import { createExpenses } from "../../../redux/slices/expensesSlice";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const initialValues = {
  importe: 0.0,
  categoria: "No_option",
  concepto: "",
  currency: "EUR",
  inputDate: "",
};



const CrearGastoIndividual = () => {
  const { t } = useTranslation();
  const [inputValues, setValues] = useState(initialValues);
  const [message, setMessage] = useState(<I18nextProvider i18n={i18n}>
                                            {t('crearGastoIndividual.permitido')};
                                          </I18nextProvider>);
  const [categoriesData, setData] = useState(["Category1", "Category2"]);
  const [userLimit, setUserLimit] = useState(250);
  const [themeColor, setThemeColor] = useState("#2D8E31");
  const userID = useAuth().user;
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const dispatch = useDispatch();
  const [currency, setCurrency] = useState("eur");

  // Obtiene una colección desde la base de datos.
  async function getCollectionData(collectionName) {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    const documents = querySnapshot.docs.map((doc) => doc.data());
    return documents;
  }

  // Transforma a Euros una cierta moneda. <<Se debería hacer a través de una biblioteca externa>>.
  function getEurosFromCurrency(currency, importe) {
    if (currency == "EUR") return importe;
    else if (currency == "USD") return Math.round(0.92 * importe * 100) / 100;
  }
  // Obtiene las categorias desde la base de datos.
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().substr(0, 10);
    setValues({ ...inputValues, inputDate: formattedDate });
    async function fetchData() {
      const collectionData = await getCollectionData("Categories");
      setData([collectionData[0].name][0]);
    }
    fetchData();
   
  }, []);

  // Actualiza el background cuando se actualice el importe. (1/2)
  // Actualiza el límite de gasto para avisar al Usuario. (2/2)
  useEffect(() => {
    setMessage(getMessage(inputValues.importe));
  }, [inputValues.importe, inputValues.categoria, inputValues.currency]);

  // Devuelve un mensaje u otro en función del límite del usuario (y del importe del gasto).
  const getMessage = (value) => {
      const valueInEUR = getEurosFromCurrency(inputValues.currency, value);
      if (valueInEUR <= userLimit / 2) {
        setThemeColor("#2D8E31");
        return  <I18nextProvider i18n={i18n}>
                  {t('crearGastoIndividual.permitido')};
                </I18nextProvider>
      } else if (valueInEUR <= userLimit) {
        setThemeColor("#EF950F");
        return  <I18nextProvider i18n={i18n}>
                  {t('crearGastoIndividual.cuidado')};
                </I18nextProvider>
      } else {
        setThemeColor("#DF1414");
        return  <I18nextProvider i18n={i18n}>
                  {t('crearGastoIndividual.tePasas')};
                </I18nextProvider>
      }
  };

  // Sube el gasto a la BD.
  const handleSubmit = async (e) => {

    e.preventDefault();
      // Obtenemos el factor de conversión de la API externa
    const response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/${currency.toLowerCase()}.json`);
    const conversionData = await response.json();
    const conversionRate = conversionData[currency.toLowerCase()];

    // Convertimos el importe a euros utilizando el factor de conversión
    const importeEuros = parseFloat(inputValues.importe) / conversionRate;
    const importeEurosRedondeado = parseFloat(importeEuros.toFixed(2));
    
    dispatch(
      createExpenses(
        selectedCategoria,
        inputValues.concepto,
        inputValues.inputDate,
        importeEurosRedondeado,
        userID
      )
    );
    alert(<I18nextProvider i18n={i18n}> {t('crearGastoIndividual.añadidoConExito')} </I18nextProvider>);
  };

  // Actualiza los estados locales.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...inputValues, [name]: value });
  };
  
  useEffect(() => {
    console.log(userLimit);
  }, [userLimit]);
  
  const handleCategoriaChange = async (e) => {
    setSelectedCategoria(e.target.value);
    console.log(e.target.value);
  
    const q = query(
      collection(firestore, "Categorias"),
      where("userid", "==", userID),
      where("nombre", "==", e.target.value)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      setUserLimit(parseFloat(doc.data().limite));
      console.log(userLimit);
      console.log(doc.data().gastos)

      if (doc.data().gastos.length === 0) {
        setUserLimit(parseFloat(doc.data().limite));
        console.log(userLimit)
      } else {
                
        const q2 = query(
          collection(firestore, "Gastos_indv"),
          where("userid", "==", userID),
          where("categoria", "==", e.target.value)
        );
        const querySnapshot2 = await getDocs(q2);
        let totalWastedCategoria = 0
        querySnapshot2.docs.forEach(doc => {
          totalWastedCategoria += parseFloat(doc.data().cantidad)
          console.log(doc.data().cantidad);
          console.log(totalWastedCategoria)
          
        });
        await setUserLimit(parseFloat(doc.data().limite) - parseFloat(totalWastedCategoria));
        console.log(userLimit);

      }

      

    } else {
      setUserLimit(250);
    }
  };
  // HTML5.
  return (
    <>
      <I18nextProvider i18n={i18n}>
        <div className="crearGasto-container">
          <div
            className="PersonalExpense"
            style={{
              borderColor: themeColor,
              borderLeftWidth: "3px",
              borderStyle: "solid",
              transition: "all .5s ease",
            }}
          >
            <div className="TopBar">
              <p className="title"> {t("crearGastoIndividual.titulo")} </p>
            </div>

            <div className="card">
              <form onSubmit={handleSubmit}>
                <select
                  className="inputCategory"
                  name="categoria"
                  onChange={handleCategoriaChange}
                  defaultValue={selectedCategoria}
                  required
                >
                  <option value="" disabled hidden>
                    {t("crearGastoIndividual.categorias")}
                  </option>
                  {categoriesData.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                <input
                  className="inputConcept"
                  placeholder={t("crearGastoIndividual.placeholderCon")}
                  type="text"
                  name="concepto"
                  onChange={handleChange}
                  value={inputValues.concepto}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0.01" //Forzado a 0.01 para no crear entradas de gastos de 0.00€.
                  values={inputValues.importe}
                  name="importe"
                  placeholder={t("crearGastoIndividual.placeholderImp")}
                  onChange={handleChange}
                  className="inputMoney"
                  required
                />
                <select
                  className="inputCurrency"
                  name="currency"
                  onChange={(e)=>setCurrency(e.target.value)}
                  value={currency}
                  required
                >
                        <option value={"EUR"}>EUR</option>
                        <option value={"USD"}>USD</option>
                        <option value={"GBP"}>GBP</option>
                        <option value={"JPY"}>JPY</option>
                        <option value={"CHF"}>CHF</option>
                </select>
                <input
                  type="date"
                  className="inputDate"
                  name="inputDate"
                  onChange={handleChange}
                  value={inputValues.inputDate}
                  required
                />
                <div className="warningMessage">
                  <p style={{ color: themeColor, transition: "all .5s ease" }}>
                    {message}
                  </p>
                </div>
                <input
                  style={{ background: themeColor, transition: "all .5s ease" }}
                  className="submitButton"
                  type="submit"
                  value={t("crearGastoIndividual.submit")}
                />
              </form>
            </div>
          </div>
        </div>
      </I18nextProvider>
    </>
  );
};

export default CrearGastoIndividual;
