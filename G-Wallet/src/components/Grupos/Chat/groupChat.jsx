import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Firestore
import {
  getDoc,
  getDocs,
  doc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../../../firebase/index";
// Hooks
import useAuth from "../../../hooks/useAuth";
// Images
import PayedIcon from "../../../assets/pay-money-icon.svg";
import PayIcon from "../../../assets/hand-money-income-note-icon.svg";

// Styles
import "./groupChat.css";
// Utils
import { makeRandomId } from "../../../utils/randomID";
import {
  splitExpenses,
  getExpense,
  updateTransaction,
} from "../../../redux/slices/transactionsSlice";
// Language
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const GroupChat = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState(null);
  const navigate = useNavigate();
  const docId = useParams().groupID;
  const userId = user;
  const [showSelect, setShowSelect] = useState(false);
  const [selectedUserPayment, setSelectedPayment] = useState(null);

  //console.log(docId)
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  // Add a new state variable to track the selected transaction
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    // Obtiene los mensajes del chat
    getMessages();
    getTransaccion();
    // Escucha en tiempo real los cambios en la colección de Chat
    const unsubscribe = onSnapshot(doc(firestore, "Chat", docId), (docSnap) => {
      if (docSnap.exists()) {
        const messages = docSnap.data().messages || [];
        const lastMessages = messages.slice(-25);
        setMessages(lastMessages);
      } else {
        setMessages([]);
      }
    });

    // Cancela la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Log the value of transacciones whenever it changes
    console.log(transacciones);
  }, [transacciones]);

  const getTransaccion = async () => {
    const docRefGrupo = doc(firestore, "Grupos", docId);
    const docSnapGrupo = await getDoc(docRefGrupo);
    //console.log(docSnapGrupo.data())

    const docRef = doc(
      firestore,
      "Transacciones",
      docSnapGrupo.data().transacciones
    );
    const docSnap = await getDoc(docRef);
    await setTransacciones(docSnap.data().transacciones);
    //console.log(docSnap.data().transacciones);
    //console.log(transacciones);// Muestra el resultado por consola

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
    //console.log("id", id)
    const nameUser = usuarios.find((user) => user.id === id);
    //console.log(nameUser)
    return nameUser ? nameUser.nombre : null;
  }

  const handleSendMessage = async () => {
    // Comprueba si los valores están definidos y son válidos
    if ((user && (inputValue || selectedTransaction)) || selectedTransaction) {
      // Comprueba si el documento existe
      const docRef = doc(firestore, "Chat", docId);
      const docSnap = await getDoc(docRef);

      // Create a new message object
      const newMessage = {
        author: user,
        message: inputValue,
        timestamp: new Date(),
      };

      // If a transaction is selected, add additional properties to the message
      if (selectedTransaction) {
        newMessage.solicitarPago = true;
        newMessage.idDebe = selectedUserPayment;
      }

      if (docSnap.exists()) {
        // Actualiza el documento de Chat en Firebase
        await updateDoc(docRef, {
          messages: arrayUnion(newMessage),
        });
      } else {
        // Crea el documento de Chat en Firebase
        await setDoc(docRef, {
          messages: [newMessage],
        });
      }
      setInputValue("");
      setSelectedTransaction(false);
    } else {
      // Muestra un mensaje de error al usuario
      console.error("Error: Los valores no están definidos o no son válidos");
    }
  };

  const getMessages = async () => {
    const docSnap = await getDoc(doc(firestore, "Chat", docId));
    if (docSnap.exists()) {
      const messages = docSnap.data().messages || [];
      // Obtiene solo los últimos 25 mensajes
      const lastMessages = messages.slice(-25);
      setMessages(lastMessages);
    } else {
      // El documento no existe
      setMessages([]);
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="groupPage">
        <div className="groupPageChat">
          {/* Muestra los mensajes */}
          <div className="messagesContainerChat">
            {messages &&
              messages.map((message, index) => (
                <>
                  {message.solicitarPago === true ? (
                    <div
                      key={index}
                      className={`${"messageChat"} ${"globalMessageChat"}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <img
                          src={PayIcon}
                          alt="Pay Money Icon"
                          style={{
                            width: "15%",
                            height: "auto",
                            margin: "20px",
                            filter: "invert(1)",
                          }}
                        />
                        <div style={{ textAlign: "left" }}>
                          Estimado/a{" "}
                          <span
                            style={{ fontWeight: "bold", color: "#ff0000" }}
                          >
                            {getUserName(message.idDebe)}
                          </span>
                          , se le recuerda que tiene un pago pendiente de{" "}
                          <span
                            style={{ fontWeight: "bold", color: "#ff0000" }}
                          >
                            {message.message}€
                          </span>{" "}
                          a{" "}
                          <span
                            style={{ fontWeight: "bold", color: "#ff0000" }}
                          >
                            {getUserName(message.author)}
                          </span>
                          .
                        </div>
                      </div>
                    </div>
                  ) : message.solicitarPago === false ? (
                    <div
                      key={index}
                      className={`${"messageChat"} ${"globalMessageChat2"}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <img
                          src={PayedIcon}
                          alt="Payed Money Icon"
                          style={{
                            width: "15%",
                            height: "auto",
                            margin: "10px",
                            filter: "invert(1)",
                          }}
                        />
                        <div style={{ textAlign: "left" }}>
                          Estimado/a{" "}
                          <span
                            style={{
                              fontWeight: "bold",
                              color: "lightskyblue",
                            }}
                          >
                            {getUserName(message.idRecibe)}
                          </span>
                          , ha recibido un pago de{" "}
                          <span
                            style={{
                              fontWeight: "bold",
                              color: "lightskyblue",
                            }}
                          >
                            {message.message}€
                          </span>{" "}
                          de{" "}
                          <span
                            style={{
                              fontWeight: "bold",
                              color: "lightskyblue",
                            }}
                          >
                            {getUserName(message.author)}
                          </span>
                          .
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className={`${"messageChat"} ${
                        message.author === user
                          ? "myMessageChat"
                          : "otherMessageChat"
                      }`}
                    >
                      {
                        <div
                          className="userNameMessageChat"
                          style={{ fontSize: "10px" }}
                        >
                          {getUserName(message.author)}:
                        </div>
                      }
                      {message.message}
                    </div>
                  )}
                </>
              ))}
          </div>

          <div className="inputContainerChat">
            <button
              className="solicitar"
              onClick={() => setShowSelect(!showSelect)}
            >
              {showSelect ? t("Go to Chat") : t("Solicitar pago")}
            </button>
            {showSelect && transacciones && (
              <>
                {transacciones.some((t) => t.usuarioRecibe === user) ? (
                  <select
                    value={selectedTransaction}
                    onChange={(e) => {
                      setSelectedTransaction(e.target.value);
                      setSelectedPayment(
                        e.target.selectedOptions[0].dataset.usuariodebe
                      );
                      if (e.target.value) {
                        setInputValue(e.target.value);
                      }
                    }}
                    style={{ flex: 8 }}
                  >
                    <option value="Select payment">
                      {t("selecciona un pago")}
                    </option>
                    {transacciones &&
                      transacciones
                        .filter((t) => t.usuarioRecibe === user)
                        .map((t) => (
                          <option
                            key={t.usuarioDebe}
                            value={t.cantidad}
                            data-usuariodebe={t.usuarioDebe}
                          >
                            {getUserName(t.usuarioDebe)} owes you {t.cantidad}
                          </option>
                        ))}
                  </select>
                ) : (
                  <div style={{ fontWeight: "bold", top: "10px" }}>
                    {t("NO TE DEBEN DINERO")}
                  </div>
                )}
              </>
            )}

            {!showSelect && (
              <input
                className="inputChat"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}

            <button className="enviarChat" onClick={handleSendMessage}>
              {t("Enviar")}
            </button>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
};

export default GroupChat;
