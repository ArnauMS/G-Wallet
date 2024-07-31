// React-Toolkit & React-Redux
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { combineReducers } from "@reduxjs/toolkit";
// Reducers
import authReducer from "../slices/authSlice";
import groupsReducer from "../slices/groupsSlice";
import expensesReducer from "../slices/expensesSlice";
import categoriesReducer from "../slices/categoriesSlice";
import individualReducer from '../slices/individualSlice';
// Redux-Persist
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

// Nos proporciona un estado global persistente con la key: auth
const userPersistConfig = {
  key: "auth",
  storage,
  blacklist: ["groups", "expenses", "individual"],
};

const groupsPersistConfig = {
  key: "groups",
  storage,
  blacklist: ["auth", "expenses", "individual"],
};

const expensesPersistConfig = {
  key: "expenses",
  storage,
  blacklist: ["auth", "groups", "individual"],
};

const categoriesPersistConfig = {
  key: "categories",
  storage,
  blacklist: ["auth", "groups", "expenses"],
};

const individualPersistConfig = {
  key: "individual",
  storage,
  blacklist: ["auth", "groups", "expenses"],
}
// Nos proporciona un reducer persistente e inmutable
const persistedUser = persistReducer(userPersistConfig, authReducer);
const persistedGroups = persistReducer(groupsPersistConfig, groupsReducer);
const persistedIndivudal = persistReducer(individualPersistConfig, individualReducer);
const persistedExpenses = persistReducer(
  expensesPersistConfig,
  expensesReducer
);
const persistedCategories = persistReducer(
  categoriesPersistConfig,
  categoriesReducer
);

// Combina los reducers
const rootReducer = combineReducers({
  auth: persistedUser,
  groups: persistedGroups,
  expenses: persistedExpenses,
  categories: persistedCategories,
  individual: persistedIndivudal,
});

// Configuración de nuestra store (estado global)
export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk], // Middleware actua al llamar a funciones asincronas de nuestros slices
  devTools: true, // Extensión Redux-React de nuestro navegador para controlar el estado
});

// Creamos en store persistente
export const persitedStorage = persistStore(store);