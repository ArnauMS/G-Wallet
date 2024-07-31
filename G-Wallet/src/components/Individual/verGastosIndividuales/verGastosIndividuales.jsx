import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { firestore } from "../../../firebase/index.js";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  getDoc,
} from "firebase/firestore";
import useAuth from "../../../hooks/useAuth";
import "./verGastosIndividuales.css";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const VerGastosIndividuales = (props) => {
  const shownExpenses = props.shownExpenses;

  const { t } = useTranslation();
  const [currency, setCurrency] = useState('EUR');
  const [categoriesTraducidas, setCategoriesTraducidas] = useState([]);
  const [categories, setCategories] = useState(["Category1", "Category2"]);
  const [wastedMessage, setWastedMessage] = useState('0 de 3000€');
  const [userCategoriesInfo, setUserCategoriesInfo] = useState(null);
  const userID = useAuth().user;
  const [dataToRepresent, setDataToRepresent] = useState(null);

  // Add conversion rates and currency symbols
  async function updateConversionRates() {
    // Define the currencies to fetch conversion rates for
    const currencies = Object.keys(conversionRates);

    // Fetch the latest conversion rates for each currency
    for (const currency of currencies) {
      if (currency !== 'EUR') {
        const response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/${currency.toLowerCase()}.json`);
        const conversionData = await response.json();
        conversionRates[currency] = conversionData[currency.toLowerCase()];
      }
    }

    // Log the updated conversion rates
    // console.log(conversionRates);
  }

  // Define the initial conversion rates
  const conversionRates = { EUR: 1, USD: 1.07, GBP: 0.86, JPY: 149.70, CHF: 0.97 };

  // Update the conversion rates with the latest values from the API
  updateConversionRates();

  const currencySymbols = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF'
  };

  useEffect(() => {
    async function getCollectionData(collectionName) {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      const documents = querySnapshot.docs.map((doc) => doc.data());
      return documents[0].name;
    }

    const categories = [
      "Alimentación",
      "Salud y Belleza",
      "Ocio",
      "Hogar",
      "Compras y Servicios",
      "Viajes",
      "Transporte",
      "Finanzas",
      "Educación",
      "Otros",
      "Moda",
      "Supermercado"];
    setCategories(categories);

    const translated = categories.map(categoria => t(`categorias.${categoria}`));
    setCategoriesTraducidas(translated);

  }, []);

  useEffect(() => {
    async function getWastedFromArray(array) {
      let wasted = 0.0;
      if (array != undefined) {
        for (let i = 0; i < array.length; i++) {
          const id = array[i];
          const data = await getDoc(doc(firestore, "Gastos_indv", id));

          let expense = data.data()?.cantidad;

          if (expense != undefined) {
            wasted += expense;
          }
        }
      }
      return wasted;
    }

    function completeCategories(categoriesInfo) {
      categories.forEach(category => {
        if (categoriesInfo[category] == undefined) {
          categoriesInfo[category] = {
            limite: 250,
            gastos: 0,
            inBD: false,
          };
        }
      });
      return categoriesInfo;
    }

    async function getUserCategoryInfo() {
      const querySnapshot = await getDocs(
        query(collection(firestore, "Categorias"), where("userid", "==", userID))
      );

      const queryDocs = querySnapshot.docs;
      let categoriesInfo = {};
      for (let i = 0; i < queryDocs.length; i++) {
        const data = queryDocs[i].data();
        const dataToState = {
          limite: data.limite,
          gastos: await getWastedFromArray(data.gastos),
          inBD: true,
        }
        categoriesInfo[data.nombre] = dataToState;
      }
      categoriesInfo = completeCategories(categoriesInfo);
      setUserCategoriesInfo(categoriesInfo);
    }
    // Guardar la información de los gastos y categorías del usuario en el estado local
    getUserCategoryInfo();
  }, [categories]);

  useEffect(() => {
    let totalLimit = 0.0;
    let wasted = 0.0;
    let arrayToPush = []

    if (categories.length != 2) {
      categories.forEach(categoria => {
        totalLimit += parseFloat(userCategoriesInfo[categoria]?.limite);
        wasted += userCategoriesInfo[categoria]?.gastos;
        arrayToPush.push(userCategoriesInfo[categoria]?.gastos)
      });
    }

    // Convert values to the selected currency
    totalLimit *= parseFloat(conversionRates[currency]).toFixed(2);
    wasted *= parseFloat(conversionRates[currency]).toFixed(2);
    arrayToPush = arrayToPush.map(value => value * conversionRates[currency]);

    setWastedMessage(`${wasted.toFixed(2)} / ${totalLimit.toFixed(2)} ${currencySymbols[currency]}`);

    setDataToRepresent(arrayToPush);
  }, [userCategoriesInfo, currency]);

  // Add an effect to update the chart and messages when the selected currency changes
  useEffect(() => {
    // TODO: Call an API to get real-time currency conversion rates and update the chart and messages with the converted values
  }, [currency]);

  function setDoughnutData() {
    let dataArr = []

    for (let i = 0; i < categoriesTraducidas.length; i++) {
      const categoria = categoriesTraducidas[i];
      const categoriaData = shownExpenses[categoria];
      if (categoriaData == undefined) {
        dataArr.push(0);
      } else {
        let wasted = 0.0;
        for (let j = 0; j < categoriaData.length; j++) {
          wasted += categoriaData[j].cantidad;
        }
        dataArr.push(wasted);
      }
    }
    return dataArr;
  }

  const data = {
    labels: categoriesTraducidas,
    datasets: [{
      label: 'Has gastado',
      data: setDoughnutData(),
      backgroundColor: [
        '#FF6C4D',
        '#97FF4D',
        '#4DFF80',
        '#4DFFDC',
        '#4D98FF',
        '#7D4DFF',
        '#ED4DFF',
        '#FF4D89',
        '#8F8085',
        '#0B7955',
        '#E0EA35',
        '#FF7400',
        '#000000' // Si sale algo raro, se verá en negro
      ],
    }]
  }

  const options = {}

  return (
    <>
      <div>
        <div id="doughnutInfo">
          <Doughnut
            data={data}
            options={options}
            id="doughnut"
          > </Doughnut>
          <p id="centerOfDoughnut" className='centerOfDoughnut'> {wastedMessage}</p>
        </div>
      </div>
      <select id="selector-divisa" onChange={e => setCurrency(e.target.value)}>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
        <option value="CHF">CHF</option>
      </select>
    </>
  )
}

export default VerGastosIndividuales
