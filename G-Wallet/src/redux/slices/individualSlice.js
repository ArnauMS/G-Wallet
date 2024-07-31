import { createSlice } from "@reduxjs/toolkit";
import { firestore } from "../../firebase/index";
import {
  collection,
  limit,
  where,
  orderBy,
  getDocs,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const initialState = {
  expenses: [],
  latestExpenses: [],
  isLoading: false,
  error: "",
};

const individualSlice = createSlice({
  name: "individual",
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
    getLatestExpensesStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    getLatestExpensesSuccess: (state, action) => {
      state.isLoading = false;
      state.latestExpenses = action.payload;
    },
    getLatestExpensesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createExpenseStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    createExpenseSuccess: (state, action) => {
      state.isLoading = false;
      state.expenses.push(action.payload);
    },
    createExpenseFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getExpensesStart,
  getExpensesSuccess,
  getExpensesFailure,
  getLatestExpensesStart,
  getLatestExpensesSuccess,
  getLatestExpensesFailure,
  createExpenseStart,
  createExpenseSuccess,
  createExpenseFailure,
} = individualSlice.actions;

export const getLatestExpenses = (user, clickvermas) => async (dispatch) => {
  dispatch(getLatestExpensesStart());
  try {
    const gastosRef = collection(firestore, "Gastos_indv");
    const q = query(
      gastosRef,
      where("userid", "==", user),
      orderBy("fecha", "asc"),
      limit(clickvermas)
    );
    const gastosData = await getDocs(q);
    if (gastosData.empty) {
      dispatch(getLatestExpensesSuccess([]));
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
    dispatch(getLatestExpensesSuccess(gastosArray));
  } catch (error) {
    console.log(error);
    dispatch(getLatestExpensesFailure(error.message));
  }
};

export const getExpenses = (userId) => async (dispatch) => {
  dispatch(getExpensesStart());
  try {
    const gastosRef = collection(firestore, "Gastos_indv");
    const q = query(
      gastosRef,
      where("userid", "==", userId),
      orderBy("fecha", "asc"),
    );
    const gastosData = await getDocs(q);
    if (gastosData.empty) {
      dispatch(getExpensesSuccess([]));
      return;
    }
    const gastosPorCategoria = {};

    gastosData.forEach((doc) => {
      const data = {
        id: doc.id,
        nombre: doc.data().nombre,
        cantidad: doc.data().cantidad,
        categoria: doc.data().categoria,
        fecha: doc.data().fecha,
      };
      if (!gastosPorCategoria[data.categoria]) {
        gastosPorCategoria[data.categoria] = [];
      }
      gastosPorCategoria[data.categoria].push(data);
    });
    console.log(gastosPorCategoria);
    dispatch(getExpensesSuccess(gastosPorCategoria));
  } catch (error) {
    console.log(error);
    dispatch(getExpensesFailure(error.message));
  }
};


export const createExpense = (userId, nombre, cantidad, categoria) => async (dispatch) => {
  dispatch(createExpenseStart());
  try {
    const expenseData = {
      nombre,
      cantidad,
      categoria,
      userid: userId,
      fecha: serverTimestamp(),
    };
    const docRef = await addDoc(collection(firestore, "Expenses"), expenseData);
    dispatch(createExpenseSuccess({ id: docRef.id, ...expenseData }));
  } catch (error) {
    console.error(error);
    dispatch(createExpenseFailure(error.message));
  }
};

export default individualSlice.reducer;
