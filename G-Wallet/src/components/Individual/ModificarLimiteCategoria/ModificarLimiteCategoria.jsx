// Firebase
import { firestore } from "../../../firebase/index.js";
import {
    collection,
    getDocs,
    where,
    query,
    updateDoc,
    doc,
    getDoc,
    addDoc,
} from "firebase/firestore";

// Hooks
import useAuth from "../../../hooks/useAuth";

// React
import { useEffect, useState } from 'react';

// Styles
import "./ModificarLimiteCategoria.css"
import { Navigate } from "react-router-dom";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n.js";

const ModificarLimiteCategoria = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState(["Category1", "Category2"]);
    const [userCategoriesInfo, setUserCategoriesInfo] = useState(null);
    const [formValues, setFormValues] = useState({
        selectedCategory: "Alimentación",
        newLimit: 0,
    });
    const [shownMessages, setShownMessages] = useState({
        buttonMessage: 'Modificar',
        textMessage: 'Quiero modificar el límite de una categoría',
        wastedMessage: '0 de 3000€',
    });
    const userID = useAuth().user;
    const [showPopup, setShowPopUp] = useState(false);

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

        if (categories.length != 2) {
            categories.forEach(categoria => {
                totalLimit += userCategoriesInfo[categoria]?.limite;
                wasted += userCategoriesInfo[categoria]?.gastos;
            });
        }

        setShownMessages({
            buttonMessage: shownMessages.buttonMessage,
            textMessage: shownMessages.textMessage,
            wastedMessage: wasted + ' / ' + totalLimit + ' €',
        })
    }, [userCategoriesInfo]);

    function updateLocalStatus() {
        userCategoriesInfo[formValues.selectedCategory] = {
            limite: parseFloat(formValues.newLimit),
            gastos: userCategoriesInfo[formValues.selectedCategory].gastos,
            inBD: true,
        };
    }

    async function updateCategoryLimit() {
        if (!userCategoriesInfo[formValues.selectedCategory].inBD) {
            // Si no tiene la categoría creada en la BD, crea una nueva con el array de gastos vacío. 
            const colRef = collection(firestore, "Categorias");
            const data = {
                gastos: [],
                limite: parseFloat(formValues.newLimit),
                nombre: formValues.selectedCategory,
                userid: userID,
            }

            addDoc(colRef, data);
            alert(<I18nextProvider i18n={i18n}>{t('modificarLimiteCategoria.alerta1')}</I18nextProvider>);
        } else {
            const q = query(collection(firestore, "Categorias"),
                where("userid", "==", userID),
                where("nombre", "==", formValues.selectedCategory)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docRef = doc(querySnapshot.docs[0].ref.firestore, `Categorias/${querySnapshot.docs[0].id}`);
                await updateDoc(docRef, {
                    limite: formValues.newLimit,
                });
                alert(<I18nextProvider i18n={i18n}>{t('modificarLimiteCategoria.alerta2')}</I18nextProvider>);
            } else {
                alert(<I18nextProvider i18n={i18n}>{t('modificarLimiteCategoria.alerta3')}</I18nextProvider>);
            }
        }
    }

    const handleSubmit = () => {
        if (formValues.newLimit != 0) {
            updateCategoryLimit();
            updateLocalStatus();
            setUserCategoriesInfo(userCategoriesInfo);
        } else {
            alert(<I18nextProvider i18n={i18n}>{t('modificarLimiteCategoria.alerta4')}</I18nextProvider>, formValues.selectedCategory);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    }

    const handleCategoryClick = (categoria) => {
        setFormValues({
            newLimit: formValues.newLimit,
            selectedCategory: categoria,
        });
    }

    return (
        <I18nextProvider i18n={i18n}>
            <><div className="flex-modifyCategoryLimit">
                <h2>{t('modificarLimiteCategoria.titulo')}</h2>
                <div className="category-list">
                    {
                        categories.map((categoria) => (
                            <div
                                key={categoria}
                                className={`category ${formValues.selectedCategory == categoria ? "selected" : ""}`}
                                onClick={() => handleCategoryClick(categoria)}
                            > {t(`categorias.${categoria}`)} </div>
                        ))
                    }
                </div>
                <input type="number" min="0.01" step="0.01" name="newLimit" onChange={handleChange} placeholder={t('modificarLimiteCategoria.placeholderLimite')} required />
                <p>{t('modificarLimiteCategoria.gastado')}&nbsp;
                    {
                        userCategoriesInfo == null ? 0 : (
                            userCategoriesInfo[formValues.selectedCategory] == undefined ? 0 :
                                userCategoriesInfo[formValues.selectedCategory].gastos
                        )
                    }
                    € {t('modificarLimiteCategoria.de')}&nbsp;
                    {
                        userCategoriesInfo == null ? 0 : (
                            userCategoriesInfo[formValues.selectedCategory] == undefined ? 0 :
                                userCategoriesInfo[formValues.selectedCategory].limite
                        )
                    }
                    € {t('modificarLimiteCategoria.categoria')} {formValues.selectedCategory}
                </p>
                <br />
                <div className="confirmButton" onClick={handleSubmit}>
                {t('modificarLimiteCategoria.confirmar')}
                </div>
            </div></>
        </I18nextProvider>
    )
}

export default ModificarLimiteCategoria;