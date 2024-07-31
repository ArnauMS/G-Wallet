// categoriesSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { firestore } from "../../firebase/index";
import { collection, where, orderBy, limit, getDocs, query } from "firebase/firestore";

const initialState = {
  categories: [],
  isLoading: false,
  error: "",
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    getCategoriesStart: (state) => {
      state.isLoading = true;
      state.error = "";
    },
    getCategoriesSuccess: (state, action) => {
      state.isLoading = false;
      state.categories = action.payload;
    },
    getCategoriesFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const { getCategoriesStart, getCategoriesSuccess, getCategoriesFailure } = categoriesSlice.actions;

export const getCategories = (user) => async (dispatch) => {
  dispatch(getCategoriesStart());
  try {
    const categoriasRef = collection(firestore, "Categorias");
    const q = query(
      categoriasRef,
      where("userid", "==", user),
      orderBy("limite", "desc"),
      limit(5)
    );
    const categoriasData = await getDocs(q);
    if (categoriasData.empty) {
      dispatch(getCategoriesSuccess([]));
      return;
    }
    const categoriasArray = [];
    categoriasData.forEach((doc) => {
      const data = {
        id: doc.id,
        nombre: doc.data().nombre,
        limite: doc.data().limite,
        gastos: doc.data().gastos,
      };
      categoriasArray.push(data);
    });
    dispatch(getCategoriesSuccess(categoriasArray));
  } catch (error) {
    console.log(error);
    dispatch(getCategoriesFailure(error.message));
  }
};

export default categoriesSlice.reducer;
