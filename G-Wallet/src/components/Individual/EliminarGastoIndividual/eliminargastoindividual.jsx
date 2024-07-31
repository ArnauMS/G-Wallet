
import React, { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { firestore } from "../../../firebase/index.js";
import {
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import "./eliminargastoindividual.css";

//redux
import { useDispatch } from "react-redux";
import { deleteExpenses} from "../../../redux/slices/expensesSlice";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const EliminarGastoIndividual = () => {
  const { t } = useTranslation();
  const [datos, setDatos] = useState([{}]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedNombre, setSelectedNombre] = useState("");
  const userID = useAuth().user;
  const dispatch = useDispatch();

  useEffect(() => {

    const obtenerCategoriasPorIds = async (ids) => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'Categorias'));
        const documentos = querySnapshot.docs.filter(doc => ids.some(id => id === doc.id)).map(doc => ({ id: doc.id, ...doc.data() }));
        setCategorias(documentos);
        const gastos = documentos.filter(doc => Object.hasOwnProperty.call(doc, 'gastos')).map(doc => doc.gastos);
        const nombres = documentos.filter(doc => Object.hasOwnProperty.call(doc, 'nombre')).map(doc => doc.nombre);
        setCategorias(nombres);
        return nombres;
      } catch (error) {
        console.error(<I18nextProvider i18n={i18n}>{t('eliminarGastoIndividual.error1')}</I18nextProvider>, error);
      }
    };
  
    const obtenerDatos = async () => {
      try {
        const miColeccionRef = collection(firestore, 'Usuarios');
        const docRef = doc(miColeccionRef, userID);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        console.log(data.gastos_Ind);
        const info = await obtenerCategoriasPorIds(data.gastos_Ind); // Espera a que obtenerCategoriasPorIds se complete

        const gastosRef = collection(firestore, 'Gastos_indv');
        const expenses = await Promise.all(
          info.map(async (name) => {
            const quer = await getDocs(
              query(gastosRef, where("categoria", "==", name), where('userid', '==', userID))
            );
            const data = quer.docs.map((doc) => {
              const docData = doc.data();
              return { docid: doc.id, ...docData };
            });
            const docids = quer.docs.map((doc) => doc.id);
            return { name, data, docids };
          })
        );
        setDatos(expenses);
      } catch (error) {
        console.log(<I18nextProvider i18n={i18n}>{t('eliminarGastoIndividual.error1')}</I18nextProvider>, error);
      }
    };
  
    obtenerDatos(); // Llama a obtenerDatos para esperar a que se complete antes de llamar a obtenerCategoriasPorIds
  }, []);
  

  const handleCategoriaChange = (event) => {
    setSelectedCategoria(event.target.value);
    setSelectedNombre("");
  };

  const handleNombreChange = (event) => {
    setSelectedNombre(event.target.value);
  };

  const handleEliminarGasto = async () => {
    dispatch(deleteExpenses(userID,selectedNombre));
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div>

        {/* Renderizar el select solo si hay datos en datos */}
        {datos.length > 0 ? (
          <div className="Deleteform">
            <h1 className="title"> {t('eliminarGastoIndividual.titulo')} </h1>
            <label htmlFor="categoriasSelect"> {t('eliminarGastoIndividual.subtitulo1')} </label>
            <select
              id="categoriasSelect"
              value={selectedCategoria}
              onChange={handleCategoriaChange}
            >
              <option className="categories" value="">{t('eliminarGastoIndividual.categorias')}</option>
              {datos.map((categoria) => (
                <option key={categoria.name}>
                  {categoria.name}
                </option>
              ))}
            </select>
            {selectedCategoria && (
              <div>
                <label htmlFor="nombresSelect">{t('eliminarGastoIndividual.subtitulo2')}</label>
                <select
                  id="nombresSelect"
                  value={selectedNombre}
                  onChange={handleNombreChange}
                >
                  <option className="gastos" value="">{t('eliminarGastoIndividual.gastos')}</option>
                  {datos.map((dato, index) => {
                    if (dato.name === selectedCategoria && dato.data) {
                      return dato.data.map((nom, nombreIndex) => (
                        <option key={nom.docids} value={dato.docids[nombreIndex]}>
                          {nom.nombre}
                        </option>
                      ));
                    }
                  })}
                </select>
                <div>
                  <button onClick={handleEliminarGasto}>{t('eliminarGastoIndividual.eliminar')}</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>{t('eliminarGastoIndividual.vacio')}</p>
          </div>
        )}
      </div>
    </I18nextProvider>
  );
};

export default EliminarGastoIndividual;
