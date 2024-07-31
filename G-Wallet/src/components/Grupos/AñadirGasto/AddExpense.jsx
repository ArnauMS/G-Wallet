import React, { useState, useEffect } from "react";
import { firestore } from "../../../firebase/index";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  collection,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import "./addexpense.css";
import { splitExpenses, getExpense, updateTransaction } from "../../../redux/slices/transactionsSlice";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

function AddExpense() {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState([]);
  const [concept, setConcept] = useState("");
  const [amounts, setAmounts] = useState({});
  const [currency, setCurrency] = useState("EUR");
  const [conceptError, setConceptError] = useState("");
  const [participantsError, setParticipantsError] = useState("");
  const [totalError, setTotalError] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const docId = useParams().groupID;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipants = async () => {
      const groupDocRef = doc(firestore, "Grupos", docId);
      const groupDocSnap = await getDoc(groupDocRef);
      const participantIds = groupDocSnap.data().participantes;

      const participantDocs = await Promise.all(
        participantIds.map((id) => getDoc(doc(firestore, "Usuarios", id)))
      );

      const participantsData = await Promise.all(
        participantDocs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        }))
      );
      setParticipants(participantsData);
    };

    fetchParticipants();
  }, [docId]);

  const handleAmountChange = (participantId, value) => {
    setAmounts((prevAmounts) => {
      const newAmounts = { ...prevAmounts, [participantId]: value };
      const allSelected = participants.every(
        (participant) => newAmounts[participant.id]
      );
      setSelectAll(allSelected);
      return newAmounts;
    });
  };

  const handleSelectAllChange = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      const newAmounts = {};
      participants.forEach((participant) => {
        newAmounts[participant.id] = "0.00";
      });
      setAmounts(newAmounts);
    } else {
      setAmounts({});
    }
  };

  const handleSubmit = async () => {
    if (!concept) {
      setConceptError(<I18nextProvider i18n={i18n}>{t('addExpense.error1')}</I18nextProvider>);
      return;
    } else {
      setConceptError("");
    }

    const selectedParticipants = participants.filter(
      (participant) => amounts[participant.id]
    );

    if (selectedParticipants.length < 2) {
      setParticipantsError(<I18nextProvider i18n={i18n}>{t('addExpense.error2')}</I18nextProvider>);
      return;
    } else {
      setParticipantsError("");
    }

    const totalAmount = selectedParticipants.reduce(
      (total, participant) =>
        total + (parseFloat(amounts[participant.id]) || 0),
      0
    );

    if (totalAmount <= 0) {
      setTotalError(<I18nextProvider i18n={i18n}>{t('addExpense.error3')}</I18nextProvider>);
      return;
    } else {
      setTotalError("");
    }

    let currencyValue = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur/"+currency.toLowerCase()+".json")
    let moneyConversion = await currencyValue.json()
    
    for (const key of Object.keys(amounts)) {
      amounts[key] = amounts[key]*moneyConversion[currency.toLowerCase()]
    }

    const split = splitExpenses(
      selectedParticipants.map((participant) =>
        parseFloat(amounts[participant.id])
      ),
      selectedParticipants.map((participant) => participant.id)
    );

    const currentDate = new Date();
    const expense = {
      concept,
      participantes: selectedParticipants.map((participant) => participant.id),
      cantidades: selectedParticipants.map(
        (participant) => parseFloat(amounts[participant.id]) || 0
      ),
      visitado: split,
      fecha: currentDate
    };

    const gastos = collection(firestore, "Gastos_Grupales");
    const docGastos = await addDoc(gastos, expense);

    const docIdGastos = docGastos.id;

    const groupDocRef = doc(firestore, "Grupos", docId);
    await updateDoc(groupDocRef, {
      gastos: arrayUnion(docIdGastos),
    });

    setConcept("");
    setAmounts({});
    setSelectAll(false);
    setCurrency("");

    const update = await updateTransaction(docId)
    navigate(`/dashboard/groups/${docId}`, { state: { eraseCache: true } });
    //setTimeout(() =>  {window.location = `/dashboard/groups/${docId}?eraseCache=true`;}, 300);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="groupPage">
        <div className="content">
          <p className="texto"> {t('addExpense.titulo')}</p>
          <div className="form">
            <div className="input">
              <input
                type="text"
                id="concept"
                placeholder={t('addExpense.placeholderCon')}
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
            </div>

            {conceptError && <div style={{ color: "red", textAlign:"justify"}}>{conceptError}</div>}
            <br/>
            <p className="texto" style={{ fontSize: '16px' }}>{t('addExpense.subtitulo')}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
                style={{ marginRight: "10px" }}
              />

              <label htmlFor="select-all">{t('addExpense.seleccionarTodo')}</label>
            </div>
            <div style={{ height: "1px", backgroundColor: "green", width: "100%", marginTop: "10px", marginBottom: "10px"}} />
            <ul style={{ listStyle: "none" }}>
              {participants.map((participant) => (
                <li key={participant.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
                      <input
                        type="checkbox"
                        id={participant.id}
                        checked={!!amounts[participant.id]}
                        onChange={(e) =>
                          handleAmountChange(
                            participant.id,
                            e.target.checked ? "0.00" : ""
                          )
                        }
                        style={{ marginRight: "10px" }}
                      />
                    </div>

                    <label htmlFor={participant.id}>{participant.nombre}</label>
                  </div>
                  <div className="input">
                    <input
                      type="number"
                      value={amounts[participant.id] || ""}
                      placeholder="0,00"
                      step="0.01"
                      min="0.00"
                      onChange={(e) =>
                        handleAmountChange(
                          participant.id,
                          parseFloat(e.target.value)
                        )
                      }
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value).toFixed(2);
                        handleAmountChange(participant.id, value);
                      }}
                      
                    />
                    <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="inputCurrency">
                        <option value={"EUR"}>EUR</option>
                        <option value={"USD"}>USD</option>
                        <option value={"GBP"}>GBP</option>
                        <option value={"JPY"}>JPY</option>
                        <option value={"CHF"}>CHF</option>
                    </select>
                  </div>
                </li>
              ))}
              {participantsError && (
                <div style={{ color: "red", textAlign:"justify"}}>{participantsError}</div>
              ) || totalError && (<div style={{ color: "red", textAlign:"justify"}}>{totalError}</div>)}
            </ul>
            </div>
            <div className="input">
            <button className="btnAdd" onClick={handleSubmit}>{t('addExpense.boton')}</button>
            </div>

            </div>
      </div>
    </I18nextProvider>
  );
}

export default AddExpense;
