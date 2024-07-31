import { createSlice } from "@reduxjs/toolkit";
import { firestore } from "../../firebase/index";
import {
  collection,
  orderBy,
  getDocs,
  doc,
  addDoc,
  query,
  arrayUnion,
  getDoc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";

const initialState = {
  expenses: [],
  isLoading: false,
  error: "",
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    getExpensesStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    getExpensesSuccess: (state, action) => {
      state.isLoading = false;
      state.expenses = action.payload;
    },
    getExpensesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createExpensesStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    createExpensesSuccess: (state, action) => {
      state.isLoading = false;
      state.expenses = action.payload;
    },
    createExpensesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    deleteExpensesStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    deleteExpensesSuccess: (state, action) => {
      state.isLoading = false;
      state.expenses = action.payload;
    },
    deleteExpensesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateExpensesStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
  },
});

export const {
  getExpensesStart,
  getExpensesSuccess,
  getExpensesFailure,
  createExpensesStart,
  createExpensesFailure,
  createExpensesSuccess,
  deleteExpensesStart,
  deleteExpensesSuccess,
  deleteExpensesFailure,
  updateExpensesStart,
} = expensesSlice.actions;

async function getTotals(userID) {
  const q = query(
    collection(firestore, "Categorias"),
    where("userid", "==", userID)
  );
  const querySnapshot = await getDocs(q);
  let totalLimite = 0;
  querySnapshot.forEach((doc) => {
    const categoriaData = doc.data();
    totalLimite += categoriaData.limite || 0;
  });

  const q2 = query(
    collection(firestore, "Gastos_indv"),
    where("userid", "==", userID)
  );
  const querySnapshot2 = await getDocs(q2);
  let totalgastos = 0;
  querySnapshot2.forEach((doc) => {
    const categoriaData = doc.data();
    totalgastos += categoriaData.cantidad || 0;
  });

  return { totalLimite, totalgastos };
}

export const deleteExpenses = (userID, selectedNombre) => async (dispatch) => {
  dispatch(deleteExpensesStart());
  const gastosRef = doc(collection(firestore, "Gastos_indv"), selectedNombre);
  await deleteDoc(gastosRef);

  const categoriasRef = collection(firestore, "Categorias");
  const usuariosRef = collection(firestore, "Usuarios");
  const q = query(
    categoriasRef,
    where("gastos", "array-contains", selectedNombre)
  );

  const usuarioDoc = doc(usuariosRef, userID);
  const usuarioData = (await getDoc(usuarioDoc)).data();

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docu) => {
    const categoriaId = docu.id;
    const categoriaRef = doc(categoriasRef, categoriaId);
    const categoriaData = docu.data();
    const nuevosGastos = categoriaData.gastos.filter(
      (id) => id !== selectedNombre
    );
    if (nuevosGastos.length === 0) {
      await deleteDoc(categoriaRef);
      const nuevosGastosUsuario = usuarioData.gastos_Ind.filter(
        (id) => id !== categoriaId
      );
      await updateDoc(usuarioDoc, { gastos_Ind: nuevosGastosUsuario });
    } else {
      await updateDoc(categoriaRef, { gastos: nuevosGastos });
    }
  });


  
    const { totalLimite, totalgastos } = await getTotals(userID);

    const usuariosRefe = doc(firestore, "Usuarios", userID);
    await updateDoc(usuariosRefe, {
      saldo: totalLimite - totalgastos,
      gastos: totalgastos,
    });

 
  
};

export const updateExpenses =
  (user, nombremod, cantidadmod, fechamod, gastoid) => async (dispatch) => {
    dispatch(updateExpensesStart());
    const cantidadnumero = parseFloat(cantidadmod);
    const gastoRef = doc(collection(firestore, "Gastos_indv"), gastoid);
    if (nombremod !== "") {
      updateDoc(gastoRef, { nombre: nombremod });
    }

    if (fechamod !== "") {
      updateDoc(gastoRef, { fecha: fechamod });
    }

    if (cantidadmod !== "") {
      updateDoc(gastoRef, { cantidad: cantidadnumero });
    }

    const { totalLimite, totalgastos } = await getTotals(user);

    const usuariosRefe = doc(firestore, "Usuarios", user);
    await updateDoc(usuariosRefe, {
      saldo: totalLimite - totalgastos,
      gastos: totalgastos,
    });

  };

export const getExpenses = (user) => async (dispatch) => {
  dispatch(getExpensesStart());
  try {
    const gastosRef = collection(firestore, "Gastos_Grupales");
    const q = query(
      gastosRef,
      where("userid", "==", user),
      orderBy("fecha", "asc")
    );
    const gastosData = await getDocs(q);
    if (gastosData.empty) {
      dispatch(getExpensesSuccess([]));
      return;
    }
    const gastosArray = [];
    gastosData.forEach((doc) => {
      const data = {
        id: doc.id,
        nombre: doc.data().nombre,
        cantidad: doc.data().cantidad,
        categoria: doc.data().categoria,
        fecha: doc.data().fecha,
      };
      gastosArray.push(data);
    });
    dispatch(getExpensesSuccess(gastosArray));
  } catch (error) {
    console.log(error);
    dispatch(getExpensesFailure(error.message));
  }
};

export const createExpenses =
  (selectedCategoria, name, date, expense, userID) => async (dispatch) => {
    dispatch(createExpensesStart());
    try {
      const nuevoGasto = {
        fecha: date,
        cantidad: expense,
        nombre: name,
        userid: userID,
        categoria: selectedCategoria,
      };

      const gastosRef = await addDoc(
        collection(firestore, "Gastos_indv"),
        nuevoGasto
      );
      const gastoId = gastosRef.id;

      const categoriasRef = collection(firestore, "Categorias");
      const querySnapshot = await getDocs(
        query(
          categoriasRef,
          where("userid", "==", userID),
          where("nombre", "==", selectedCategoria)
        )
      );
      const categoriaDoc = querySnapshot.docs[0];

      if (!categoriaDoc) {
        const nuevaCategoria = {
          userid: userID,
          nombre: selectedCategoria,
          limite: 250,
          gastos: [gastoId],
        };

        const categoriaRef = await addDoc(categoriasRef, nuevaCategoria);
        const categoriaId = categoriaRef.id;

        const { totalLimite, totalgastos } = await getTotals(userID);

        const usuariosRef = doc(firestore, "Usuarios", userID);
        await updateDoc(usuariosRef, {
          gastos_Ind: arrayUnion(categoriaId),
          saldo: totalLimite - totalgastos,
          gastos: totalgastos,
        });
      } else {
        const categoriaRef = categoriaDoc.ref;
        await updateDoc(categoriaRef, {
          gastos: arrayUnion(gastoId),
        });

        const categoriaId = categoriaDoc.id;

        const { totalLimite, totalgastos } = await getTotals(userID);

        const usuariosRef = doc(firestore, "Usuarios", userID);
        await updateDoc(usuariosRef, {
          gastos_Ind: arrayUnion(categoriaId),
          saldo: totalLimite - totalgastos,
          gastos: totalgastos,
        });
      }
    } catch {
      console.log(error);
    }

    async function getTotals(userID) {
      const q = query(
        collection(firestore, "Categorias"),
        where("userid", "==", userID)
      );
      const querySnapshot = await getDocs(q);
      let totalLimite = 0;
      querySnapshot.forEach((doc) => {
        const categoriaData = doc.data();
        totalLimite += categoriaData.limite || 0;
      });

      const q2 = query(
        collection(firestore, "Gastos_indv"),
        where("userid", "==", userID)
      );
      const querySnapshot2 = await getDocs(q2);
      let totalgastos = 0;
      querySnapshot2.forEach((doc) => {
        const categoriaData = doc.data();
        totalgastos += categoriaData.cantidad || 0;
      });

      return { totalLimite, totalgastos };
    }
  };

export default expensesSlice.reducer;
