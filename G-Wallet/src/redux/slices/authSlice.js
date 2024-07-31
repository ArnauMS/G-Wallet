import { createSlice } from "@reduxjs/toolkit";
import { auth, firestore } from "../../firebase/index";
import { doc, setDoc, getDoc } from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Estado inicial de nuestro estado de autorización
const initialState = {
  user: null,
  isLoading: false,
  error: "",
};

// Slice => Esto nos proporciona las acciones (action) y los reducers.
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = "";
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    signUpStart(state) {
      state.isLoading = true;
      state.error = "";
    },
    signUpSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
    },
    signUpFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutSuccess(state) {
      state.user = null;
    },
    logoutFailure(state, action) {
      state.error = action.payload;
    },
  },
});

// Exportamos las funciones como acciones a ejecutar con dispatch()
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signUpStart,
  signUpFailure,
  signUpSuccess,
  logoutSuccess,
  logoutFailure,
} = authSlice.actions;

// Clousere => Función login asincrona
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginStart());

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user.uid;

    dispatch(loginSuccess(user));
  } catch (error) {
    console.error(error);
    dispatch(loginFailure(error.message));
  }
};

// Clousere => Función login con cuenta de Google via popup asincrona
export const loginGoogle = () => async (dispatch) => {
  try {
    dispatch(loginStart());

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user.uid;

    dispatch(loginSuccess(user));


    const userId = userCredential.user.uid;
    const userDoc = doc(firestore, "Usuarios", userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      const userData = {
        nombre: userCredential.user.displayName,
        email: userCredential.user.email,
        gastos: 0,
        saldo: 0,
        grupos: [],
        gastos_individuales: [],
        invitaciones: [],
      };
      await setDoc(doc(firestore, "Usuarios", userId), userData);
    } else {
      dispatch(loginSuccess(user.user.uid));
    }
    
  } catch (error) {
    console.error(error);
    dispatch(loginFailure(error.message));
  }
};

export const registerGoogle = () => async (dispatch) => {
  try {
    dispatch(signUpStart());

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential;

    dispatch(signUpSuccess(user.accessToken));

    const userId = userCredential.user.uid;
    const userDoc = doc(firestore, "Usuarios", userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      const userData = {
        nombre: userCredential.user.displayName,
        email: userCredential.user.email,
        gastos: 0,
        saldo: 0,
        grupos: [],
        gastos_individuales: [],
        invitaciones: [],
      };
      await setDoc(doc(firestore, "Usuarios", userId), userData);
    } else {
      dispatch(loginSuccess(user.user.uid));
    }
  } catch (error) {
    console.error(error);
    dispatch(signUpFailure(error.message));
  }
};

// Clousere => Función signUp asincrona
export const signUp = (email, password, name) => async (dispatch) => {
  try {
    dispatch(signUpStart());

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    dispatch(signUpSuccess(userId));

    const userDoc = doc(firestore, "Usuarios", userId);
    const userSnapshot = await getDoc(userDoc);
    if (!userSnapshot.exists()) {
      const userData = {
        nombre: name,
        email: email,
        gastos: 0,
        saldo: 0,
        grupos: [],
        gastos_individuales: [],
        invitaciones: [],
      };
      await setDoc(doc(firestore, "Usuarios", userId), userData);
    }
  } catch (error) {
    console.log(error);
    dispatch(signUpFailure(error.message));
  }
};

// Clousere => Función signOut asincrona
export const logout = () => async (dispatch) => {
  try {
    await signOut(auth);

    dispatch(logoutSuccess());
  } catch (error) {
    console.error(error);
    dispatch(logoutFailure(error.message));
  }
};

export default authSlice.reducer;
