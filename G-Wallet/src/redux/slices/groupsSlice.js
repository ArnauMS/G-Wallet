import { createSlice } from "@reduxjs/toolkit";
import { firestore } from "../../firebase/index";
import {
  collection,
  where,
  orderBy,
  getDocs,
  getDoc,
  query,
  arrayUnion,
  arrayRemove,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/index.js";
import { makeRandomId } from "../../utils/randomID";

const initialState = {
  groups: [],
  isLoading: false,
  error: "",
  lastModified: null,
  modified: false,
  created: false
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    getGroupsStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    getGroupsSuccess: (state, action) => {
      state.isLoading = false;
      state.groups = action.payload;
    },
    getGroupsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createGroupStart: (state) => {
      state.isLoading = true;
      state.error = "";
      state.created = true;
    },
    createGroupSuccess: (state) => {
      state.isLoading = false;
      state.lastModified = Date.now();
      state.created = false;
    },
    createGroupFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.created = false;
    },
    modifyGroupStart: (state) => {
      state.isLoading = true;
      state.error = "";
      state.modified = true;
    },
    modifyGroupSuccess: (state) => {
      state.isLoading = false;
      state.lastModified = Date.now();
      state.modified = false;
    },
    modifyGroupFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.modified = false;
    },
  },
});

export const {
  getGroupsStart,
  getGroupsSuccess,
  getGroupsFailure,
  createGroupStart,
  createGroupSuccess,
  createGroupFailure,
  modifyGroupStart,
  modifyGroupSuccess,
  modifyGroupFailure,
} = groupsSlice.actions;

export const getGroups = (user) => async (dispatch) => {
  dispatch(getGroupsStart());
  try {
    const gruposRef = collection(firestore, "Grupos");
    const q = query(
      gruposRef,
      where("participantes", "array-contains", user),
      orderBy("nombre", "asc")
    );
    const gruposInformation = await getDocs(q);
    if (gruposInformation.empty) {
      dispatch(getGroupsSuccess([]));
    }
    const newGroups = gruposInformation.docs.map((doc) => {
      return {
        id: doc.id,
        nombre: doc.data().nombre,
        admin: doc.data().admin === user,
        participantes: doc.data().participantes,
        gastos: doc.data().gastos,
        transacciones: doc.data().transacciones,
      };
    });
    dispatch(getGroupsSuccess(newGroups));
  } catch (error) {
    console.error(error);
    dispatch(getGroupsFailure(error.message));
  }
};

export const createGroup = (user, name, email) => async (dispatch) => {
  dispatch(createGroupStart());
  try {
    const id = makeRandomId(20);
    const idTransaccions = makeRandomId(20)
    const data = {
      nombre: name,
      admin: user,
      participantes: [user],
      gastos: [],
      transacciones: idTransaccions,
      chat: id
    };
    await setDoc(doc(firestore, "Grupos", id), data);

    await setDoc(doc(firestore, "Transacciones", idTransaccions), {});

    await setDoc(doc(firestore, "Chat", id), {});

    await updateDoc(doc(firestore, "Usuarios", user), {
      grupos: arrayUnion(id),
    });

    httpsCallable(
      functions,
      "sendMail"
    )({ mail: email, groupID: id, groupName:name});

    dispatch(createGroupSuccess(data));
  } catch (error) {
    console.error(error);
    dispatch(createGroupFailure(error.message));
  }
};

export const actualizarGrupo =
  (
    groupID,
    name,
    participants,
    participantesOriginales,
    participantesID,
    transacciones
  ) =>
    async (dispatch) => {
      console.log(
        groupID,
        name,
        participants,
        participantesOriginales,
        participantesID,
        transacciones
      );
      dispatch(modifyGroupStart());
      try {        
        participants.forEach((participant) => {
          participantesOriginales.forEach(async (participantO, index) => {
            if (participant == participantO) {
              await updateDoc(doc(firestore, "Usuarios", participantesID[index]), {
                grupos: arrayRemove(groupID),
              });

              if (participantesOriginales.length == 1) {
                const groupDoc = doc(firestore, "Grupos", groupID);
                await deleteDoc(groupDoc);
              }
              
              if (transacciones != "") {
                const transDoc = doc(firestore, "Transacciones", transacciones);
                const transaccionesRef = (await getDoc(transDoc)).data();
                const transaccionesFinales = transaccionesRef.transacciones.filter((transaccion) =>
                  transaccion.usuarioDebe !== participantesID[index]
                  && transaccion.usuarioRecibe !== participantesID[index]
                );

                await updateDoc(doc(firestore, "Transacciones", transacciones), {
                  transacciones: transaccionesFinales
                })

                if (transaccionesFinales.length == 0) {
                  await deleteDoc(transDoc);
                  await updateDoc(doc(firestore, "Grupos", groupID), {
                    participantes: arrayRemove(participantesID[index]),
                    transacciones: ""
                  });
                } else {
                  await updateDoc(doc(firestore, "Grupos", groupID), {
                    participantes: arrayRemove(participantesID[index])
                  });
                }
              } else {
                await updateDoc(doc(firestore, "Grupos", groupID), {
                  participantes: arrayRemove(participantesID[index])
                });
              }
            }
          });
        });
        await updateDoc(doc(firestore, "Grupos", groupID), {
          nombre: name,
        });
        dispatch(modifyGroupSuccess());
      } catch (error) {
        console.error(error);
        dispatch(modifyGroupFailure(error.message));
      }
    };

export default groupsSlice.reducer;
